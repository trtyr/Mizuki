---
title: 把 B 站视频变成深度文章：一条完整的 AI 辅助流水线
published: 2026-08-09
description: 从 B 站视频链接到深度技术文章的全自动流水线：字幕获取、ASR 方案选型（SenseVoiceSmall）、AI 辅助分析与验证、博客发布。含环境配置、架构设计和踩坑记录。
category: 技术
tags:
  - AI
  - Rust
  - 编程语言
draft: false
---

我搭建了一条流水线：输入一个 B 站视频链接，输出一篇结构清晰、补充了代码示例和引用出处的深度技术文章。这篇文章就是这条流水线本身的文档——包括环境、关键代码、踩坑记录和效果对比。

---

## 一、环境

### 1.1 MacBook（本地）

- Apple M1 / 8GB 内存（常年 90%+ 占用，Swap 爆炸）
- 负责：拉字幕、分析字幕、写文章
- 工具：`bilibili-fetch`、`audio-transcribe`、`transcript-to-article`（三条 skill）、Pi coding agent

### 1.2 Windows 台式机（远程 ASR）

- AMD Ryzen 7 5800H / 16GB 内存
- 负责：无字幕视频的语音转文字
- 通过 Tailscale 组网（脱敏），SSH 直连
- 预装：Python 3.14、ffmpeg、torch + transformers（Moonshine 依赖）
- ASR 运行时：SenseVoiceSmall (FunASR gguf) + FSMN-VAD；Moonshine（PyTorch，英文引擎）

### 1.3 为什么需要两台机器

M1 的 8GB 内存在日常使用中就常年被 Chrome + OrbStack + 各种工具吃满，实际空闲不到 300MB。跑 3 小时的音频转写完全不可能——Faster-Whisper tiny 模型加载后直接 OOM。16GB 的 Windows 机器空闲 8GB+，绰绰有余。

连接方式：内网 打洞，Windows 上开 OpenSSH Server。建议直接用原生 `ssh` 命令——某些封装的 SSH 客户端对 Windows cmd.exe 兼容性不好。

---

## 二、整体架构

```
                     B 站视频链接
                          │
                          ▼
              ┌────────────────────────┐
              │      bilibili-fetch    │   B站 → 字幕 / 音频
              │   尝试拉官方字幕        │
              │    ├─ 有字幕 → 秒出     │
              │    └─ 无字幕 → 下音频   │
              └────┬───────────────┬───┘
            有字幕  │               │ 无字幕
                   │               ▼
                   │   ┌──────────────────────┐
                   │   │   audio-transcribe    │  任意音频 → 文字
                   │   │   中文 → SenseVoice   │
                   │   │   英文 → Moonshine    │
                   │   └──────────┬───────────┘
                   │              │
                   └──────┬───────┘
                          ▼
              ┌──────────────────────────┐
              │   transcript-to-article   │  任意转录 → 文章
              │  ① 通读，列知识点清单      │
              │  ② 结构化写作 + 搜索补充   │
              │  ③ 回转录逐项验证零遗漏    │
              │  ④ 输出到 Wiki            │
              └──────────────────────────┘
```

**三层解耦，各管一段。** 后两层是通用的——`audio-transcribe` 能转任意音频（不限于 B站），`transcript-to-article` 能吃 YouTube 字幕、播客转录、本地文件。这次（08-10）重构的核心，就是把原来绑死 B站的两条 skill 拆开，让转录和写作变成可独立复用的能力。

---

## 三、字幕获取：bilibili-fetch

`bilibili-fetch` 只做一件事——B站视频拿到「字幕文本」或「音频文件」二选一，**不负责转录**。转录交给下一层的 `audio-transcribe`。

### 3.1 实现：自带 venv，输出契约钉死

第一版用的是外部 Python CLI `bilibili-subtitle-fetch`，判断有没有字幕靠 `2>` 分离 stdout/stderr 再 `grep -v` 跳日志行——脆弱，日志格式一变就失效。重构后 skill 自带 venv（`bilibili-api-python` + `httpx`），用 `Video.get_subtitle`（自动 wbi 签名 + cookie）拉官方字幕，输出契约钉死成两种：

```bash
cd ~/.pi/agent/skills/public/bilibili-fetch

# 拉字幕（脚本内部自动判断有无）
.venv/bin/python scripts/fetch_subtitle.py "BV1xm42137Y8"
```

**输出契约：**

- stdout = 字幕文件绝对路径（默认 `/tmp/bilibili_subtitle_<BV>.txt`）→ ✅ 有字幕
- stdout = `NO_SUBTITLE` → ❌ 无字幕，进步骤 3.2

诊断信息（cid / aid / 字幕条数）全走 stderr，不污染 stdout 的判断。调用方直接看 stdout 是路径还是 `NO_SUBTITLE` 就行，不再靠数行数猜。

> credential 复用 `~/.config/bilibili-subtitle-fetch/config.toml`（`[credential]` 段：sessdata / bili_jct / buvid3 / buvid4 / dedeuserid）。脚本只读静态 cookie，过期就手动更新该文件。

### 3.2 无字幕：audio-transcribe 转录

无字幕时 `bilibili-fetch` 先下音频，再交给 `audio-transcribe`。第一版是手动 `scp` 上传 `bilibili_sensevoice.py` 再 `ssh` 跑，编码、PATH 全要自己处理。重构后封装成一条命令：

```bash
# bilibili-fetch 下音频
.venv/bin/python scripts/download_audio.py "BV1xm42137Y8"   # → /tmp/bilibili_<BV>.m4a

# audio-transcribe 一行转录（脚本内部 scp → ssh → scp 拉回）
bash ~/.pi/agent/skills/public/audio-transcribe/scripts/transcribe_remote.sh \
  /tmp/bilibili_<BV>.m4a
```

stdout 直接输出文本路径（默认 `/tmp/<basename>.txt`），进度日志走 stderr。长音频可以挂后台跑，30 分钟音频约 1-2 分钟（~20x 实时）。

脚本内部把编码和 PATH 的坑都处理掉了，但原理值得记一笔（Windows SSH 的两个固定坑位）：

- **编码：** cmd.exe 默认 GBK，Mac 终端 UTF-8。`transcribe.py` 调用前先 `chcp 65001 >nul`
- **PATH：** 非交互式 SSH 不加载用户 PATH。Python/uv/ffmpeg 全加入系统 PATH（`HKLM\SYSTEM\...\Environment`）

**转录质量先说清楚：** SenseVoiceSmall 输出基本无标点、有少量同音错字（CER 8.17% 的正常水平）、静音段偶尔出乱码幻觉（几句无关的日文假名）。喂给 `transcript-to-article` 写文章前要先清洗——补标点分段、去幻觉段、修明显错字，否则文章质量会被原始文本拖累。

---

## 四、ASR 方案演进：从 Faster-Whisper 到 SenseVoiceSmall

### 4.1 第一回合：Faster-Whisper Tiny（默认方案）

`bilibili-subtitle-fetch` 默认使用 Faster-Whisper tiny（39M 参数），中文 CER 约 **71.1%**。3 小时视频在 M1 上跑了 10 分钟还没出结果——内存不够，Swap 炸了。

### 4.2 第二回合：Moonshine Tiny Zh（27M 参数）

查到 Moonshine 的中文版（27M 参数，CER **29.44%**），比 Whisper Tiny 准确率高 2.4 倍。但从这里开始的踩坑之旅——

**PyTorch 版：** 模型加载成功，但 175 分钟音频生成 1405 个 15 秒片段。Ryzen 5800H 纯 CPU 推理，每片段约 4-5 秒 → **总耗时 85 分钟**。

优化尝试：

- `torch.compile(mode="reduce-overhead")` → 从 2 小时缩短到 85 分钟，提速有限
- `torch.set_num_threads(8)` → 效果不明显
- 批处理（8 chunk/batch）→ MoonshineProcessor 不适配 2D 输入，放弃

**ONNX 版：** HuggingFace 上有 `onnx-community/moonshine-tiny-zh-ONNX`。折腾了一会儿才发现：导出的模型**没有 KV cache 支持**，`model.generate()` 直接报错。而且即使修好了，查阅文档后发现 ONNX 只比 PyTorch 快 10-30%，不是数量级提升。放弃。

### 4.3 第三回合：SenseVoiceSmall（最终方案）

在 FunASR 的 benchmark 页面看到这个数据时我直接从椅子上坐起来了：

| 模型                   | 参数量  | 中文 CER ↓ | 175分音频耗时          |
| ---------------------- | ------- | ---------- | ---------------------- |
| faster-whisper-tiny    | 39M     | 71.1%      | ~30分（但 Mac 跑不动） |
| Moonshine tiny zh      | 27M     | 29.44%     | ~85分                  |
| **SenseVoiceSmall Q8** | 约 200M | **8.17%**  | **~15分**              |

准确率高 3.6 倍，速度快 5.6 倍。而且不是 PyTorch——是 C++ 二进制 + GGUF 量化模型，零 Python ML 依赖。

**部署：** 从 FunASR GitHub Release 下载 Windows 预编译二进制（4.7MB），从 HuggingFace 下载 Q8 量化模型（235MB）和 FSMN-VAD 模型（1.6MB）。一个目录搞定：

```
C:\Users\<用户>\pi-asr\sensevoice\
├── llama-funasr-sensevoice.exe
├── sensevoice-small-q8.gguf
└── fsmn-vad.gguf
```

调用极其简单：

```bash
llama-funasr-sensevoice.exe \
  -m sensevoice-small-q8.gguf \
  --vad fsmn-vad.gguf \
  -a audio.wav
```

不需要 Python 虚拟环境、不需要 PyTorch、不需要 CUDA。单文件二进制，CPU 上 ~20x 实时率。

### 4.4 Moonshine 没丢：降级成英文引擎

Moonshine 中文确实不行（CER 29%，比 SenseVoice 差 3.6 倍），但英文表现 OK，所以没被丢掉——在 `audio-transcribe` 里作为**英文/通用引擎**保留下来，跟 SenseVoice 组成双引擎。

### 4.5 落地：audio-transcribe 的 transcribe.py

SenseVoice 是 C++ 二进制，只吃 wav/mp3/flac，得先用 ffmpeg 把下载的 M4A 转成 16kHz 单声道 WAV。转码 + 调引擎 + 存结果的逻辑封装在 `audio-transcribe` 的 `transcribe.py` 里（双引擎，`--engine sensevoice|moonshine` 切换），Mac 端再套一层 `transcribe_remote.sh` 编排 scp → ssh → scp 拉回。核心还是那个转码 + 调用：

```python
# Step 1: 任意格式 → 16kHz mono WAV（SenseVoice 只吃 wav/mp3/flac）
subprocess.run(
    ["ffmpeg", "-y", "-i", audio_path, "-ar", "16000", "-ac", "1", wav_path],
    check=True, capture_output=True,
)
# Step 2: SenseVoiceSmall 推理
result = subprocess.run(
    [binary, "-m", model, "--vad", vad, "-a", wav_path],
    capture_output=True, text=True, encoding="utf-8", errors="replace",
)
```

第一版踩过一个 GBK 编码坑——`subprocess.run` 默认用系统编码解析输出，Windows 上用 GBK 解析含有中文 emoji 的 UTF-8 输出直接炸了。加了 `encoding="utf-8", errors="replace"` 解决。Moonshine 那条路是 PyTorch + 满窗切片（15s 片段、7.5s 步长），175 分钟音频约 85 分钟，只在英文音频时才走。

---

## 五、深度分析：transcript-to-article

转录文本到手后交给 `transcript-to-article`。这个 skill **来源不限**——B站字幕、YouTube 字幕、ASR 转录、播客都能喂，不绑死 B站。核心哲学只有一句：**让文字等价于源内容。**

### 5.1 核心约束（打磨了三版）

这个 skill 反复打磨了三次才找到正确的定位。

**第一版：** 把文章写成了"独立教程"——视频讲 Rust 概述和类型系统，我扩展成了一整套嵌入式 Rust 教程，加了 Embassy、RTIC 等视频完全没提的东西。被用户骂醒。

**第二版：** 矫枉过正，变成了"视频笔记"——大量"主讲人说""他举了个例子"，读者看到的是一份观后感而非知识文档。

**第三版（最终）：** **让文字等价于源内容。** 源内容讲什么，文章写什么。主讲人一笔带过的概念（比如“这个 trait 标准叫 embedded-hal”），搜索补充 2-3 句解释，目的是让读者能跟上论证——不是把那概念变成独立科普。

### 5.2 验证步骤（关键创新）

这是让文章从"能用"变成"完整"的关键一步。写完文章后：

1. 重新通读字幕，列出视频覆盖的**全部知识点清单**
2. 逐项核对文章中是否覆盖了每一条
3. 发现遗漏 → `edit` 补充
4. 重复到零遗漏

第一条 Rust 视频的验证结果：34 个知识点，第一版覆盖 26 个，遗漏 8 个——包括控制流/函数/表达式/变量遮蔽等视频标题里就写着的主题。补了三千字才通过验证。

### 5.3 补充边界

搜索补充的范围有四条：

1. 主讲人提到但没解释清楚的概念/工具
2. 引用的比喻/金句的原始出处（如"香蕉与大猩猩"→ Joe Armstrong《Coders at Work》2009）
3. 提到但没展示的代码片段
4. 视频花了篇幅讨论但没给出学术名称的概念——这是后来加的。视频花了大量篇幅讲"买东西炫耀"但没提"凡勃伦效应"，补上这个术语不算扩展新知识

---

## 六、效果

### 6.1 效率

| 阶段                   | 耗时       |
| ---------------------- | ---------- |
| 获取字幕（有字幕）     | 2-3 秒     |
| 获取字幕（无字幕/ASR） | ~15 分     |
| 逐段通读（3小时视频）  | ~30 分     |
| 搜索引用 + 补充代码    | ~20 分     |
| 写文章                 | ~15 分     |
| 验证 + 补遗漏          | ~15 分     |
| **总计**（无字幕）     | **~95 分** |
| **总计**（有字幕）     | **~80 分** |

### 6.2 第一篇成品

视频：[The Golden Rust语言 01 — overview, types & values, control flow, function](https://www.bilibili.com/video/BV1xm42137Y8/)（清华邓博士，2 小时 55 分钟）

文章：约 28KB / 14,000 字，8 个章节，34 个知识点全覆盖。ASCII 内存布局图 + Mermaid 架构图 + slint/SQLx 真实代码片段 + Joe Armstrong 原始引用出处。

**成品：** [https://www.<用户名>.top/posts/golden-rust-01-overview-types-control-flow/](https://www.<用户名>.top/posts/golden-rust-01-overview-types-control-flow/)

---

## 七、为什么没有用 Whisper、没有用云端 API

- **OpenAI Whisper API：** 3 小时音频按 $0.006/min = $1.08。钱不多，但上传 170MB 音频 + 等待 + 下载，体验不如本地
- **Groq Whisper API：** 免费额度有限，且同样是云端延迟
- **Faster-Whisper：** 中文 CER 71%，质量太差
- **Moonshine：** 中文 CER 29%，比 Whisper 好但比 SenseVoice 差 3.6 倍，速度慢 5.6 倍
- **SenseVoiceSmall：** 各方面最优解——准确率、速度、部署复杂度、零 PyTorch 依赖

---

## 八、Skills 文件结构

```
~/.pi/agent/skills/public/
├── bilibili-fetch/
│   ├── SKILL.md                          # B站 → 字幕/音频（不转录）
│   ├── .venv/                            # 自带：bilibili-api-python + httpx
│   └── scripts/
│       ├── fetch_subtitle.py             # 拉字幕，输出 路径 / NO_SUBTITLE
│       └── download_audio.py             # 下载音频 m4a
│
├── audio-transcribe/
│   ├── SKILL.md                          # 任意音频 → 文字（通用）
│   └── scripts/
│       ├── transcribe_remote.sh          # Mac 端编排：scp → ssh → scp 拉回
│       └── transcribe.py                 # Windows 端双引擎（SenseVoice / Moonshine）
│
└── transcript-to-article/
    └── SKILL.md                          # 任意转录 → 深度文章（通用）
```

---

## 九、总结

这条流水线核心就三条原则：

1. **先判后跑。** 有字幕绝不跑 ASR。需要 ASR 时选最优方案，不在 Mac 上硬撑
2. **三层解耦。** 拿字幕/音频、转录、写作各自独立——后两层通用化，能服务 B站之外的任意音视频
3. **验证是写文章的一部分。** 不是写完了就完了——必须回转录逐项核对，补到零遗漏

两台机器、三层 skill、一个 ASR 运行时。

## 补充说明

**SSH 工具兼容性。** 某些封装的 SSH 客户端对 Windows cmd.exe 兼容性不好，建议直接用原生 `ssh` 命令。`audio-transcribe` 的 `transcribe_remote.sh` 就是全程 ssh 直连。

**ONNX 不适用。** Moonshine 有 ONNX 版本但导出的模型缺 KV cache，`use_cache=True`、`export=True` 等参数均无法修复——查了 optimum 的 GitHub issue 确认是已知限制。且 ONNX 相比 PyTorch 提速有限，不值得折腾。
