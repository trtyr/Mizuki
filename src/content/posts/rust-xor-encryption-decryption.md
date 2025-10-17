---
title: Rust 实现 XOR 加解密
published: 2025-10-17
description: 本文介绍了如何使用 Rust 实现简单的 XOR 加密和解密算法。
tags: [Rust, 加解密]
category: 编程技术
draft: false
---

准备 data 和 key

```Rust
fn main() {
	let data = "hello world";
    let key = "adminadmina";
}
```

准备一个 XOR 处理函数，传的是 `data` 和 `key`，返回啥？加密操作会返回一个 `Vec<u8>` 类型，解密返回原始字符串 `String` 类型，那么就返回一个枚举喽。

然后我们在参数里放一个开关，好让我们能够用 `match` 枚举选择用哪个模式。

```Rust
enum XorOutPut {
    Decode(String),
    Encode(Vec<u8>),
}

enum Operation {
    Encrypt,
    Decrypt,
}

fn xor_cipher<T>(data: &str, key: &str, p: Operation) -> Result<XorOutPut, String> {}
```

现在需要

1. 检查 `data` 和 `key` 的长度是否相等
2. 区分加密操作和解密操作

```Rust
fn xor_cipher<T>(data: &str, key: &str, p: Operation) -> Result<XorOutPut, String> {
    if data.len() != key.len() {
        return Err(format!(
            "data length does not match key length: {}",
            data.len()
        ));
    };

    match p {
        Operation::Encrypt => {
            todo!()
        }
        Operation::Decrypt => {
            todo!()
        }
    }
}
```

首先是加密操作，将 `data` 变成 `byte` 类型，然后挨个和 `key` 进行 `XOR` 操作即可。

```Rust
    match p {
        Operation::Encrypt => {
            let data = data.as_bytes();
            let result = data
                .iter()
                .zip(key.as_bytes().iter().cycle())
                .map(|(d, k)| d ^ k)
                .collect::<Vec<u8>>();
            Ok(XorOutPut::Encode(result))
        }
        Operation::Decrypt => {
            todo!()
        }
    }
```

感觉不是太好管理

1. 把它分离出去
2. 把传递进来的 `&str` 改成 `&[u8]`

```Rust
fn xor_core(data: &[u8], key: &[u8]) -> Vec<u8> {
    let result = data
        .iter()
        .zip(key.iter().cycle())
        .map(|(d, k)| d ^ k)
        .collect::<Vec<u8>>();
    result
}

fn xor_cipher<T>(data: &[u8], key: &[u8], p: Operation) -> Result<XorOutPut, String> {
    if data.len() != key.len() {
        return Err(format!(
            "data length does not match key length: {}",
            data.len()
        ));
    };

    match p {
        Operation::Encrypt => {
            let data = data;
            let result = xor_core(data, key.);
            Ok(XorOutPut::Encode(result))
        }
        Operation::Decrypt => {
            todo!()
        }
    }
}
```

然后是解密操作，现在 data 传进来的就是加密后的 `&[u8]`，把它变成 `Vec<u8>`，然后变成 UTF-8 即可

```Rust
match p {
    Operation::Encrypt => {
        let data = data;
        let result = xor_core(data, key);
        Ok(XorOutPut::Encode(result))
    }
    Operation::Decrypt => {
        let result = xor_core(data, key);
        let res = String::from_utf8(result).unwrap();
        Ok(XorOutPut::Decode(res))
    }
}
```

然后调用即可，完整代码如下

```Rust
fn main() {
    let data = "hello world";
    let key = "adminadmina";

    let encode = match xor_cipher(data.as_bytes(), key.as_bytes(), Operation::Encrypt) {
        Ok(XorOutPut::Encode(v)) => v,
        Err(e) => panic!("{}", e),
        _ => unreachable!(),
    };

    println!(
        "使用密钥: {}, 对明文数据: {} 进行加密，得到: {:?}",
        key, data, encode
    );

    let decode = match xor_cipher(&encode, key.as_bytes(), Operation::Decrypt) {
        Ok(XorOutPut::Decode(v)) => v,
        Err(e) => panic!("{}", e),
        _ => unreachable!(),
    };

    println!(
        "使用密钥: {}, 对密文数据: {:?} 进行解密，得到: {:?}",
        key, encode, decode,
    );
}

enum XorOutPut {
    Decode(String),
    Encode(Vec<u8>),
}

enum Operation {
    Encrypt,
    Decrypt,
}

fn xor_core(data: &[u8], key: &[u8]) -> Vec<u8> {
    let result = data
        .iter()
        .zip(key.iter().cycle())
        .map(|(d, k)| d ^ k)
        .collect::<Vec<u8>>();
    result
}

fn xor_cipher(data: &[u8], key: &[u8], p: Operation) -> Result<XorOutPut, String> {
    if data.len() != key.len() {
        return Err(format!(
            "data length does not match key length: {}",
            data.len()
        ));
    };

    match p {
        Operation::Encrypt => {
            let data = data;
            let result = xor_core(data, key);
            Ok(XorOutPut::Encode(result))
        }
        Operation::Decrypt => {
            let result = xor_core(data, key);
            let res = String::from_utf8(result).unwrap();
            Ok(XorOutPut::Decode(res))
        }
    }
}
```

结果：

```powershell
使用密钥: adminadmina, 对明文数据: hello world 进行加密，得到: [9, 1, 1, 5, 1, 65, 19, 2, 27, 2, 5]
使用密钥: adminadmina, 对密文数据: [9, 1, 1, 5, 1, 65, 19, 2, 27, 2, 5] 进行解密，得到: "hello world"

```
