---
title: 使用 Rust 编写和使用 DLL
published: 2025-10-26
description: 介绍如何使用 Rust 编写动态链接库（DLL）以及如何从另一个 Rust 程序中调用它。
tags: [Rust, Windows]
category: 编程技术
draft: false
---

## 什么是 DLL

在现代软件开发中，代码复用和模块化是核心原则。动态链接库（Dynamic-Link Library, DLL）是微软 Windows 操作系统实现这些原则的关键技术。与将所有代码编译进一个巨大可执行文件的静态链接不同，动态链接允许程序在运行时加载外部的功能模块。

一个 DLL 文件是一个包含可由多个程序同时使用（或共享）的代码和数据的库。这样做的好处是多方面的：

- **模块化：** 将应用程序的不同功能划分到独立的 DLL 中，使得开发、测试和维护更加容易。
- **代码复用：**  多个应用程序可以共享同一个 DLL，节约了磁盘空间和内存。
- **简化更新：**  当 DLL 中的功能需要更新时，理论上只需替换该 DLL 文件，而无需重新编译所有使用它的应用程序（前提是接口保持兼容）。
- **语言互操作性：**  只要遵循标准的应用二进制接口（ABI），用一种语言（如 Rust）编写的 DLL 可以被另一种语言（如 C++, C#, Python）的程序调用。

下面将介绍，通过 Rust 创建一个 DLL 项目，以及创建一个调用 DLL 的二进制程序。

## 使用 Rust 编写 DLL

### 初始化项目

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

:::note
请不要将其与  `dylib`  混淆。`dylib`  类型用于生成 Rust 语言专用的动态库，旨在被其他 Rust 程序链接，它包含了额外的 Rust 元数据，不适用于跨语言 FFI 场景。
:::

### 编写 DLL

#### 基础框架

用 Rust 写 DLL，主要是涉及到外部函数接口 FFI 相关的内容，具体的可以去 Rust 死灵书上看看，这里只会做一些简单的介绍。

一个 DLL 必然会被其他二进制文件调用，但是 DLL 是用 Rust 写的，但是 EXE 可能是用 C 写的，这样 C 去调用 Rust 就可能会出现一些问题：

- **调用约定：**  函数调用时，参数如何传递到栈上、返回值如何返回、调用方和被调用方谁负责清理栈，这些规则被称为调用约定。Rust 和 C 的默认调用约定不同，必须显式统一。
- **函数名混淆：**  为了支持泛型和方法重载等高级特性，Rust 编译器会默认修改函数名，生成一个唯一的内部符号。例如，一个名为  process  的函数可能会被编译成类似  `_ZN8my_lib7processE…`  的形式。而 C 语言期望的是一个简单的、未经修改的函数名。
- **数据表示差异**：这个就更不用说了，Rust 的 `String`、`Vec<T>`、`Enum` 等数据类型和 C 语言完全不同
- **内存管理模型：** Rust 拥有严格的所有权和生命周期系统，内存由编译器在编译时精确管理。而 C 语言则完全依赖开发者手动调用  `malloc/free`  来管理内存。

为了解决可能出现的问题，Rust 提供了特定的关键字和属性。任何一个希望被外部语言调用的 Rust 函数，其签名都必须包含以下"三要素"：

- **pub  关键字:**  这是 Rust 的可见性控制。只有标记为  `pub`  的函数才能被模块外部访问
- **extern "C"  关键字:**  这是解决"调用约定"问题的关键。它告诉 Rust 编译器：
    - "请为这个函数使用 C 语言的调用约定。"
    - 这确保了当 C 代码（或任何遵循 C ABI 的语言）调用此函数时，双方对参数传递和栈清理的理解是一致的。
- **#[unsafe(no_mangle)]  属性:**  这是解决"函数名混淆"问题的关键。
    - `no_mangle`  指示编译器不要修改此函数的名称，保持其在源代码中的原样。这样，外部调用者就可以通过对应的函数名称去找到它。
    - `unsafe(…)`  不安全，需要加 unsafe 块

综上所述，一个最基础的 FFI 函数框架看起来是这样的：

```Rust
// FFI 函数框架
#[unsafe(no_mangle)]
pub extern "C" fn function_name(param1: type1, param2: type2) -> return_type {
    // Rust 实现代码…
}
```

#### 基本数据类型操作

我们先写一个基础的操作类型函数练手一下。

```Rust
#[unsafe(no_mangle)]
pub extern "C" fn add(number1: i32, number2: i32) -> i32 {
    number1 + number2
}
```

因为像  `i32`, `u64`, `f32`  等数值类型的内存布局在 Rust 和 C 之间是直接兼容的，所以直接操作就可以了。

#### 处理字符串与内存

当我们在 Rust 代码中为外部调用者创建数据（例如，生成一个新的字符串）时，就必须面对内存管理的问题。我们需要手动的去管理内存。

我们设计两个函数

- `greet`  函数：接收一个 C 字符串，在 Rust 堆上分配内存创建一个新的字符串，并将其指针返回给调用者。
- `free_string`  函数：接收一个之前由  `greet`  函数返回的指针，并安全地释放其在 Rust 堆上占用的内存。

首先是 `greet` 函数。

```rust
use std::os::raw::c_char;
use std::ffi::{CString, CStr};

/// 导出一个函数，接收一个 C 风格的字符串指针，并返回一个新的 C 风格字符串指针。
/// 调用者必须负责在事后使用 `free_string` 函数释放返回的指针。
#[unsafe(no_mangle)]
pub extern "C" fn greet(name: *const c_char) -> *mut c_char {
    // 步骤 1: 将 C 字符串指针包装成 Rust 类型。
    // `unsafe` 块是必需的，因为解引用裸指针是一个不安全操作。
    // CStr::from_ptr 会从指针处开始读取字节，直到遇到 `\0`。
    let name_cstr = unsafe { CStr::from_ptr(name) };

    // 步骤 2: 将 CStr 转换为 Rust 的 &str，这里可能会失败（如果不是合法的UTF-8）。
    // 为了示例简单，我们使用 unwrap_or 提供一个默认值。
    let name_str = name_cstr.to_str().unwrap_or("Invalid UTF-8");

    // 步骤 3: 在 Rust 中创建新的 String。
    let greeting = format!("Hello, {} from Rust!", name_str);

    // 步骤 4: 将 Rust 的 String 转换回 C 兼容的 CString（带 `\0` 结尾）。
    let c_greeting = CString::new(greeting).unwrap();

    // 步骤 5: 交出内存所有权。
    // c_greeting.into_raw() 返回一个指向内存的裸指针，并让 Rust 忘记对这块内存的管理。
    // 从此刻起，这块内存的生命周期就由外部调用者负责了。
    c_greeting.into_raw()
}
```

我们现在把这块内存的管理权限交出去了，我们还需要创建一个函数用来销毁这块内存。

```Rust
// 导出一个函数，用于释放由本 DLL 分配的字符串内存。
#[unsafe(no_mangle)]
pub extern "C" fn free_string(s: *mut c_char) {
    // 不处理空指针。
    if s.is_null() {
        return;
    }
    unsafe {
        // CString::from_raw 是 into_raw 的逆操作。
        // 它会接管指针，重新构建一个 CString。
        // 这个新建的 CString 是一个临时变量，当它离开这个作用域时，
        // Rust 的所有权系统会像处理任何普通变量一样，自动调用它的 Drop 实现，
        // 从而安全、正确地释放底层的内存。
        let _ = CString::from_raw(s);
    }
}
```

#### 编译 DLL

正常用 cargo 编译即可

```powershell
Windows PowerShell
版权所有 (C) Microsoft Corporation。保留所有权利。

尝试新的跨平台 PowerShell https://aka.ms/pscore6

加载个人及系统配置文件用了 3300 毫秒。
 cargo build --release
   Compiling rust_dll v0.1.0 (C:\Users\16933\Documents\Code\Rust\rust_dll)
    Finished `release` profile [optimized] target(s) in 0.81s
 ls .\target\release\


    目录: C:\Users\xxx\Documents\Code\Rust\rust_dll\target\release


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----        2025/10/26     14:33                .fingerprint
d-----        2025/10/26     14:33                build
d-----        2025/10/26     15:32                deps
d-----        2025/10/26     14:33                examples
d-----        2025/10/26     14:33                incremental
-a----        2025/10/26     14:33              0 .cargo-lock
-a----        2025/10/26     14:33            128 rust_dll.d
-a----        2025/10/26     15:32         115712 rust_dll.dll
-a----        2025/10/26     15:32           1037 rust_dll.dll.exp
-a----        2025/10/26     15:32           2024 rust_dll.dll.lib
-a----        2025/10/26     15:32        1159168 rust_dll.pdb
  xxx on Sunday at 3:32 PM   master ≢  ?5                                                                                                                                                             0.068s  MEM: 82% (13/15GB)
  {  home  Documents  Code  Rust  rust_dll } 
```

我们这样就得到了 `rust_dll.dll`

## 从另一个 Rust 程序使用 DLL

现在，我们将创建一个新的 Rust 可执行程序来加载并使用我们刚刚创建的  `rust_dll.dll`。

我们创建一个 `dll_caller`

```powershell
cargo new dll_caller
cd dll_caller
```

为了在运行时动态加载 DLL，我们需要一个库来处理平台相关的细节。`libloading`  这个库为  LoadLibrary (Windows), dlopen (Linux/macOS) 等底层 API 提供了安全且跨平台的封装。

我们加入这个库

```toml
[dependencies]
libloading = "0.8.9" // 写这篇文章时，最新版本为 0.8.9
```

我们主要用到两个结构体

- `Library`：代表一个已加载到内存中的动态库。它的生命周期与库在内存中的存在时间绑定，当  `Library`  实例被  drop  时，库会被自动卸载。
- `Symbol`：代表从库中获取到的一个函数或变量的符号。它是一个智能指针，封装了函数指针的获取和调用，并与  `Library`  的生命周期关联，确保我们不会在库被卸载后还尝试调用其中的函数。

调用大体上分为三步：

1. 定义函数签名
2. 加载库并获取符号
3. 调用函数并处理数据

### 定义函数签名

我们将为  `add`, `greet`, 和  `free_string`  三个函数定义对应的签名。

```Rust
use std::os::raw::c_char;

// 为 DLL 中导出的每个函数定义其类型签名
type AddFunc = unsafe extern "C" fn(number1: i32, number2: i32) -> i32;
type GreetFunc = unsafe extern "C" fn(name: *const c_char) -> *mut c_char;
type FreeStringFunc = unsafe extern "C" fn(s: *mut c_char);
```

### 加载库

我们将使用  `libloading`  来加载 DLL，并从中查找我们需要的函数。

```Rust
use libloading::{Library, Symbol};
use std::os::raw::c_char;

// 为 DLL 中导出的每个函数定义其类型签名
type AddFunc = unsafe extern "C" fn(number1: i32, number2: i32) -> i32;
type GreetFunc = unsafe extern "C" fn(name: *const c_char) -> *mut c_char;
type FreeStringFunc = unsafe extern "C" fn(s: *mut c_char);

fn main() {
    // 整个过程都包裹在 unsafe 块中，因为与外部库的交互是 Rust 编译器无法保证其安全性的。
    unsafe {
        // 1. 加载库
        // Library::new() 尝试加载 DLL。如果失败，`?` 操作符会提前返回错误。
        let lib = Library::new("rust_dll.dll").unwrap();

        // 2. 获取函数符号
        // lib.get() 通过函数名（以 null 结尾的字节串）来查找。
        // get 的类型参数 `<AddFunc>` 告诉 libloading 我们期望这个符号是什么类型。
        let add: Symbol<AddFunc> = lib.get(b"add\0").unwrap();
        let greet: Symbol<GreetFunc> = lib.get(b"greet\0").unwrap();
        let free_string: Symbol<FreeStringFunc> = lib.get(b"free_string\0").unwrap();

        // … 后续调用代码将在这里 …
    };
}
```

:::note
函数名必须是 C 风格的、以  `\0`  结尾的字节串，例如  `b"add\0"`。
:::

### 调用函数

获取到  Symbol  之后，我们就可以像调用普通函数一样来使用它了。关键在于如何正确地准备参数和处理返回值，Rust 传给 DLL 的字符，要变成 C 语言的类型；DLL 传过来的要变成 Rust 类型

```Rust
use libloading::{Library, Symbol};
use std::ffi::{CStr, CString};
use std::os::raw::c_char;

// 为 DLL 中导出的每个函数定义其类型签名
type AddFunc = unsafe extern "C" fn(number1: i32, number2: i32) -> i32;
type GreetFunc = unsafe extern "C" fn(name: *const c_char) -> *mut c_char;
type FreeStringFunc = unsafe extern "C" fn(s: *mut c_char);

fn main() {
    // 整个过程都包裹在 unsafe 块中，因为与外部库的交互是 Rust 编译器无法保证其安全性的。
    unsafe {
        // 1. 加载库
        // Library::new() 尝试加载 DLL。如果失败，`?` 操作符会提前返回错误。
        let lib = Library::new("rust_dll.dll").unwrap();

        // 2. 获取函数符号
        // lib.get() 通过函数名（以 null 结尾的字节串）来查找。
        // get 的类型参数 `<AddFunc>` 告诉 libloading 我们期望这个符号是什么类型。
        let add: Symbol<AddFunc> = lib.get(b"add\0").unwrap();
        let greet: Symbol<GreetFunc> = lib.get(b"greet\0").unwrap();
        let free_string: Symbol<FreeStringFunc> = lib.get(b"free_string\0").unwrap();

        // --- 调用 `add` 函数 ---
        let result = add(25, 17);
        println!("Calling add(25, 17) -> {}", result);

        // --- 调用 `greet` 函数 ---
        let my_name = "World";
        // 1. 将 Rust 的 &str 转换为 C 兼容的 CString (带 \0 结尾)。
        let c_name = CString::new(my_name).unwrap();
        // 2. 调用 greet，传入指针。
        let c_greeting_ptr = greet(c_name.as_ptr());

        // 3. 将返回的 C 指针转换回 Rust 字符串用于显示。
        let greeting_cstr = CStr::from_ptr(c_greeting_ptr);
        let greeting_string = greeting_cstr.to_string_lossy();
        println!("Received from DLL: {}", greeting_string);
    };
}

```

### 管理内存

上面的操作结束后，我们把 `greet` 得到的 `c_greeting_ptr` 给释放掉。

```Rust
free_string(c_greeting_ptr);
println!("Memory freed by calling 'free_string'.");
```

## 测试效果

我们将 DLL 放到目标项目下面。

```powershell
 ls

    目录: C:\Users\xxx\Documents\Code\Rust\dll_caller

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----        2025/10/26     15:55                .idea
d-----        2025/10/26     15:57                src
d-----        2025/10/26     15:39                target
-a----        2025/10/26     15:39              8 .gitignore
-a----        2025/10/26     15:40            815 Cargo.lock
-a----        2025/10/26     15:40            101 Cargo.toml
-a----        2025/10/26     15:32         115712 rust_dll.dll
```

跑一下试试

```powershell
 cargo run
   Compiling windows-link v0.2.1
   Compiling libloading v0.8.9
   Compiling dll_caller v0.1.0 (C:\Users\xxx\Documents\Code\Rust\dll_caller)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 1.15s
     Running `target\debug\dll_caller.exe`
Calling add(25, 17) -> 42
Received from DLL: Hello World!
Memory freed by calling 'free_string'.
```

成功。
