---
title: 反微步动态沙箱 - 桌面壁纸路径
published: 2025-10-17
description: 本文介绍了如何使用 Rust 通过检测 Windows 桌面壁纸路径来识别和绕过微步动态沙箱。
tags: [Windows, 反沙箱, Rust]
category: 网络安全
draft: false
---

## 对比壁纸 Hash 值 (失败)

最开始是想要通过对比壁纸 Hash 值来绕过微步沙箱的。主要用的是 `SystemParametersInfoW` 这个 API。

那么我们怎么显示数据呢？

1. 网络请求
2. 弹窗，看截图
3. 保存本地文件为 `<md5值>.txt`

这里使用的是本地文件保存和弹窗，具体的代码如下

```Rust
#![windows_subsystem = "windows"]
use std::fs;
use windows::core::PCWSTR;
use windows::Win32::UI::WindowsAndMessaging::{MessageBoxW, SPI_GETDESKWALLPAPER};
use windows::Win32::UI::WindowsAndMessaging::{
    SystemParametersInfoW, MESSAGEBOX_STYLE, SYSTEM_PARAMETERS_INFO_UPDATE_FLAGS,
};
const MAX_PATH: usize = 260;

fn get_wallpaper_path(length: u32, buffer: &mut Vec<u16>) -> String {
    println!("Getting wallpaper…");
    let get_utf16 = unsafe {
        SystemParametersInfoW(
            SPI_GETDESKWALLPAPER,
            length,
            Some(buffer.as_mut_ptr().cast()),
            SYSTEM_PARAMETERS_INFO_UPDATE_FLAGS(0),
        )
    };

    let wallpaper_path: String = match get_utf16 {
        Ok(T) => {
            let buffer = String::from_utf16_lossy(&buffer);
            buffer.replace("\0", "")
        }
        Err(E) => E.to_string(),
    };

    println!("Wallpaper: {}", wallpaper_path);
    wallpaper_path
}

fn create_wide_string(s: &str) -> Vec<u16> {
    s.encode_utf16().chain(std::iter::once(0)).collect()
}

fn show_message_box(text: &str, caption: &str) {
    let text_wide = create_wide_string(text);
    let caption_wide = create_wide_string(caption);

    unsafe {
        MessageBoxW(
            None,
            PCWSTR::from_raw(text_wide.as_ptr()),
            PCWSTR::from_raw(caption_wide.as_ptr()),
            MESSAGEBOX_STYLE(0),
        );
    }
}

fn get_md5(path: &str) -> String {
    let bytes = fs::read(path).unwrap();
    let md5_digest = md5::compute(bytes);
    let md5_str = format!("{:x}", md5_digest);
    println!("Get MD5: {}", md5_str);
    md5_str.to_string()
}

fn save_file(md5: &str) {
    let name = format!("{}.txt", md5);
    fs::write(&name, md5.as_bytes()).unwrap();
    println!("Saving md5 to {}", name);
}

fn main() {
    let mut buffer: Vec<u16> = vec![0; MAX_PATH];
    let buffer_length = buffer.len() as u32;
    let result = get_wallpaper_path(buffer_length, &mut buffer);
    let caption = "Wallpaper_Path";
    let path_md5 = get_md5(&result);
    save_file(path_md5.as_str());
    show_message_box(path_md5.as_str(), caption);
}

```

本地效果如下

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%8F%8D%E5%BE%AE%E6%AD%A5%E5%8A%A8%E6%80%81%E6%B2%99%E7%AE%B1%20-%20%E6%A1%8C%E9%9D%A2%E5%A3%81%E7%BA%B8%E8%B7%AF%E5%BE%84-1.png" alt="Count 统计" width="800" />

上传到微步，效果如下

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%8F%8D%E5%BE%AE%E6%AD%A5%E5%8A%A8%E6%80%81%E6%B2%99%E7%AE%B1%20-%20%E6%A1%8C%E9%9D%A2%E5%A3%81%E7%BA%B8%E8%B7%AF%E5%BE%84-2.png" alt="Count 统计" width="800" />

可以看到，"系统找不到指定的文件"，怀疑可能是 hook 住了 `SystemParametersInfoW`，不过我们也得到了它显示的路径：`C:\Users\Administrator\Pictures\Saved Pictures\Desktop.jpg`

## 直接检测路径 (可用)

可以看到，这个路径不是默认的桌面壁纸路径，所以我们可以直接检测壁纸的路径，如果 `SystemParametersInfoW` 返回的路径为 `C:\Users\Administrator\Pictures\Saved Pictures\Desktop.jpg`，那么说明就进了微步沙箱。

如果不是这个路径，我们直接返回 `panic!`，或者弹一个窗口。

```Rust
#![windows_subsystem = "windows"]
use windows::Win32::UI::WindowsAndMessaging::SystemParametersInfoW;
use windows::Win32::UI::WindowsAndMessaging::{
    MESSAGEBOX_STYLE, MessageBoxW, SPI_GETDESKWALLPAPER, SYSTEM_PARAMETERS_INFO_UPDATE_FLAGS,
};
use windows::core::PCWSTR;

fn get_wallpaper_path() -> String {
    let mut buffer: Vec<u16> = vec![0; 260];
    let result = unsafe {
        SystemParametersInfoW(
            SPI_GETDESKWALLPAPER,
            buffer.len() as u32,
            Some(buffer.as_mut_ptr().cast()),
            SYSTEM_PARAMETERS_INFO_UPDATE_FLAGS(0),
        )
    };

    let wallpaper_path: String = match result {
        Ok(()) => {
            let wallpaper_path = String::from_utf16(&buffer).unwrap();
            wallpaper_path
        }
        Err(e) => {
            let result = e.to_string();
            result
        }
    };

    let wallpaper_path = wallpaper_path.replace("\0", "");

    println!("Wallpaper: {}", wallpaper_path);
    wallpaper_path
}

fn compare_path(path: String) -> bool {
    if path == r"C:\Users\Administrator\Pictures\Saved Pictures\Desktop.jpg" {
        true
    } else {
        false
    }
}

struct MessageBox {
    title: String,
    message: String,
}

impl MessageBox {
    fn get_wide_string(str: &str) -> Vec<u16> {
        str.encode_utf16().chain(std::iter::once(0)).collect()
    }

    fn make_box(self) {
        let wide_title = Self::get_wide_string(self.title.as_str());
        let wide_message = Self::get_wide_string(self.message.as_str());

        let title = PCWSTR::from_raw(wide_title.as_ptr());
        let message = PCWSTR::from_raw(wide_message.as_ptr());

        unsafe { MessageBoxW(None, message, title, MESSAGEBOX_STYLE(0)) };
    }
}

fn make_request(url: &str) -> String {
    let res = reqwest::blocking::get(url).unwrap();
    let status = res.status();
    status.to_string()
}

fn main() {
    if compare_path(get_wallpaper_path()) {
        panic!()
    } else {
        let url = Box::new("https://x.threatbook.com/");

        let message_box = MessageBox {
            title: String::from("Success!"),
            message: make_request(url.as_ref()),
        };

        message_box.make_box();
    }
}
```

本地效果：

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%8F%8D%E5%BE%AE%E6%AD%A5%E5%8A%A8%E6%80%81%E6%B2%99%E7%AE%B1%20-%20%E6%A1%8C%E9%9D%A2%E5%A3%81%E7%BA%B8%E8%B7%AF%E5%BE%84-3.png" alt="Count 统计" />

微步沙箱：

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%8F%8D%E5%BE%AE%E6%AD%A5%E5%8A%A8%E6%80%81%E6%B2%99%E7%AE%B1%20-%20%E6%A1%8C%E9%9D%A2%E5%A3%81%E7%BA%B8%E8%B7%AF%E5%BE%84-4.png" alt="Count 统计" width="800" />

成功绕过。
