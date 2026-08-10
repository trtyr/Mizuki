---
title: 给 AI 助手接上高德地图：四个坑与一次 IPv6 悬案
published: 2026-08-10
description: 想让 AI 助手能查路线、搜附近、估打车费，给它接了高德地图。本以为套个 REST API 的事，结果被四个坑卡住——骑行接口在 v3 根本不存在、Node 调高德总是 ETIMEDOUT 但 curl 却秒回（IPv6 悬案）、驾车的 strategy 参数不给你多方案、POI 模糊匹配会"沾边"。记录每个坑的定位过程和解法。
category: 技术
tags:
  - AI
  - Agent
draft: false
---

我的 AI 助手（Hermes，接在 Telegram 上当私人助手）什么都能聊，但有类问题它一直哑火：

> "附近有什么好吃的川菜？"
> "从这儿打车到机场多少钱？"
> "最快怎么过去？"

它自带一个地图 skill，可底层是 OpenStreetMap，在中国约等于没有。于是给它接了高德。本以为就是套一层 REST API 的活儿，结果被坑得从椅子上坐起来好几次。

这篇文章记的就是这几个坑，和定位它们的过程。如果你也要在国内给程序接高德地图，大概率会撞上同一堵墙。

---

## OpenStreetMap 在中国为什么不行

先说为什么非得换。Hermes 那个自带的 `maps` skill 其实挺优雅——Nominatim 做地理编码、Overpass 找 POI、OSRM 算路线，全免费、不要 key、纯 Python 标准库。在欧洲和北美，它足够好。

但在中国，它的 POI 覆盖稀疏得让人想笑：搜"附近的星巴克"能漏掉一半；没有实时路况，驾车导航不知道堵不堵；公交数据跨城市几乎为零；至于打车估价——OSM 生态里压根没这东西。

国内能打的就高德和百度。高德开放平台 Web 服务 API 每天免费 30 万次、QPS 3000，对个人助手绰绰有余。就它了。

我想要的能力不复杂：路线规划（多出行方式）、POI 搜索、打车估价、批量测距、画张标注好的地图图片发回聊天。装了个 skill 把这些包进去，剩下的就是调通 API。

然后就是一连串的"诶？"。

---

## 坑一：骑行接口，v3 根本不存在

加骑行路线那天，照着 v3 的方向接口文档调：

```text
GET /v3/direction/bicycling?origin=...&destination=...&key=...
```

返回 `10002`。服务不存在。

我盯着这个 `10002` 看了一会儿，第一反应是 key 的权限不对，或者 endpoint 拼错了。回去翻文档——v3 的方向接口页面里，明晃晃挂着驾车、步行、公交、骑行四兄弟，bicycling 看着就该在 v3。

可它就是 10002。

又翻了一阵，才在一个不起眼的角落发现：**骑行路线只在 v5 里**。endpoint 是 `/v5/direction/bicycling`，而且字段结构跟 v3 还不完全一样——多方案走 `alternative_route` 参数，耗时走 `show_fields=cost`。

高德的文档没有一个地方显眼地告诉你"骑行请去 v3 换 v5"，它只是把 v3 的方向页面摆在那儿，让你以为四兄弟都齐了，实际一调发现骑行是空的。

> 这是高德 API 的第一个心法：**同一能力散落在 v3 / v5 / v7 三个版本里，不是平滑升级，而是并存 + 各缺一角。** 调不通，先怀疑版本号。

---

## 坑二：strategy 参数骗了你

驾车方向接口有个 `strategy` 参数，取值像 `fastest / shortest / no-highway`。看名字，你大概会以为：设成 `fastest`，它就给你几条"最快的路线"供选择。

**不是。** 实测 v3 和 v5，`strategy` 怎么设，**永远只返回 1 条路线**。它只是决定"在所有可能里挑哪一条"，不会因为你要"最快"就多吐两条备选。

想要 2-3 条备选方案，得用 v5 另一个参数 `alternative_route`：

```text
strategy=fastest            →  1 条（最快的）
alternative_route=2         →  2 条备选
```

这两个是正交的——`strategy` 管"按什么标准挑"，`alternative_route` 管"给几条"。名字都叫得像路线相关，实际语义跟直觉完全相反。

这种"参数名暗示了它没有的功能"的坑最烦，因为你不会去查证一个"看起来很合理"的参数，只会纳闷"怎么永远只有一条路"。

---

## 坑三：Node 调高德超时，curl 却秒回

这是最折腾的一个，也是个值得一提的悬案。

症状很诡异。同一个高德 URL：

```bash
curl 'https://restapi.amap.com/v3/geocode/geo?address=北京&key=...'
# 秒回，正常 JSON ✅

node scripts/poi_search.js --keyword "长亭科技" --city "上海"
# 错误:                  ← 空的错误消息，连原因都没有
```

`curl` 能通，`node` 超时。同一台机器、同一个网络、同一个 key、同一个 URL。

第一反应当然是怀疑自己：key 配错了？被限流了？还是脚本把异常吞了？

key 没问题（curl 都能用），也没到 QPS 上限。那就是脚本吞异常——它 `catch` 了之后只 print 了个空的"错误:"，真正的 stack trace 被吃掉了。我绕开脚本，用 `node -e` 直接调里面的函数：

```bash
node -e "require('./scripts/poi_search.js').search('长亭科技','上海').catch(e=>console.error(e))"
```

这下真错误冒出来了：

```text
AggregateError [ETIMEDOUT]
```

网络层超时。可 curl 明明秒回啊。

接下来就是漫长的怀疑链。我查了 DNS、查了防火墙、重启过网络、甚至怀疑过高德对 server-side 请求做了 UA 识别。全都不是。

直到有天灵光一闪——**IPv6**。

这台机器的 IPv6 路由其实是不通的（很多云服务器、很多家用网络都这样，IPv6 配了但出不了网）。问题在于 `curl` 和 `node` 对 IPv6 的态度完全不同：

- `curl` 的 happy eyeballs 实现保守，默认 IPv4 优先，于是走 v4，秒回
- `node`（Node 22+）的 happy eyeballs 更激进，**会优先尝试 IPv6**，等 v6 超时才回退 v4——而高德的 AAAA 记录在这台机器上根本连不通，于是 ETIMEDOUT

同一个域名，`curl` 解析到 v4 就走了，`node` 先去啃 v6 那个啃不动的骨头。表现就是"curl 行 node 不行"。

修复得改**两处**，少一处都不行：

```javascript
const dns = require('dns');
// 1. 全局 DNS 解析顺序改成 IPv4 优先
dns.setDefaultResultOrder('ipv4first');

// 2. 每个 https.get 显式钉死 IPv4
https.get(url, { family: 4 }, (res) => { /* ... */ });
```

为什么两处都要？因为 Node 24 的 happy eyeballs 很倔——就算设了 `ipv4first`，它仍然会在某些代码路径上偷偷试一下 IPv6。只有给每个 `https.get` 显式传 `{ family: 4 }` 才彻底堵死。光加 `dns.setDefaultResultOrder` 不够，这是这个坑最阴险的地方，我改第一处的时候以为搞定了，跑起来还是超时，又查了半小时才补上第二处。

> 两个诊断技巧送给你：
> 一是脚本吞异常时，别在脚本里加 print，直接 `node -e "require('xxx').fn().catch(e=>console.error(e))"`，能把包在 Promise rejection 里的 `AggregateError` 原样打出来。
> 二是遇到"`curl` 行 `node` 不行"，**第一反应就查 IPv6**——`curl -4` 和 `curl -6` 分别试一下，哪个不通一目了然，比我在那儿查防火墙快多了。

---

## 坑四：POI 会"沾边"匹配

这个坑不像前面那么刺激，但很容易坑到你不知道。

用地理编码搜一个公司简称：

```bash
node scripts/poi_search.js --keyword "长亭科技"
```

高德不会告诉你"查不到"，它会**猜**——把"长亭科技"全国范围解析到了一个在上海的位置，根本不是你要的那家。简称在它眼里歧义太大。

缓解办法是加个城市锚定，再用 POI 全文搜索兜底：

```bash
node scripts/poi_search.js --keyword "长亭科技" --city "北京"
```

但这招对**垃圾关键词**失效。我试过搜一个根本不存在的"不存在的地址xyz123"，高德不报无结果，而是模糊匹配到一个名字沾边的 POI——返回了"不存驿站"。

这是高德模糊匹配的固有行为，没法从客户端根治。只能在使用时心里有数：**真实地址不受影响，但垃圾词会被"沾边"匹配**。如果你的程序逻辑是"搜不到就报错"，这里会漏——它永远"搜得到"，只是搜到个莫名其妙的东西。

---

## 顺带：火星坐标

调高德必须知道一件事：**它用 GCJ-02（俗称"火星坐标"），不是 GPS 的 WGS-84**。直接拿 GPS 原始经纬度喂进去，定位会偏几百米。

这不是 bug，是国内测绘合规要求的坐标加密。所以从 GPS 硬件、百度地图（BD-09）、图吧来的坐标，都要先转一道：

```text
WGS-84 (GPS)   →  --coordsys gps
BD-09  (百度)  →  --coordsys baidu
```

从外部系统接坐标进高德，先过坐标转换，这是国内地图开发的"新手第一坑"。

---

## 写在最后

给 AI 助手接个地图，本以为半天的事，实际在 API 版本碎片、IPv6、参数语义、坐标系上各栽了一跤。几条经验留给同样要接高德的人：

1. **调不通先查版本号。** v3/v5/v7 并存且各缺一角，文档还互相不引用，同一能力的 endpoint 可能只在某个版本里存在。
2. **Node + 国内 API，警惕 IPv6。** Node 22+ 的 happy eyeballs 会优先试 IPv6，而国内大量机器的 v6 路由是断的——表现为 node 超时、curl 正常。`ipv4first` + 每个 `https.get` 传 `{ family: 4 }`，两处都要改。
3. **`strategy` ≠ 多方案。** 高德驾车方向默认只给 1 条，要多方案走 `alternative_route`，别被参数名骗了。
4. **POI 简称加城市锚定。** 否则被全国歧义解析到错地方；垃圾词会被"沾边"匹配，无法根治。
5. **外部坐标先转 GCJ-02。** GPS 直灌偏几百米。

接完之后，助手终于能答上"附近有什么好吃的"了。回过头看，那几个坑里藏的都不是高德的 bug，而是国内基础设施和海外默认行为的那层"水土不服"——IPv6 那个尤其典型。记住这层差异，后面接别的国内 API 也能少走点弯路。
