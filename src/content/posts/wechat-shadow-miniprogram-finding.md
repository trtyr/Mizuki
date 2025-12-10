---
title: 微信 "影子小程序" 寻找方法
published: 2025-12-09
description: 介绍如何寻找和访问微信中的"影子小程序"，即无法通过搜索找到但实际存在的小程序，包含查找方法和跳转技术。
tags: [渗透测试,小程序]
category: 工具脚本
draft: false
---

## 微信影子小程序

所谓"影子小程序"，指的是我们明明能在备案里找到，但是却在微信里搜不到。

为什么？主要有如下原因

- 小程序还在审核
- 开发者关闭了"可被搜索"选项
- 内容涉及敏感领域，被平台限制收录
- 仅为内部员工或特定用户开放

这类未公开、不可搜索但实际运行的小程序，我们称之为 "**影子小程序**"。因为他们不会被外界找到，所以这些程序往往缺乏安全意识。

## 怎么找？

尽管小程序运行在微信等封闭生态中，但其后端服务或关联官网几乎都需要完成 ICP 备案。

操作思路：

1. 通过工信部备案系统或第三方平台查询目标企业小程序备案信息；
2. 或者获取其名下所有已备案域名，进行资产收集，检查是否嵌入了小程序跳转功能如 `<wx-open-launch-weapp>` 标签。

我们往往能够查到相关的备案号，如果发现相关备案的小程序，微信寻找不到，那么这个就是所谓的 "影子小程序"

## 怎么跳转？

我们找到了该小程序，然后怎么跳转呢？

微信小程序提供了一个 `# wx.navigateToMiniProgram(Object object)` 接口，该接口的功能为**打开另一个小程序**


相关的参数：

```js
wx.navigateToMiniProgram({
  appId: '',           // 目标身份标识
  path: '',            // 精确定位到具体页面
  extraData: {},       // 跨应用数据通道
  envVersion: 'release', // 环境隔离控制
  shortLink: '',       // 用户友好的链接方式
  noRelaunchIfPathUnchanged: false // 性能优化策略
})
```

示例代码

```js
wx.navigateToMiniProgram({
  appId: '',
  path: 'page/index/index?id=123',
  extraData: {
    foo: 'bar'
  },
  envVersion: 'develop',
  success(res) {
    // 打开成功
  }
})
```

也就是说，只要知道目标的 `appid`，我们就可以直接的进行跳转。

## 获取 Appid

那么如何获取 `appid` 呢

可以用"微信公众号平台" -> "广告与服务" -> "小程序管理" -> "绑定我的自营小程序"，这里我们可以通过**小程序的名称**进行绑定，而这个过程，我们抓包一下，可以看到返回了 appid

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%BE%AE%E4%BF%A1%20%E2%80%9C%E5%BD%B1%E5%AD%90%E5%B0%8F%E7%A8%8B%E5%BA%8F%E2%80%9D%20%E5%AF%BB%E6%89%BE-4.png" alt="获取 Appid" width="1175" />

那么怎么获得影子小程序的名称呢？直接查备案就行

## 如何跳转

我们直接写一个小程序调用这个接口就行了.

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%BE%AE%E4%BF%A1%20%E2%80%9C%E5%BD%B1%E5%AD%90%E5%B0%8F%E7%A8%8B%E5%BA%8F%E2%80%9D%20%E5%AF%BB%E6%89%BE-5.png" alt="如何跳转" width="800" />

## 测试

我们找一个无法被搜索到的小程序，首先，小程序是真实存在的。

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%BE%AE%E4%BF%A1%20%E2%80%9C%E5%BD%B1%E5%AD%90%E5%B0%8F%E7%A8%8B%E5%BA%8F%E2%80%9D%20%E5%AF%BB%E6%89%BE-1.png" alt="小程序存在" width="800" />

但是无法被微信搜索找到。

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%BE%AE%E4%BF%A1%20%E2%80%9C%E5%BD%B1%E5%AD%90%E5%B0%8F%E7%A8%8B%E5%BA%8F%E2%80%9D%20%E5%AF%BB%E6%89%BE-2.png" alt="无法搜索" width="525" />

我们现在假设这个小程序为测试目标，但是我们只知道小程序的名称，但是在微信搜索里搜索不到。这时我们可以拿着小程序的名称，通过微信公众平台的接口进行搜索。

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%BE%AE%E4%BF%A1%20%E2%80%9C%E5%BD%B1%E5%AD%90%E5%B0%8F%E7%A8%8B%E5%BA%8F%E2%80%9D%20%E5%AF%BB%E6%89%BE-3.png" alt="公众平台搜索" width="1000" />

这样我们就得到了该小程序的 `appid`，我们此时就可以用我们的小程序测试了

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%BE%AE%E4%BF%A1%20%E2%80%9C%E5%BD%B1%E5%AD%90%E5%B0%8F%E7%A8%8B%E5%BA%8F%E2%80%9D%20%E5%AF%BB%E6%89%BE-6.png" alt="测试结果" width="800" />

可以看到，弹出了一个指向目标小程序的窗口。我们点击允许就可以访问了。
