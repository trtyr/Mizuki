---
title: Rust 实现 Hex 数据变 IPv6 格式数据
published: 2025-10-19
description: 介绍在 Rust 语言中，如何将十六进制的 ShellCode 数据转换为 IPv6 地址格式，以及如何进行反向转换。
tags: [Rust,免杀]
category: 网络安全
draft: false
---

## 前言

我们拿到一个十六进制的 ShellCode，原始的 ShellCode 过于明显，我们需要将其做一个样式的转换，比如说变成 IPv4、UUID、MAC 地址、IPv6 等等，本文就介绍一下，在 Rust 语言实现 Hex 数据变成 IPv6 格式数据

## 实现思路

一个标准的 IPv6 地址，比如 `2001:0db8:85a3:0000:0000:8a2e:0370:7334`，它本质上是一个 128 位、也就是 16 bytes 的无符号整数。我们将 ShellCode 按照 16 字节为一组，进行分割。

然后就是填充的问题，如果 ShellCode 不能被 16 整除怎么办？记录一下 ShellCode 长度，然后用 0 填充。

所以 `ShellCode -> IPv6` 转换的大体思路如下

1. 获取原始 ShellCode 的长度。比如，N 个字节。
2. 把这个长度数字 N，也变成字节。
3. 构造一个新的、待编码的数据包：`[代表N的8个字节] + [原始shellcode的N个字节]`。
4. 现在，我们再对这个"加了头"的新数据包，进行 16 字节分块和填充

反向操作就是

1. 把所有 IPv6 地址转换回字节，然后拼接成一个大的字节流。
2. 读取最前面的 8 个字节，把它变回数字`N`。
3. 从第 9 个字节开始，往后读取 `N` 个字节。

## Rust 实现

### ShellCode to IPv6

代码如下

```Rust
pub fn shell_code_to_ipv6(byte: &[u8]) -> Vec<String> {
    let mut ipv6_address: Vec<String> = Vec::new();

    let length = byte.len() as u8;

    let mut data = Vec::new();
    data.push(length);
    // println!("{:?}", data);

    for &i in byte.iter() {
        data.push(i)
    }

    // println!("{:?}", data);

    let chunks = data.chunks(16);

    for chunk in chunks {
        // println!("{:x?}", chunk);
        let mut temp = [0u8; 16];
        temp[..chunk.len()].copy_from_slice(chunk);
        // println!("{:x?}", temp);

        let chunk2 = temp.chunks(2).map(|data| u16::from_be_bytes([data[0], data[1]]) ).collect::<Vec<_>>();
        // println!("{:x?}", chunk2);

        let ipv6 = chunk2.iter().map(|data| format!("{:04X}", data)).collect::<Vec<_>>().join(":");
        // println!("{}", ipv6);

        ipv6_address.push(ipv6);
    }

    // println!("ipv6_address {:?}", ipv6_address);

    ipv6_address

}
```

效果如下

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Rust%20%E5%AE%9E%E7%8E%B0%20Hex%20%E5%8F%98%20IPv6%20%E6%A0%BC%E5%BC%8F%E6%95%B0%E6%8D%AE-1.png" alt="Count 统计" width="800" />

### IPv6 to ShellCode

就是上面的反操作，关键就是，前八个字节为 ShellCode 的原始长度。最后得到一个 vec 类型的数据

```Rust
pub fn ipv6_to_shellcode(ipv6_shellcode: Vec<String>) -> Vec<u8> {
    let mut temp_u8 = Vec::new();
    for i in ipv6_shellcode.iter() {
        let ipv6_split_str = i.split(":").collect::<Vec<&str>>();
        // println!("{:?}", ipv6_split_str);
        for ii in ipv6_split_str.into_iter() {
            let (data1, data2) = (&ii[0.], &ii[2..]);
            // println!("data1: {}, data2: {}", data1, data2);
            temp_u8.push(u8::from_str_radix(data1, 16).unwrap());
            temp_u8.push(u8::from_str_radix(data2, 16).unwrap());
        }
    }

    // 得到 ShellCode 长度
    let length = temp_u8[0] as usize;
    let shellcode = temp_u8[1..=length].to_vec();

    shellcode

}

```

效果如下

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Rust%20%E5%AE%9E%E7%8E%B0%20Hex%20%E5%8F%98%20IPv6%20%E6%A0%BC%E5%BC%8F%E6%95%B0%E6%8D%AE-2.png" alt="Count 统计" width="800" />
