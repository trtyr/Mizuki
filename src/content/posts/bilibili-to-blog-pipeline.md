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
- 工具：`bilibili-subtitle-fetch`（Python CLI）、Pi coding agent

### 1.2 Windows 台式机（远程 ASR）

- AMD Ryzen 7 5800H / 16GB 内存
- 负责：无字幕视频的语音转文字
- 通过 内网 组网，IP `<内网IP>`，SSH 密码认证（用户 `<用户>`）
- 预装：Python 3.14.7、uv 0.12.3、ffmpeg
- ASR 运行时：SenseVoiceSmall (FunASR llama.cpp) + FSMN-VAD

### 1.3 为什么需要两台机器

M1 的 8GB 内存在日常使用中就常年被 Chrome + OrbStack + 各种工具吃满，实际空闲不到 300MB。跑 3 小时的音频转写完全不可能——Faster-Whisper tiny 模型加载后直接 OOM。16GB 的 Windows 机器空闲 8GB+，绰绰有余。

连接方式：内网 打洞，Windows 上开 OpenSSH Server。建议直接用原生 `ssh` 命令——某些封装的 SSH 客户端对 Windows cmd.exe 兼容性不好。

---

## 二、整体架构

```
┌─────────────────────────────────────────────────┐
│                    B 站视频链接                    │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
     ┌───────────────────────────────┐
     │  bilibili-subtitle-fetch skill │
     │  Step 1: 尝试直接拉字幕         │
     │    ├─ 有字幕 → 秒出，走 Mac      │
     │    └─ 无字幕 → 判断语种          │
     │         ├─ 中文 → Windows ASR   │
     │         └─ 英文 → Mac ASR       │
     └───────────────┬───────────────┘
                     │
                     ▼
     ┌───────────────────────────────┐
     │  bilibili-video-analysis skill │
     │  Step 1: 逐段通读字幕做笔记      │
     │  Step 2: 搜索引用 + 补充代码     │
     │  Step 3: 结构化写作             │
     │  Step 4: 输出到 Wiki            │
     │  Step 5: 回字幕逐项验证         │
     └───────────────────────────────┘
```

两条 skill 各司其职。字幕 skill 完成后**询问用户**是否创建长任务追踪分析流程。

---

## 三、字幕获取：先判后跑

### 3.1 执行流程

字幕 skill 的核心是判断逻辑——能用已有字幕就绝不多跑一秒 ASR：

```bash
# Step 1: 尝试直接拉字幕（stdout 和 stderr 必须分离）
bilibili-subtitle-fetch fetch --no-clipboard --output-format text \
  "https://www.bilibili.com/video/BV1xm42137Y8/" \
  > /tmp/bilibili_subtitle_BV1xm42137Y8.txt \
  2>/tmp/bilibili_subtitle_BV1xm42137Y8.log

# Step 2: 判断结果（跳过 INFO 日志行）
grep -v -E '^\[.*\] (INFO|WARNING|ERROR)' \
  /tmp/bilibili_subtitle_BV1xm42137Y8.txt | head -5
```

**注意：** `2>&1` 会把 INFO 日志混进字幕文本。我们第一版就犯了这个错——日志行就撑过了 `wc -l > 5` 的检查。改为 `2>` 分离后，判断用 `grep -v` 跳过日志行。

### 3.2 Windows 远程 ASR 执行流程

对于无字幕的中文视频，走 Windows SenseVoiceSmall：

```bash
# 传脚本
scp scripts/bilibili_sensevoice.py \
  <用户>@<内网IP>:C:\Users\<用户>\pi-asr\scripts\

# 通过 Agent 的异步后台任务工具远程执行
ssh <用户>@<内网IP> \
    'chcp 65001 >nul && set PYTHONIOENCODING=utf-8 && \
     python C:\Users\<用户>\pi-asr\scripts\bilibili_sensevoice.py \
     BV1xm42137Y8 -o C:\Users\<用户>\pi-asr\output\BV1xm42137Y8_sensevoice.txt'

# 拉回字幕
scp "<用户>@<内网IP>:C:/Users/<用户>/pi-asr/output/BV1xm42137Y8_sensevoice.txt" /tmp/
```

异步后台执行，完成后自动通知，不阻塞主流程。

Windows SSH 有两个固定坑位：

- **编码：** cmd.exe 默认 GBK，Mac 终端 UTF-8。每条命令前加 `chcp 65001 >nul`
- **PATH：** 非交互式 SSH 不加载用户 PATH。Python/uv/ffmpeg 全加入系统 PATH（`HKLM\SYSTEM\...\Environment`）

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

### 4.4 但我们没直接用二进制

因为音频需要从 M4A 转 WAV（SenseVoice 只支持 wav/mp3/flac）。我写了个 Python wrapper（`scripts/bilibili_sensevoice.py`）：

```python
def transcribe(audio_path: str, out_path: str) -> None:
    # Step 1: ffmpeg 转码
    subprocess.run(
        ["ffmpeg", "-y", "-i", audio_path,
         "-ar", "16000", "-ac", "1", wav_path],
        check=True, capture_output=True,
    )
    # Step 2: SenseVoiceSmall 转录
    result = subprocess.run(
        [binary, "-m", model, "--vad", vad, "-a", wav_path],
        capture_output=True, text=True,
        encoding="utf-8", errors="replace",
    )
    # Step 3: 保存结果
    Path(out_path).write_text(result.stdout.strip(), encoding="utf-8")
```

中间踩过一个 GBK 编码坑——`subprocess.run` 默认用系统编码解析输出，Windows 上用 GBK 解析含有中文 emoji 的 UTF-8 输出直接炸了。加了 `encoding="utf-8", errors="replace"` 解决。

---

## 五、深度分析：把视频变成文章

### 5.1 核心约束

这个 skill 反复打磨了三次才找到正确的定位。

**第一版：** 把文章写成了"独立教程"——视频讲 Rust 概述和类型系统，我扩展成了一整套嵌入式 Rust 教程，加了 Embassy、RTIC 等视频完全没提的东西。被用户骂醒。

**第二版：** 矫枉过正，变成了"视频笔记"——大量"主讲人说""他举了个例子"，读者看到的是一份观后感而非知识文档。

**第三版（最终）：** **让文字等价于视频。** 视频讲什么，文章写什么。主讲人一笔带过的概念（比如"这个 trait 标准叫 embedded-hal"），搜索补充 2-3 句解释，目的是让读者能跟上论证——不是把那概念变成独立科普。

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
.pi/agent/skills/
├── bilibili-subtitle-fetch/
│   ├── SKILL.md                          # 获取字幕的完整流程
│   └── scripts/
│       ├── bilibili_sensevoice.py        # SenseVoiceSmall wrapper
│       └── bilibili_moonshine.py         # Moonshine 备选
│
└── bilibili-video-analysis/
    └── SKILL.md                          # 分析写作 + 验证步骤
```

---

## 九、总结

这条流水线的核心设计原则只有两条：

1. **先判后跑。** 有字幕绝不跑 ASR。需要 ASR 时选最优方案，不在 Mac 上硬撑
2. **验证是写文章的一部分。** 不是写完了就完了——必须回字幕逐项核对，补到零遗漏

两台机器、两条 skill、一个 ASR 运行时、一个后台任务管理工具。

## 补充说明

**SSH 工具兼容性。** 某些封装的 SSH 客户端对 Windows cmd.exe 兼容性不好，建议直接用原生 `ssh` 命令。

**ONNX 不适用。** Moonshine 有 ONNX 版本但导出的模型缺 KV cache，`use_cache=True`、`export=True` 等参数均无法修复——查了 optimum 的 GitHub issue 确认是已知限制。且 ONNX 相比 PyTorch 提速有限，不值得折腾。
