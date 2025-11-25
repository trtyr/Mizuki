---
title: 如何用 Rust 实现 DLL 的编写和使用
published: 2025-10-26
description: 介绍如何使用 Rust 语言编写动态链接库（DLL）以及如何在 Rust 和其他语言（如 C）中调用它。
tags: [Rust, Windows]
category: 编程技术
draft: false
---

## 什么是 DLL

在现代软件开发中，代码复用和模块化是核心原则。动态链接库（Dynamic-Link Library, DLL）是微软 Windows 操作系统实现这些原则的关键技术。与将所有代码编译进一个巨大可执行文件的静态链接不同，动态链接允许程序在运行时加载外部的功能模块。

一个 DLL 文件是一个包含可由多个程序同时使用（或共享）的代码和数据的库。这样做的好处是多方面的：

- **模块**：将应用程序的不同功能划分到独立的 DLL 中，使得开发、测试和维护更加容易。
- **代码复用**：多个应用程序可以共享同一个 DLL，节约了磁盘空间和内存。
- **简化更新**：当 DLL 中的功能需要更新时，理论上只需替换该 DLL 文件，而无需重新编译所有使用它的应用程序（前提是接口保持兼容）。
- **语言互操作性**：只要遵循标准的应用二进制接口（ABI），用一种语言（如 Rust）编写的 DLL 可以被另一种语言（如 C++, C#, Python）的程序调用。

下面将介绍，通过 Rust 创建一个 DLL 项目，以及创建一个调用 DLL 的二进制程序。

## C 环境下怎么操作 DLL？

### 编写 DLL

我们首先来看一下，C 语言是怎么编写一个 DLL 的？

> 这里使用的是 Visual Studio Insiders

首先创建一个 DLL 项目，然后把默认的框架全部删除掉，并且在属性那里把预编译头给去掉。新建 C 文件，用我们的自己的代码文件。

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%A6%82%E4%BD%95%E7%94%A8%20Rust%20%E5%AE%9E%E7%8E%B0%20DLL%20%E7%9A%84%E7%BC%96%E5%86%99%E5%92%8C%E4%BD%BF%E7%94%A8-1.png" alt="如何用 Rust 实现 DLL 的编写和使用-1"/>

然后写一个简单的 DLL，实现 Add 操作。

`MyDLL.cpp` 代码如下：

```cpp
#include "MyDLL.h"

int add(int a, int b)
{
	return a + b;
}
```

`MyDLL.h` 代码如下

```cpp
#pragma once

extern "C" _declspec(dllexport) int add(int a, int b);
```

这里告诉编译器用 C 的方式去编译，并且声明其是一个导出函数。

生成就可以得到我们的 DLL

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%A6%82%E4%BD%95%E7%94%A8%20Rust%20%E5%AE%9E%E7%8E%B0%20DLL%20%E7%9A%84%E7%BC%96%E5%86%99%E5%92%8C%E4%BD%BF%E7%94%A8-2.png" alt="如何用 Rust 实现 DLL 的编写和使用-2"/>

### 使用 DLL

我们新建一个项目用来生成二进制的。我们把 lib 文件、刚才生成 DLL 使用的头文件都放在目标路径下。

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%A6%82%E4%BD%95%E7%94%A8%20Rust%20%E5%AE%9E%E7%8E%B0%20DLL%20%E7%9A%84%E7%BC%96%E5%86%99%E5%92%8C%E4%BD%BF%E7%94%A8-3.png" alt="如何用 Rust 实现 DLL 的编写和使用-3" width="100" />

然后加载头文件，设置附加库目录为当前目录，设置附加依赖项为 `MyDLL.lib` 文件。

`UseDLL.cpp` 代码如下

```cpp
#include <stdio.h>
#include "MyDLL.h"

int main()
{
    printf("1 + 2 = [%d]", add(1, 2));
}
```

生成，然后将 DLL 和 exe 放在一起即可

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%A6%82%E4%BD%95%E7%94%A8%20Rust%20%E5%AE%9E%E7%8E%B0%20DLL%20%E7%9A%84%E7%BC%96%E5%86%99%E5%92%8C%E4%BD%BF%E7%94%A8-4.png" alt="如何用 Rust 实现 DLL 的编写和使用-4" width="800" />

## Rust 环境下怎么操作 DLL？

可以看到，C 环境下操作 DLL 很简单嘛，那么 Rust 环境下应该怎么操作？

### 使用 DLL

我们在 Rust 环境下去使用这个 DLL。

1. 把 `Lib`、`DLL` 和可执行文件放在一起
2. 确认需要链接的 `lib` 文件
3. 声明一个外部函数，并且使用 C 语言的约束约定
4. 正常使用这个外部函数就行

```rust
// 这行是给链接器看的，告诉它："去链接一个叫 MyDLL 的库"
// Rust 会自动去找 MyDLL.lib 或者 MyDLL.a
#[link(name = "MyDLL")]
unsafe extern "C" {
    // 这里就是声明外部函数，告诉 Rust 有这么个东西存在
    // 它的名字叫 "add"，遵守 C 的调用约定
    // 参数是两个 32位整数(i32)，返回值也是一个 32位整数
    fn add(a: i32, b: i32) -> i32;
}

fn main() {
    // 调用外部函数必须放在 unsafe 块里
    // 这是 Rust 在提醒你：“兄弟，这块代码我罩不住，你自己小心点”
    let result = unsafe { add(10, 20) };

    println!("Called from Rust: 10 + 20 = [{}]", result);
}

```

效果：

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%A6%82%E4%BD%95%E7%94%A8%20Rust%20%E5%AE%9E%E7%8E%B0%20DLL%20%E7%9A%84%E7%BC%96%E5%86%99%E5%92%8C%E4%BD%BF%E7%94%A8-5.png" alt="如何用 Rust 实现 DLL 的编写和使用-5" width="400" />

### 无 Lib 使用 DLL

上述方法需要我们拥有目标的 Lib 文件才可运行，可是有时我们没有 lib，这时去运行时就会出现报错：

```powershell
= note: some arguments are omitted. use `--verbose` to show all linker arguments
= note: LINK : fatal error LNK1181: 无法打开输入文件“MyDLL.lib”
```

如果说我们能够得到 DLL 的函数函数，以及其函数签名，那么我们就可以自己去实现这个函数签名，然后使用这个签名就可以了。

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%A6%82%E4%BD%95%E7%94%A8%20Rust%20%E5%AE%9E%E7%8E%B0%20DLL%20%E7%9A%84%E7%BC%96%E5%86%99%E5%92%8C%E4%BD%BF%E7%94%A8-6.png" alt="如何用 Rust 实现 DLL 的编写和使用-6" width="400" />

我们需要用到一个 `libloading` Crate，大体的操作为：

1. 定义一个使用 C 语言调用约定的函数签名
2. 加载 DLL
3. 去导出表里找对应的函数，得到一个函数
4. 使用这个函数即可

代码如下

```rust
use libloading::{Library, Symbol};

// 定义一个函数签名
type Addfunc = unsafe extern "C" fn(i32, i32) -> i32;

fn main() {
    unsafe {
        // `Library::new`来加载 DLL，返回 Result<Library, Error> 类型
        let lib = Library::new("MyDLL.dll").expect("Load MyDLL.dll Failed");

        // `lib.get`，调用`get`方法去导出表里找 add，返回的是一个 Result<Symbol<'_, T>, Error> 类型
        let add_func: Symbol<Addfunc> = lib.get(b"add\0").expect("Get AddFunc Failed");

        // 现在我们就得到了 add_func 函数，直接用就可以了
        let a = 1;
        let b = 2;
        println!("{:?}", add_func(a, b));
    }
}
```

这样我们就可以直接用 DLL 啦

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%A6%82%E4%BD%95%E7%94%A8%20Rust%20%E5%AE%9E%E7%8E%B0%20DLL%20%E7%9A%84%E7%BC%96%E5%86%99%E5%92%8C%E4%BD%BF%E7%94%A8-7.png" alt="如何用 Rust 实现 DLL 的编写和使用-7" width="400" />

### 编写 DLL

上面我们介绍了，怎么用 Rust 程序去调用 DLL，那么怎么用 Rust 来写 DLL 呢？

#### 初始化 Lib 项目

我们使用 cargo 初始化项目：

```powershell
cargo new rust_dll --lib
cd rust_dll
```

打开项目根目录下的  `Cargo.toml`  文件，添加以下内容：

```toml
[lib]
crate-type = ["cdylib"]
```

其中：

- `[lib]`：这是一个配置节，用于指定与库编译相关的选项。
- `crate-type`：这个键用于定义要生成的库的类型。
- `["cdylib"]`：这是我们选择的库类型。`cdylib`  是 "C-style Dynamic Library" 的缩写。选择此类型意味着：
    - 编译器将生成一个动态链接库（在 Windows 上是  `.dll`  文件，在 Linux 上是  `.so`，在 macOS 上是  `.dylib`）。
    - 这个库将遵循 C 语言的 ABI，使其能够被其他语言方便地调用。
    - 它不包含 Rust 特有的元数据，从而减小了文件体积并增强了通用性。

#### 编写 DLL

用 Rust 写 DLL 其实和 C 写 DLL 没啥区别，主要是要注意一下遵循的调用规则，以及数据类型转换成 C 语言。

我们写一个 greet 函数。

```rust
use std::ffi::{c_char, CStr};

#[unsafe(no_mangle)]
// 约定为 C 语言，greet 接受一个 C 语言风格的字符串指针(*const c_chat)
pub unsafe extern "system" fn greet(str: *const c_char) {
    // 接收的是 C 风格的字符串，我们要把它变成 Rust 类型的: C -> &CStr -> &str
    let str = unsafe { CStr::from_ptr(str).to_str().unwrap() };

    println!("Hello, {}!", str);
}
```

我们看看能不能正常查看导出表

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%A6%82%E4%BD%95%E7%94%A8%20Rust%20%E5%AE%9E%E7%8E%B0%20DLL%20%E7%9A%84%E7%BC%96%E5%86%99%E5%92%8C%E4%BD%BF%E7%94%A8-8.png" alt="如何用 Rust 实现 DLL 的编写和使用-8" width="575" />

可以正常查看。

我们尝试用 Rust 和 C 分别使用这个 DLL

```rust
use libloading::{Library, Symbol};
use std::ffi::{c_char, CString};

// 定义一个函数签名
type Greet = unsafe extern "C" fn(str: *const c_char);

fn main() {
    unsafe {
        // `Library::new`来加载 DLL，返回 Result<Library, Error> 类型
        let lib = Library::new("Rust_DLL.dll").expect("Load Rust_DLL.dll Failed");

        // `lib.get`，调用`get`方法去导出表里找 add，返回的是一个 Result<Symbol<'_, T>, Error> 类型，其中`Symbol<'_, T>`是一个智能指针
        let greet: Symbol<Greet> = lib.get(b"greet\0").expect("Get AddFunc Failed");

        // 调用
        let a = CString::new("张三").expect("CString::new failed");
        greet(a.as_ptr());
    }
}
```

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%A6%82%E4%BD%95%E7%94%A8%20Rust%20%E5%AE%9E%E7%8E%B0%20DLL%20%E7%9A%84%E7%BC%96%E5%86%99%E5%92%8C%E4%BD%BF%E7%94%A8-9.png" alt="如何用 Rust 实现 DLL 的编写和使用-9" width="400" />

```c
#include <stdio.h>
#include <windows.h>

typedef void (*GREET_FUNC_PTR)(const char*);

int main() {
	HINSTANCE hDll = LoadLibraryA("Rust_DLL.dll");

	GREET_FUNC_PTR greet_func = (GREET_FUNC_PTR)GetProcAddress(hDll, "greet");

	greet_func("World dynamically from C");

	FreeLibrary(hDll);

	getchar();

	return 0;
}
```

运行

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E5%A6%82%E4%BD%95%E7%94%A8%20Rust%20%E5%AE%9E%E7%8E%B0%20DLL%20%E7%9A%84%E7%BC%96%E5%86%99%E5%92%8C%E4%BD%BF%E7%94%A8-10.png" alt="如何用 Rust 实现 DLL 的编写和使用-10" width="400" />
