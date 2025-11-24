---
title: Havoc C2 Framework 初步使用教程
published: 2025-11-24
description: 介绍 Havoc C2 Framework 的架构、安装步骤以及初步使用方法，包括 Teamserver 和 Client 的配置与上线测试。
tags: [Havoc, C2, 渗透测试]
category: 网络安全
draft: false
---

## Havoc Framework 介绍

### 简介

**Havoc Framework**  是一个现代化且具有高度可塑性的 C2 框架。它专为渗透测试人员、红队和蓝队设计。

- **作者**：Paul Ungur (@C5pider)
- **性质**：免费、开源
- **核心理念**：Havoc 的设计初衷并非开箱即用的免杀，而是追求模块化和可塑性。它赋予操作者根据目标环境定制功能和模块的能力，从而实现规避检测。

### 架构与工作原理

Havoc Framework 主要分为两个核心部分：**Teamserver**  和  **Client**。

#### Teamserver

Teamserver 是框架的核心枢纽，通常部署在公共 VPS 上。

- **语言**：使用  **Golang**  编写。
- **功能**：
    - 处理已连接的操作员（Operators）。
    - 负责 Agent 的任务下发。
    - 解析回调数据。
    - 管理监听器（Listeners，支持 HTTP/HTTPS）。
    - 处理从 Agent 下载的文件和截图。
    - 支持多人协作。
    - 负责 Payload 生成（exe/shellcode/dll）。
    - 支持外部 C2（External C2）。

#### Client

Client 是 Operators 使用的用户界面，用于与服务器交互。

- **语言**：使用  **C++**  和  **Qt**  编写。
- **界面**：提供跨平台的用户界面，采用基于 Dracula 的现代深色主题。
- **功能**：操作员通过客户端对 Agent 下达命令并接收执行结果。

#### Demon Agent

**Demon**  是 Havoc 框架的 Agent，使用  **C**  和  **汇编**  编写，具备众多高级的对抗技术特性：

- **睡眠混淆 (Sleep Obfuscation)**：支持多种技术，如 Ekko、Ziliean 或 FOLIAGE。
- **堆栈处理**：支持睡眠期间的堆栈复制。
- **地址欺骗**：支持 `x64` 返回地址欺骗。
- **系统调用**：针对  `Nt*` API 使用间接系统调用。
- **防护绕过**：通过硬件断点修补 AMSI 和 ETW。
- **其他功能**：
    - 支持 SMB 通信。
    - 令牌库（Token vault）。
    - 内置多种后渗透命令。
    - 代理库加载（Proxy library loading）。

#### 扩展性

Havoc 提供了强大的扩展能力，允许用户根据需求进行定制：

- **外部 C2**：支持通过外部通道进行命令控制。
- **自定义 Agent 支持**：除了 Demon，还支持自定义 Agent（例如 Talon）。
- **Python API**：提供 Python 接口用于自动化或扩展。
- **模块化**：支持社区贡献的模块扩展功能。

## Havoc Framework 安装

下面，我们将在 Kali Linux 上安装 Havoc Framework

### 安装系统依赖

在安装项目前，我们需要先安装相关的系统依赖

```bash
sudo apt update

sudo apt install -y git build-essential apt-utils cmake libfontconfig1 libglu1-mesa-dev libgtest-dev libspdlog-dev libboost-all-dev libncurses5-dev libgdbm-dev libssl-dev libreadline-dev libffi-dev libsqlite3-dev libbz2-dev mesa-common-dev qtbase5-dev qtchooser qt5-qmake qtbase5-dev-tools libqt5websockets5 libqt5websockets5-dev qtdeclarative5-dev golang-go qtbase5-dev libqt5websockets5-dev python3-dev libboost-all-dev mingw-w64 nasm
```

拉取项目

```bash
git clone https://github.com/HavocFramework/Havoc.git
cd Havoc
```

::github{repo="HavocFramework/Havoc"}

### 构建 Teamserver

#### 下载 Go 依赖

在编译 Teamserver 时，会用到 Go 和 Python，Go 的话我们上面已经安装过了，Python 的话，这里我选择使用 uv 进行管理

```bash
cd teamserver
go mod download
```

#### 修改 Install.sh

`teamserver` 文件夹里的 `Install.sh` 存在问题，我们需要修改一下

```shell
#!/bin/bash

if [ ! -d "dir/x86_64-w64-mingw32-cross" ]; then
	sudo apt -qq --yes install golang-go nasm mingw-w64 wget >/dev/null 2>&1

	if [ ! -d "data" ]; then
		sudo mkdir data
	fi

	sudo wget https://musl.cc/x86_64-w64-mingw32-cross.tgz -q -O /tmp/mingw-musl-64.tgz

	sudo tar zxf /tmp/mingw-musl-64.tgz -C data

	sudo wget https://musl.cc/i686-w64-mingw32-cross.tgz -q -O /tmp/mingw-musl-32.tgz

	sudo tar zxf /tmp/mingw-musl-32.tgz -C data
fi
```

#### 构建 Teamserver

我们回到 Havoc 的根目录，进行构建

```bash
cd ../
make ts-build
```

> [!NOTE]
>
> 如果出现类似 `/tmp/mingw-musl-64.tgz: 权限不够` 的错误，请执行下面的命令
>
> ```bash
> sudo rm /tmp/mingw-musl-64.tgz
> sudo rm /tmp/mingw-musl-32.tgz
> sudo make clean
> ```

我们可以得到一个叫做 `havoc` 的可执行文件

![Havoc C2 Framework 初步使用教程-1.png](https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Havoc%20C2%20Framework%20%E5%88%9D%E6%AD%A5%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B-1.png)

### 构建 Client

使用如下命令构建 Client

```bash
make client-build
```

## 运行 Havoc

现在 Teamserver 和 Client 已经准备就绪，可以开始运行它们了。

### 运行 Teamserver

我们需要使用一个配置文件来启动 Teamserver。Havoc 已经提供了一个默认配置文件  `profiles/havoc.yaotl`。

```bash
./havoc server --profile ./profiles/havoc.yaotl -v
```

- `--profile`: 指定服务器的配置文件。
- `-v`: 显示详细的日志输出。

![Havoc C2 Framework 初步使用教程-2.png](https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Havoc%20C2%20Framework%20%E5%88%9D%E6%AD%A5%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B-2.png)

### 启动 Client

在另一个终端窗口中启动客户端。

> [!NOTE]
>
> 客户端是需要图形化界面的

```bash
./havoc client
```

启动后，会弹出一个图形化登录窗口。你需要填写 Teamserver 的连接信息：

- **Profile Name**: 给这个连接起一个名字（例如：Local Havoc）。
- **Host**: 你的 Teamserver IP 地址（如果是本地运行，填  `127.0.0.1`）。
- **Port**: 端口号（默认为  `40056`）。
- **User**: 用户名（默认为  `Neo`）。
- **Password**: 密码（默认为  `password1234`）。

登陆后如下

![Pasted image 20251125124227.png](https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Pasted%20image%2020251125124227.png)

这些默认值可以在 `profiles/havoc.yaotl` 文件中查看和修改。

![Havoc C2 Framework 初步使用教程-4.png](https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Havoc%20C2%20Framework%20%E5%88%9D%E6%AD%A5%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B-4.png)

## 上线测试

我们测试一下上线

### 创建 Listener

![Havoc C2 Framework 初步使用教程-5.png](https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Havoc%20C2%20Framework%20%E5%88%9D%E6%AD%A5%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B-5.png)

### 生成 Payload

![Havoc C2 Framework 初步使用教程-6.png](https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Havoc%20C2%20Framework%20%E5%88%9D%E6%AD%A5%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B-6.png)

![Havoc C2 Framework 初步使用教程-7.png](https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Havoc%20C2%20Framework%20%E5%88%9D%E6%AD%A5%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B-7.png)

### EXE 上线

![Havoc C2 Framework 初步使用教程-8.png](https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Havoc%20C2%20Framework%20%E5%88%9D%E6%AD%A5%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B-8.png)

![Havoc C2 Framework 初步使用教程-9.png](https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Havoc%20C2%20Framework%20%E5%88%9D%E6%AD%A5%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B-9.png)
