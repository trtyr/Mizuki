---
title: API Hammering
published: 2025-11-22
description: API Hammering 反沙箱技术
tags: [Windows, Rust, 反沙箱]
category: 网络安全
draft: false
---

API Hammering 是一种反沙箱技术，其核心思想为：延迟执行。如果程序能在此刻保持静默，等到沙箱超时停止分析后再运行恶意代码，就能成功绕过检测。

## 从 Sleep 到 API Hammering

最经典的延迟技术莫过于 `sleep` 函数。然而，随着沙箱技术的迭代，单纯的休眠已不再有效。

:::caution[为什么 Sleep 不再有效？]
现代沙箱引擎通常会对 `Sleep`、`NtDelayExecution` 等时间相关的 API 进行 Hook。

当沙箱监测到程序调用 `sleep(300)` 时，它不会真的傻等 5 分钟，而是直接修改指令指针或系统时间，让程序认为时间已经到了，从而瞬间跳过休眠期。
:::

既然 `sleep` 会被快进，那能不能用循环来消耗时间？比如写一个死循环让 CPU 空转？理论上是可以的，那么我们可不可以使用算数循环呢？

答案通常是否定的，原因在于编译器优化和沙箱的启发式检测：

:::warning[纯算术循环的缺陷]
1. 编译器层面：现代编译器（如 LLVM/GCC）非常智能。如果一个循环只进行计数（如 `i++`）而没有实质性的状态改变，编译器会判定这是"死代码"，在编译阶段直接将其优化删除，导致延迟失效。

2. 沙箱层面：即使编译通过，当沙箱监测到 CPU 在反复执行几行纯数学运算的汇编指令，且内存/系统状态无变化时，会判定为"无效空转"。沙箱引擎会直接停止模拟这些指令，将 CPU 计数器强制拨到循环结束的位置，再次实现"快进"。
:::

### 什么是 API Hammering

为了解决上述问题，我们需要一种既能消耗时间，又无法被编译器优化，且沙箱不敢轻易跳过的循环。这就是 API Hammering。

:::note[核心原理]
API Hammering 指的是在循环中反复调用复杂的、合法的 Windows API。

-   真实性：由于 API 调用涉及系统内核交互、，改变了系统状态或读取了系统信息，沙箱很难判定这是"无效代码"。
-   不可跳过：沙箱如果直接跳过这些 API，可能会导致程序上下文缺失或崩溃。为了保证模拟的准确性，沙箱不得不老老实实地执行每一个 API 调用，从而实打实地消耗了时间。
:::

---

## 代码实现（Rust 示例）

为了演示效果，我们使用 Rust 编写一个简单的程序。

### MessageBox 弹窗

如果不加任何混淆，直接调用 `MessageBox`，沙箱会瞬间执行并捕获该行为。

```rust
// #![windows_subsystem = "windows"]

use windows::core::{w, PCWSTR};
use windows::Win32::System::SystemInformation::{GetSystemInfo, SYSTEM_INFO};
use windows::Win32::UI::WindowsAndMessaging::{MessageBoxW, MB_OK};

fn message_box(code: u16) {
    let text = format!("请求状态码: {}", code);
    let wide_text: Vec<u16> = text.encode_utf16().chain(std::iter::once(0)).collect();
    unsafe {
        MessageBoxW(
            None,
            PCWSTR::from_raw(wide_text.as_ptr()),
            w!("测试标题"),
            MB_OK,
        );
    };
}

fn request() -> u16 {
    let url = "https://x.threatbook.com/";
    let response = reqwest::blocking::get(url).unwrap();
    response.status().as_u16()
}

fn main() {
    let code = request();
    message_box(code);
}
```

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/API%20Hammering-1.png" alt="API Hammering-1" width="800" />

### 加入 API Hammering

我们在执行 Payload 之前，插入一个 `api_hammering` 函数。这里选择 `GetSystemInfo` 作为 `Hammering` 对象。

```rust
// #![windows_subsystem = "windows"]

use windows::core::{w, PCWSTR};
use windows::Win32::System::SystemInformation::{GetSystemInfo, SYSTEM_INFO};
use windows::Win32::UI::WindowsAndMessaging::{MessageBoxW, MB_OK};

fn message_box(code: u16) {
    let text = format!("请求状态码: {}", code);
    let wide_text: Vec<u16> = text.encode_utf16().chain(std::iter::once(0)).collect();
    unsafe {
        MessageBoxW(
            None,
            PCWSTR::from_raw(wide_text.as_ptr()),
            w!("测试标题"),
            MB_OK,
        );
    };
}

fn api_hammering() {
    let mut si = SYSTEM_INFO::default();
    for i in 0..99999 {
        unsafe { GetSystemInfo(&mut si) }
        println!("{}", i)
    }
}

fn request() -> u16 {
    let url = "https://x.threatbook.com/";
    let response = reqwest::blocking::get(url).unwrap();
    response.status().as_u16()
}

fn main() {
    api_hammering();
    let code = request();
    message_box(code);
}
```

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/API%20Hammering-2.png" alt="API Hammering-2" width="675" />

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/API%20Hammering-3.png" alt="API Hammering-3" width="875" />

可以看到，数到 23191 的时候沙箱分析就结束了，根本没跑完我们的 `99999`
