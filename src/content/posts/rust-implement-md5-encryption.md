---
title: Rust 实现 MD5 加密
published: 2025-10-17
description: 本文介绍了如何使用 Rust 实现 MD5 加密，包括对字符串进行加密和获取文件的 MD5 哈希值。
tags: [Rust, 加解密]
category: 编程技术
draft: false
---

本文将介绍如何使用 [md5](https://crates.io/crates/md5) crate 来实现 MD5 加密。

## MD5 加密实现

大体流程为：

1. 准备要加密的字符串
2. 使用 `md5::comput()` 方法对字节进行加密，得到 Digest 实例
3. 将 Digest 实例变成 Hex

```rust
fn main() {
    let text = "admin";
    let text_digest = md5::compute(text.as_bytes());
    let md5_context = format!("{:x}", text_digest);
    println!("{}", md5_context);
}
```

## 得到文件 MD5 Hash

下面演示一下怎么得到图片的 MD5 Hash

```rust
use std::fs;
use std::path::PathBuf;

fn main() {
    let path = r"C:\Users\xxx\Documents\个人知识库\Asset\banners\2.png";
    let byte = get_picture(path);
    let md5_digest = format!("{:X}", md5::compute(byte));
    assert_eq!(md5_digest, "CC8B9D7F3B833D1FE16451F120E709B8");
    println!("{}", md5_digest);
}

fn get_picture(path: &str) -> Vec<u8> {
    let byte = fs::read(path).unwrap();
    byte
}

```