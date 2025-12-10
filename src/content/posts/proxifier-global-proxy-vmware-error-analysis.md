---
title: Proxifier 全局代理导致 VMware 错误分析
published: 2025-12-12
description: 分析 Proxifier 设置全局代理后导致 VMware 启动失败的问题，包含错误日志分析和解决方案。
tags: [VMware, Proxifier, 代理, 错误分析]
category: 工具脚本
draft: false
---

## 现象

同事突然问了一个问题，他想要用让 VMware 中虚拟机里的流量全部走向一个远端 Socks，他使用 Proxifier，并设置了全局，然后启动 VMware 发现卡住不动了。

当时懵了一下，用 Proxifier 全局代理 VMware？还真没试过，试着分析一下。

## 分析

### 正常启动分析

根据日志分析，正常情况下，VMware 的启动虚拟机的流程为：

1. **UI 预检查:**  用户点击"开启虚拟机"后，主界面进程 (`vmware.exe`) 首先去确认虚拟机文件是否健在，并快速看一眼有没有残留的锁。
2. **拉起引擎:** UI 确认无误后，启动虚拟机引擎进程 (`vmware-vmx.exe`)。
3. **加载基础依赖:**  新生的  `vmx`  进程开始加载 Windows 系统库（C++运行库、音频等）。
4. **身份与语言识别:**  进程启动内部日志，并确认 "我是谁？我在哪？"（操作系统版本、CPU 型号、语言环境）。
5. **读取全局配置:**  尝试读取  `ProgramData`  和  `AppData`  下的  `config.ini`。
6. **SSL 加密初始化:**  为可能的远程连接或加密虚拟机做准备。
7. **创建日志文件:**  引擎开始在临时目录创建自己的运行日志。
8. **建立管道 (Pipe):**  引擎与 UI 建立通道，以便将画面传给 UI。
9. **读取虚拟机描述文件 (.vmx):**  解析你配置了多少内存、硬盘在哪里。
10. **检查与创建锁:**  确保没有其他进程在动这些文件。
11. **挂载虚拟硬盘 (.vmdk):**  引擎开始操作实际的大文件。
12. **挂载光驱/ISO:**  检查挂载的 Windows 镜像。
13. **初始化 NVRAM (BIOS/UEFI):**  加载虚拟机的 BIOS 设置。
14. **DirectX 与显卡驱动加载:**  引擎发现开启了 3D 加速，开始调用宿主机的显卡。

> [!NOTE]
>
> 这只是一个根据日志分析的，粗略的流程。

### 复现错误情况

复现了一下。首先将 Proxifier 设置全局走目标代理

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Proxifier%20%E8%AE%BE%E7%BD%AE%E5%85%A8%E5%B1%80%E6%83%85%E5%86%B5%E4%B8%8B%20VMware%20%E6%8A%A5%E9%94%99%E5%88%86%E6%9E%90-2.png" alt="Proxifier 设置全局代理" width="600" />

然后启动 VMware，打开虚拟机，卡住，等待，报错。

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Proxifier%20%E8%AE%BE%E7%BD%AE%E5%85%A8%E5%B1%80%E6%83%85%E5%86%B5%E4%B8%8B%20VMware%20%E6%8A%A5%E9%94%99%E5%88%86%E6%9E%90-3.png" alt="VMware 报错界面" width="600" />

### 错误日志分析

```log
Wa(03) host-27092 CVMNet::GetVMNetList: Unable to get vnet subnet addr
Wa(03) host-27092 CVMNet::GetVMNetList: Unable to get vnet display name
```

`VMware UI` 正在尝试读取虚拟网卡列表（`VMnet1`, `VMnet8` 等）。这里连续报错 `Unable to get…`。这说明 VMware 尝试访问网络接口信息的请求被拦截或干扰了，导致它读不到子网地址。

我点击了 "打开虚拟机"，UI 进程试图连接认证守护进程（`vmware-authd`）和虚拟机引擎（`vmware-vmx`）。

```log
vix-async-pipe Cnx_Connect: Error message: Failed to read vmware-authd port number: Cannot connect to VMX: F:\Win渗透测试\Win渗透测试.vmx
Vix: ... Error VIX_E_HOST_TCP_SOCKET_ERROR ... unable to contact authd
```

报错  `TCP_SOCKET_ERROR`，这里在 IPC 通信里是比较罕见的，报错就是因为代理把流量搞走了。

VMware 内部有一个机制，它会创建一对 Socket，这就好比左手拿一个电话，右手拿一个电话，然后左手打给右手，用来测试网络通不通，或者用来在不同线程间发信号。

```log
PollSocketPairConnect: socket 2324 could not connect to a local socket, error 10061.
Poll_SocketPair: Error creating a inet socket pair: 10061/No connection could be made because the target machine actively refused it
POLL creation of signaling socket pair failed: -1
POLL socket thread remaining in degraded signaling mode.
```

每次 VMware 尝试连接本地端口，Proxifier 把流量转发给了你的代理服务器，然后被拒绝。VMware 发现这个通讯机制坏了，日志显示它进入了  `degraded signaling mode`（降级模式），试图用备用方案（Select API）

他撑了一会儿，这段时间我们还能操作一下系统，然后他撑不住了。

```log
POLL SocketPoll thread bad return value -1 from select, error 10045 (The attempted operation is not supported for the type of object referenced)
PANIC: NOT_IMPLEMENTED bora\lib\pollDefault\pollDefault.c:4388
```

VMware 调用了 Windows 的标准 API `select()`  来查询网络状态。但是，由于 Proxifier 注入了 DLL 到底层，这个 Socket 已经不再是标准的 Windows `Socket` 了。当 VMware 对这个被魔改的 `Socket` 执行操作时，Windows 内核或驱动层返回了 "不支持该操作"。

于是程序抛出  `PANIC`，打印堆栈信息（`Backtrace`），生成  `vmware.dmp`  内存转储文件，然后弹窗报错并退出。

```log
2025-12-12T05:28:50.802Z Cr(01) host-43044 PANIC: NOT_IMPLEMENTED bora\lib\pollDefault\pollDefault.c:4388
...
2025-12-12T05:28:50.830Z In(05) host-43044 CoreDump: Minidump file C:\Users\16933\AppData\Local\Temp\vmware-16933\vmware.dmp exists. Rotating …
```
