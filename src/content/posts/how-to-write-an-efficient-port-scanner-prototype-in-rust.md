---
title: Rust 编写高效端口扫描器原型
published: 2025-11-26
description: 最近在学习 Rust 相关开发，打算写一个端口扫描器原型练练手。本文介绍核心思路与实现。
tags: [Rust]
category: Rust
draft: false
---

最近在学习 Rust 相关开发，打算写一个端口扫描器原型练练手。

> [!NOTE]
> 为什么是原型呢？因为这里只会介绍一下核心的内容，以个人思路为主，而且市面上已经有非常好用的端口扫描器工具了。

## 端口扫描器设计

### 扫描方式

主要还是围绕 `SYN` 半连接扫描和 `TCP` 全连接扫描的选择。

- `SYN` 半连接扫描
    - 原理: 发送 `SYN` 包 -> 收到 `SYN/ACK` (表示端口开放) -> 发送 `RST` (中断连接)。
    - 优点: 速度极快，隐蔽性较高（不完成三次握手，日志较少）。
    - 缺点:
        - 需要构建原始数据包 (`Raw Socket`)。
        - Rust 标准库不支持 `Raw Socket`，需依赖 `pnet` 或 `socket2` 等第三方库。
        - 跨平台兼容性较差（Windows 上通常需要驱动支持）。
        - 需要手动处理数据包过滤、重传和丢包逻辑，实现复杂度高，易漏报。
- `TCP` 全连接扫描
    - 原理: 完成完整的三次握手 (`SYN` -> `SYN/ACK` -> `ACK`)，然后调用 `close()`。
    - 优点:
        - 实现简单，利用操作系统提供的 `connect` 系统调用。
        - 不需要 `Root`/`Administrator` 权限。
        - Rust 拥有强大的异步运行时 (`Tokio` / `async-std`)，可以轻松支撑数万并发。
    - 缺点: 理论上比 SYN 扫描慢（多一次 RTT），且更容易被目标主机日志记录。

> [!NOTE]
> 因为有 Rust 的异步并发支持，这里选择用 `TCP` 全连接扫描。

### 程序概念设计

#### 并发设计

为了提高扫描速度，这里选择 `tokio` 库进行异步并发。

```rust
#[tokio::main]
async fn main() {
    // 初始化配置、日志等
    // 启动扫描任务
    scanner().await;
}

async fn scanner() {
    // 扫描逻辑入口
    println!("Starting the high-performance scanner…");
}
```

#### 任务队列设计

因为是异步并发，为了在有限的内存资源下处理大量的扫描任务，这里稍微设计一下整体的架构。

我们先造一个任务池，叫做 `task_list`，这个 `task_list` 里有 1000 个空位。然后我们创建一个任务生成器 `A`，用来创建任务对象。大体流程就是：

1. `A` 为每个 `IP + Port` 创建一个对象，创建 1000 个，塞进 `task_list` 里
2. 池子开始并发运行
3. 突然，905 个任务运行完了，此处就空了出来，`task_list` 立刻通知 A 再造一个对象
4. A 创造对象，并将对象塞进 `task_list` 的第 905 空位里

> [!TIP]
> 这里用 `FuturesUnordered` 创建任务池，谁先完成，谁就先被取出。

```rust
let mut tasks = FuturesUnordered::new();
let batch_size = 1000; // 池子大小

// 初始化，先把池子灌满
for _ in 0..batch_size {
	task.push([这里是任务对象])
}

// 然后开始捞结果
while let Some(result) = tasks.next().await {
	[这里收集结果];
	[把下一个 push 进去];
}
```

## 搓代码

### Main 函数

先搓出来 main 函数

```rust
use std::net::{IpAddr, SocketAddr};
use std::time::Duration;

#[tokio::main]
async fn main() {
    // 初始化数据
    // 这里用 unwrap 是因为 IP 是硬编码的，如果这都挂了，说明写代码的人脑子进水了
    // 如果实际工具你要是敢用 unwrap，掐死你！
    let host = "127.0.0.1".parse::<IpAddr>().unwrap();
    let posts: Vec<u16> = (1..=1000).collect(); // 测试端口

    // 初始化扫描器
    // 扫描器应该是一个单独的对象
    // 结构体属性有这些
    // - address(IpAddr): 这是要目标地址
    // - posts(Vec<u16>): 这是要处理的目标端口，这里同理，也应该是引用
    // - batch_size(usize): 因为我们设计了一个任务池，这里要给一个池子大小
    // - timeout: 扫描器进行扫描的超时时间
    let scanner = Scanner::new(
        host,
        posts,
        1000,                        // 池子大小设置为 1000
        Duration::from_millis(1500), // 超时设置为 1.5
    );

    // 我们现在拿到了一个扫描器对象，这个对象应该自己有一些异步方法
    // 我们创建一个 run 方法，这个 run 方法会返回所有开放的 IP:Port，也就是 Vec<SocketAddr>
    let results = scanner.run().await;

    // 现在我们拿到了 Vec<SocketAddr>，直接遍历取出就行
    for socket in results {
        println!("{}", socket);
    }
}

struct Scanner {
    host: IpAddr,
    ports: Vec<u16>,
    batch_size: usize,
    timeout: Duration,
}

impl Scanner {
    fn new(host: IpAddr, ports: Vec<u16>, batch_size: usize, timeout: Duration) -> Self {
        Self {
            host,
            ports,
            batch_size,
            timeout,
        }
    }

    async fn run(&self) -> Vec<SocketAddr> {
        let result: Vec<SocketAddr> = Vec::new();

        result
    }
}

```

### Run 方法

```rust
async fn run(&self) -> Vec<SocketAddr> {
        let mut result: Vec<SocketAddr> = Vec::new(); // 创建一个空的缓冲区，放最后的结果
        let mut tasks = FuturesUnordered::new(); // 创建任务池
        let mut port_iterator = self.ports.iter(); // 创建一个 ports 迭代器

        // 进行预填充，先放 1000 个任务对象
        for _ in 0..self.batch_size {
            // 迭代器的 next() 方法，返回的是一个 Some(T)
            if let Some(&port) = port_iterator.next() {
                let timeout = self.timeout; // 超时时间
                // 拿到 port 后，构建 socket 对象(ScoketAddr)
                let socket = SocketAddr::new(self.host, port);
                // 将动作封装成一个动作包（scan_worker），push进 task 里
                tasks.push(Scanner::scan_worker(socket, timeout));
            } else {
                // 如果端口还没填满 batch_size 就没了，直接跳出
                break;
            }
        }

        // 执行，跑完一个，造一个，放进去一个
        // tasks.next().await 会等待任意一个 future 完成
        // scan_result 是 Option<SocketAddr> 类型
        while let Some(scan_result) = tasks.next().await {
            // 把 open_socket 给拿出来
            if let Some(open_socket) = scan_result {
                // 这就是结果了，直接 push 进 result 里
                result.push(open_socket);
            }

            // 完成了一个，task 就有了一个空位，从迭代器里生成一个放进去
            if let Some(&port) = port_iterator.next() {
                let socket = SocketAddr::new(self.host, port);
                let timeout = self.timeout;
                tasks.push(Scanner::scan_worker(socket, timeout));
            }
        }

        result
    }
```

### scan_worker 方法

```rust
async fn scan_worker(socket: SocketAddr, timeout: Duration) -> Option<SocketAddr> {
        if Scanner::socket_scan(socket, timeout).await {
            Some(socket)
        } else {
            None
        }
    }
```

### socket_scan 方法

```rust
// 端口扫描的核心组件
    async fn socket_scan(socket: SocketAddr, timeout: Duration) -> bool {
        // tokio::time::timeout 接收一个 Duration 和一个 Future
        // 它会把 Future 包一层，如果超时了就返回 Err(Elapsed)
        match tokio::time::timeout(timeout, TcpStream::connect(socket)).await {
            Ok(Ok(_)) => true,
            _ => false,
        }
    }
```

## 完整代码

```rust
use futures::stream::FuturesUnordered;
use futures::StreamExt;
use std::net::{IpAddr, SocketAddr};
use std::time::Duration;
use tokio::net::TcpStream;

#[tokio::main]
async fn main() {
    let host = "127.0.0.1".parse::<IpAddr>().unwrap();
    let posts: Vec<u16> = (1..=65535).collect();

    let scanner = Scanner::new(host, posts, 1000, Duration::from_millis(1500));

    let results = scanner.run().await;

    for socket in results {
        println!("{}", socket);
    }
}

struct Scanner {
    host: IpAddr,
    ports: Vec<u16>,
    batch_size: usize,
    timeout: Duration,
}

impl Scanner {
    fn new(host: IpAddr, ports: Vec<u16>, batch_size: usize, timeout: Duration) -> Self {
        Self {
            host,
            ports,
            batch_size,
            timeout,
        }
    }

    async fn scan_worker(socket: SocketAddr, timeout: Duration) -> Option<SocketAddr> {
        if Scanner::socket_scan(socket, timeout).await {
            Some(socket)
        } else {
            None
        }
    }

    async fn run(&self) -> Vec<SocketAddr> {
        let mut result: Vec<SocketAddr> = Vec::new();
        let mut tasks = FuturesUnordered::new();
        let mut port_iterator = self.ports.iter();

        for _ in 0..self.batch_size {
            if let Some(&port) = port_iterator.next() {
                let timeout = self.timeout;

                let socket = SocketAddr::new(self.host, port);

                tasks.push(Scanner::scan_worker(socket, timeout));
            } else {
                break;
            }
        }

        while let Some(scan_result) = tasks.next().await {
            if let Some(open_socket) = scan_result {
                result.push(open_socket);
            }

            if let Some(&port) = port_iterator.next() {
                let socket = SocketAddr::new(self.host, port);
                let timeout = self.timeout;
                tasks.push(Scanner::scan_worker(socket, timeout));
            }
        }

        result
    }

    async fn socket_scan(socket: SocketAddr, timeout: Duration) -> bool {
        match tokio::time::timeout(timeout, TcpStream::connect(socket)).await {
            Ok(Ok(_)) => true,
            _ => false,
        }
    }
}

```
