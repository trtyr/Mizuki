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


既然 `sleep` 会被快进，那能不能用循环来消耗时间？比如写一个死循环让 CPU 空转？理论上是可以的，那么我们可不可以使用算数循环呢？

答案通常是否定的，原因在于编译器优化和沙箱的启发式检测：


### 什么是 API Hammering

为了解决上述问题，我们需要一种既能消耗时间，又无法被编译器优化，且沙箱不敢轻易跳过的循环。这就是 API Hammering。


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
