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
pub fn shell_code_to_ipv6(hex: Vec<u8>) -> Vec<String> {
    // 返回 ipv6
    let mut ipv6_address: Vec<String> = Vec::new();

    // 获取 ShellCode 长度，长度保险一点，这里用了 u64
    let length = hex.len() as u64;

    // 拼接 length + hex -> data
    let mut data = Vec::new();
    data.extend_from_slice(&length.to_be_bytes());
    data.extend_from_slice(&hex);

    // 此时的 data 应该是 [长度, 后面是 hex 的数据]
    // println!("{:X?}", data);

    // 给它按照 16 个字节进行分组，这里返回了一个迭代器
    let chunks = data.chunks(16);

    for i in chunks {
        // 创建一个数组用来默认填充 0
        let mut ipv6_bytes = [0; 16];

        // 因为可能最后的切片不是 16 个字节，我们需要使用切片，在 `[..i.len()]`里插入当前的 i，然后 [0; 16] 会自动补全 0
        ipv6_bytes[..i.len()].copy_from_slice(&i);

        // 此时我们能够得到这样的结果:
        // chunk: [83, 83, 72, 137, 231, 72, 137, 241, 72, 137, 218, 65, 184, 0, 32, 0]
        // chunk: [170, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        // println!("chunk: {:?}", ipv6_byte);

        let segments = ipv6_bytes
            .chunks(2) // 两个字节作为一组, 返回一个迭代器。
            .map(|byte| u16::from_be_bytes([byte[0], byte[1]])) // byte 其实就是 [p1,p2] 这样的数据，对 p1 和 p2 进行 U16 类型转换
            .collect::<Vec<u16>>();

        // 现在得到这样的数据: segments: [a0fc, 4883, e4f0, e8c8, 0, 41, 5141, 5052]
        // println!("segments: {:x?}", segments);

        // 对数据进行格式化，变成 IPv6 样式
        let add_str = segments
            .iter()
            .map(|i| format!("{:04X}", i)) // 格式化一下
            .collect::<Vec<String>>() // 收集起来，得到 Vec<String> 类型的数据
            .join(":"); // 将数据和数据之间，用`:`连接

        // 得到这样的数据: A0FC4883E4F0E8C80000004151415052
        // println!("{}", add_str);

        ipv6_address.push(add_str);
    }

    ipv6_address
}

```

效果如下

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Rust%20%E5%AE%9E%E7%8E%B0%20Hex%20%E5%8F%98%20IPv6%20%E6%A0%BC%E5%BC%8F%E6%95%B0%E6%8D%AE-1.png" alt="Count 统计" width="800" />

### IPv6 to ShellCode

就是上面的反操作，关键就是，前八个字节为 ShellCode 的原始长度。最后得到一个 vec 类型的数据

```Rust
pub fn ipv6_to_shellcode(ipv6_address: Vec<String>) -> Vec<u8> {
    // 将IPv6 数据变成 原始的 byte 数据
    // 得到 `[0, 0, 0, 0, 0, 0, 3, 160, ...]` 这样的数据
    let bytes_ipv6 = ipv6_to_bytes(ipv6_address);
    // println!("ipv6_to_shellcode: {:?}", hex_ipv6);

    // 做一下分割，得到 [长度, ShellCode]
    let (len_arr, shellcode_arr) = bytes_ipv6.split_at(8);

    // 把长度提取出来，进行处理，得到十进制数
    let len_arr: [u8; 8] = len_arr.try_into().unwrap();
    let length = u64::from_be_bytes(len_arr) as usize;

    // 从剩下的数据里，截取我们需要的长度
    let shellcode = &shellcode_arr[..length];

    shellcode.to_vec()
}

fn ipv6_to_bytes(ipv6_address: Vec<String>) -> Vec<u8> {
    let mut result: Vec<u8> = Vec::new();

    // 迭代一下，得到 address，每个 address 为 0000:4151:4150:5251:5648:31D2:6548:8B52 这样的数据
    for address in ipv6_address.iter() {
        // 对 address 根据 `:` 进行分割，返回一个迭代器
        let segment_str = address.split(":");

        // 使用这个迭代器，得到每个 segment，是 D758 这样的数据
        for segment in segment_str {
            // 将 segment 变成 u16 数据，比如这样: 34474
            let number = u16::from_str_radix(segment, 16).unwrap();

            // 然后在把 number 变成字节, 得到这样的数据: [134, 170]
            let bytes = number.to_be_bytes();

            // println!("{:?}", bytes);

            result.extend_from_slice(&bytes);
        }
    }
    result
}

```

效果如下

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Rust%20%E5%AE%9E%E7%8E%B0%20Hex%20%E5%8F%98%20IPv6%20%E6%A0%BC%E5%BC%8F%E6%95%B0%E6%8D%AE-2.png" alt="Count 统计" width="800" />
