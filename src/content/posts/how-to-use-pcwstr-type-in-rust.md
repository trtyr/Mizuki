---
title: 如何在 Rust 中使用 PCWSTR 类型
published: 2025-10-17
description: 本文介绍了在 Rust 中如何将 &str 或 String 类型的变量转换为 Windows API 所需的 PCWSTR 类型，特别是在 w! 宏不适用的情况下。
tags: [Rust, Windows]
category: 编程技术
draft: false
---

## 前言

在 Windows 中有这么一个常见的类型：`PCWSTR` 类型，这是一个指向 16 位 Unicode 字符的常量以 null 结尾的字符串的指针。该类型在 `windows-rs` Crate 很多地方都被使用，比如说 `MessageBoxW`

```Rust
pub unsafe fn MessageBoxW<P1, P2>(
    hwnd: Option<super::super::Foundation::HWND>,
    lptext: P1,
    lpcaption: P2,
    utype: MESSAGEBOX_STYLE,
) -> MESSAGEBOX_RESULT
where
    P1: windows_core::Param<windows_core::PCWSTR>,
    P2: windows_core::Param<windows_core::PCWSTR>,
```

可以看到 `P1` 和 `P2` 是 `PCWSTR` 类型，**分别**作为文本内容和窗口标题。

正常处理字面量的时候，我们可以用 `w!` 来直接转化。

```Rust
use windows::Win32::UI::WindowsAndMessaging::MessageBoxW;
use windows::core::w;

fn main() {
    unsafe {
        MessageBoxW(
            None,
            w!("Hello World!"),
            w!("title"),
            windows::Win32::UI::WindowsAndMessaging::MESSAGEBOX_STYLE(0),
        )
    };
}
```

:::important
`w!` 宏只能接受字面量，不能接受变量。因此，我们无法通过 `w!` 对变量进行自动转换。
:::

```Rust
use windows::Win32::UI::WindowsAndMessaging::MessageBoxW;
use windows::core::w;

fn main() {
    let text = "Hello World!";
    let caption = "title";

    unsafe {
        MessageBoxW(
            None,
            w!(text),
            w!(caption),
            windows::Win32::UI::WindowsAndMessaging::MESSAGEBOX_STYLE(0),
        )
    };
}
```

这样就会报错

```powershell
error: no rules expected `text`
  --> src\main.rs:11:16
   |
11 |             w!(text),
   |                ^^^^ no rules expected this token in macro call
   |
note: while trying to match meta-variable `$s:literal`
  --> D:\Env\Rust\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\windows-strings-0.5.1\src\literals.rs:12:6
   |
12 |     ($s:literal) => {{
   |      ^^^^^^^^^^
```

所以说，我们需要将 `&str` 或者 `String` 类型，变成 `PCWSTR` 类型。

## 转换为 PCWSTR 类型

根据数据类型的定义，我们大体操作应该为

1. 将 Rust 默认的 `UTF-8` 编码变成 `UTF-16` 编码
2. 将 `UTF-16` 编码的结果，后面加入 C 语言的终止符，即 `\0`
3. 把 `UTF-16` 编码并添加了 null 终止符的缓冲区转换成 `PCWSTR` 类型

具体的实现如下

```Rust
fn transform_to_pcwstr(context: &str) -> PCWSTR {
    // 第一步，将 context 变成 UTF-16 类型
    let mut utf16: Vec<u16> = context.encode_utf16().collect();

    // 第二步，在后面加入 `\0` null终止符
    utf16.push('\0' as u16);

    // 第三步，变成 PCWSTR 类型
    let pcwstr = PCWSTR::from_raw(utf16.as_mut_ptr());

    pcwstr
}
```

:::caution[生命周期问题]
这个实现虽然简单，但有一个问题：返回的 `PCWSTR` 是一个指向函数内部 `Vec<u16>` 的裸指针。当函数返回后，`Vec` 会被销毁，导致指针悬空，引发未定义行为。
:::

```Rust
use windows::Win32::UI::WindowsAndMessaging::MessageBoxW;
use windows::core::PCWSTR;

fn main() {
    let text = "Hello World!";
    let caption = "title";

    unsafe {
        MessageBoxW(
            None,
            PCWSTR::from_raw(create_wide_string(text).as_ptr()),
            PCWSTR::from_raw(create_wide_string(caption).as_ptr()),
            windows::Win32::UI::WindowsAndMessaging::MESSAGEBOX_STYLE(0),
        )
    };
}

fn create_wide_string(s: &str) -> Vec<u16> {
    s.encode_utf16().chain(std::iter::once(0)).collect()
}
```

但是不够优雅，我们直接把 `MessageBoxW` 封装起来。

```Rust
use windows::Win32::UI::WindowsAndMessaging::MessageBoxW;
use windows::core::PCWSTR;

fn main() {
    let text = "Hello World!";
    let caption = "title";
    show_message_box(text, caption);
}

fn show_message_box(text: &str, caption: &str) {
    let text_wide = create_wide_string(text);
    let caption_wide = create_wide_string(caption);

    unsafe {
        MessageBoxW(
            None,
            PCWSTR::from_raw(text_wide.as_ptr()),
            PCWSTR::from_raw(caption_wide.as_ptr()),
            windows::Win32::UI::WindowsAndMessaging::MESSAGEBOX_STYLE(0),
        );
    }
}

fn create_wide_string(s: &str) -> Vec<u16> {
    s.encode_utf16().chain(std::iter::once(0)).collect()
}
```
