---
title: Windows 进程监控工具：Process Monitor
published: 2025-10-08
description: 介绍如何在 Windows 下使用 Process Monitor 进行进程监控与分析，包含安装、使用方法与常见场景。
tags: [Windows, 进程监控]
category: 工具脚本
draft: false
---


## 简介

### 工具介绍

Process Monitor 是一款由 Microsoft Sysinternals 开发的高级监控工具，专为 Windows 操作系统设计。它能够实时显示文件系统、注册表和进程/线程活动，为系统故障诊断、恶意软件检测以及应用程序行为分析提供了强大的功能。

**主要功能与特性：**

1.  **文件系统监控：** Process Monitor 能够捕获所有文件和目录的访问事件，包括创建、读取、写入、删除等操作。这对于追踪应用程序如何与文件系统交互，以及识别潜在的文件访问问题至关重要。
2.  **注册表监控：** 该工具实时记录对注册表的读写、创建、删除键值等操作。这有助于用户了解应用程序如何修改系统配置，以及识别未经授权的注册表活动。
3.  **进程与线程活动监控：** Process Monitor 提供详细的进程和线程活动信息，包括进程启动/退出、线程创建/销毁、模块加载/卸载等。用户可以借此分析应用程序的生命周期和资源使用情况。
4.  **网络活动追踪：** 尽管不是专业的网络嗅探工具，Process Monitor 也能显示进程发起的 TCP/UDP 网络连接，包括远程地址和端口，辅助分析应用程序的网络通信行为。
5.  **强大的过滤和搜索功能：** 面对海量的事件数据，Process Monitor 提供了高度可定制的过滤规则，允许用户根据进程名称、PID、事件类型、路径等多种条件进行筛选，快速定位感兴趣的事件。
6.  **事件属性详情：** 每一条捕获的事件都包含丰富的属性信息，如时间戳、进程名称、PID、操作类型、结果、路径、堆栈跟踪等，为深入分析提供了全面数据。

Process Monitor 集成了 Sysinternals 早期工具 Filemon 和 Regmon 的功能，并在此基础上进行了增强，使其成为 IT 专业人员、开发人员和高级用户诊断和解决 Windows 系统问题的不可或缺的工具。它在分析应用程序运行时行为、排查权限问题、检测隐藏的系统活动等方面表现出色。

### 工具下载

工具可以在微软 Sysinternals 中找到：[Process Monitor - Microsoft Learn][procmon-learn]

### 工具截图

下面是该工具的截图

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-1.png" alt="Process Monitor 截图" width="1225" />

## 工具使用

下面我们介绍一下这个工具的使用

### 基础操作

#### 主题|字体

设置主题，在上方菜单栏中，找到 `Options -> Theme`，可以设置 `Dark` 和 `Light`

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-2.png" alt="主题设置" width="500" />

设置字体，在上方菜单栏中，找到 `Options -> Font`，可以设置系统中的其他字体

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-3.png" alt="字体设置" width="389" />

#### 监控|滚动|清除

我们先看红框里的这三个（前面那两个下面说）

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-9.png" alt="监控、滚动、清除" width="975" />

从左往右分别是

- 开始监控
- 自动滚动主窗口的滚动条会自动向下滚动，确保屏幕上始终显示的是最新捕获到的事件。
- 清除：将事件清空

#### 筛选|高亮|快速 PID 筛选

接着看这三个

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-10.png" alt="筛选、高亮、PID" width="825" />

从左往右分别是：

Filter：设置过滤条件

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-11.png" alt="Filter 设置" width="625" />

HighLight：设置高亮

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-12.png" alt="HighLight 设置" width="775" />

Include Process From Windows：长按这个按钮会出现一个准心一样的东西，你可以把它拖到程序窗口上，它会自动识别并 Include。相当于设置了 PID 的 Include 的筛选条件

#### 进程树|事件属性

最后看再看这四个（后面那五个图标下面说）

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-13.png" alt="进程树、事件属性等" width="650" />

从左到右分别是：进程树、事件属性、查找、`Jump to Object`

进程树：

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-14.png" alt="进程树详情" width="875" />

在左下角可以进行

1. 快速查看事件
2. 快速筛选

事件属性（就是在事件上双击）

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-15.png" alt="事件属性" />

查找（就是 `Ctrl + F`），没啥好说的

`Jump to Object`，这是一个联动功能。比如说你发现一条注册表异常，使用该功能可以快速打开注册表编辑器；发现对 `config.ini` 进行读写操作，可以快速打开这个文件。

#### Symbols 配置

在 `Options -> Configure Symbols` 这里可以配置 Symbols

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-6.png" alt="Symbols 配置" width="575" />

这个功能是来看堆栈函数用的，将内存地址通过 [Microsoft Symbol Server][ms-symbols] 翻译为函数名。

当 ProcMon 需要解析一个属于 Windows 操作系统自身的模块（比如 `kernel32.dll`, `ntdll.dll` 等）的函数名时，它会自动根据这个地址去微软的服务器上下载对应的符号文件，并缓存到本地。这样一来，我们就能看到所有系统函数的名称。

**保持默认不用管它**

#### 事件数据存储

##### Save 和 Open

Process Monitor 使用 `.PML` 作为日志文件，我们可以将当前的事件保存为 `.PML` 格式，方便下次打开。

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-16.png" alt="Save 操作" width="550" />

Save 操作可以将当前的 Event 按照筛选条件保存到本地，并支持 `PML`、`CSV`、`XML` 格式

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-17.png" alt="Save 选项" />

其实默认就行，下面简单介绍一下

- All events：选择此项会保存自本次捕获开始以来的**全部**原始事件记录
- Events displayed using current filter：使用当前过滤器显示的事件
    - Also include profiling events：同时包含性能分析事件
- Highlighted events：**只保存**那些被你的高亮规则标记为高亮的事件。
- Native Process Monitor Format (PML)：保存为 PML
- Comma-Separated Values (CSV)：保存为 CSV
- Extensible Markup Language (XML)：保存为 XML
    - Include stack traces (will increase file size)：勾选后，会在导出的文件中为每个事件附加上它的函数调用堆栈信息。
    - Resolve stack symbols (will be slow)：如果你勾选了上一项来包含堆栈，那么此项会尝试将堆栈中的内存地址**解析成函数名**

##### Backing Files

在上方菜单栏中，找到 `File -> Backing Files..`，这里可以设置数据的存储方式

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-4.png" alt="Backing Files" width="1050" />

有两种存储方式：

- Use virtual memory：这个选项告诉 Process Monitor 将所有捕获的事件数据存储在系统的**虚拟内存**中。
    - 读写内存通常比直接读写硬盘文件要快，因此理论上性能会更好一些。
    - 可用空间受到"系统提交限制"的制约，这基本上是你的物理内存大小加上页面文件大小的总和。图片中当前可用空间为 `7407 MB`。如果捕获的事件过多，超出了这个限制，Process Monitor 就会停止捕获新事件。
- Use file named：这个选项告诉 Process Monitor 将所有事件数据直接存储到你在下方路径框中指定的文件中（即 `.PML` 文件）。图中就是存储在一个本地文件中。

上面有一个 `These backing file objects are being used to store event data:`，这里代表了目前存储记录了哪些内容

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-5.png" alt="Backing Files 状态" width="975" />

| CN               | Key                               | 解释说明                                                                                                                                                                                   |
| ---------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name             | C:\Users\trtyr\Documents\demo.PML | 文件名和路径。它指明了当前用来存储事件数据的后备文件的位置和名称。`.PML` 是 Process Monitor Log 文件的标准扩展名。                                                                         |
| Event Count      | 80,461                            | 事件总数。这是到目前为止，ProcMon 已经捕获并记录到后备文件中的系统事件的总数量。每一条文件读写、注册表访问等操作都算一个事件。                                                             |
| Event Bytes      | 32,301,821                        | 事件数据大小。这表示已存储的 80,461 个事件所占用的总空间大小，单位是字节 (Bytes)。这里大约是 32.3 MB。                                                                                     |
| Pending Events   | 0                                 | 待处理事件数。指的是 ProcMon 已经捕获，但还在内存缓冲区中，尚未完全写入到后备文件里的事件数量。这个值通常很小或者为 0，表示数据写入很及时。如果这个数字很大，可能意味着磁盘 I/O 存在瓶颈。 |
| Process Count    | 122                               | 进程总数。这表示在监控期间，产生了事件的独立进程的数量。也就是说，有 122 个不同的程序或系统进程被监控到了活动。                                                                            |
| Dictionary Count | 2,715                             | Dictionary Count。ProcMon 内部会维护一个"Dictionary"来存储和复用重复的字符串（如路径、进程名、注册表键等），以节省空间。这个数字代表当前字典中唯一字符串条目的数量。                       |
| Icon Count       | 27                                | Icon Count。为了在界面上显示不同进程的图标，ProcMon 会缓存这些图标。这表示它已经为 27 个不同的进程加载并缓存了图标。                                                                       |
| Committed        | No                                | 是否已提交。这个状态通常与内存管理有关。当使用虚拟内存作为后备存储时，它表示内存页面是否已"提交"（即物理存储已分配）。当使用文件时，No 通常是正常状态，表示文件还在被积极地写入和管理中。  |

注意，如果你使用了清空，这里也会被清空

##### Save 和 Backing Files

Backing Files 可以理解为，实时抓捕的东西放哪，它虽然也能作为备份，但是不能像 Save 那样多样化的存储，一般不用。

Save 就是正常理解的 Save 了。

#### PMC 配置管理

ProcMon 使用 `.pmc` 来管理配置（**PMC** 是 **P**rocess **M**onitor **C**onfiguration 的缩写）。一个 `.pmc` 文件几乎包含了我们对 ProcMon 所做的所有个性化设置，主要包括：

- 过滤规则：这是最重要的部分。
- 高亮规则：你设置的用于高亮特定事件的颜色规则。
- 列的显示/隐藏与顺序：你在主窗口中选择显示了哪些列，以及它们的排列顺序和宽度。
- 字体和符号设置：包括界面字体大小、符号服务器路径等。
- 其他窗口选项

我们可以测试一下。这是当前的设置

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-7.png" alt="当前设置" width="1300" />

导入一个之前的配置

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-8.png" alt="导入配置" width="1200" />

### Filter 设置

过滤是使用 PM 的核心。

#### 怎么进行筛选

怎么筛选？点开筛选按钮，我们可以看到如下界面

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-19.png" alt="筛选界面" width="675" />

| 组件            | 解释                           | 例子                                                                 |
| --------------- | ------------------------------ | -------------------------------------------------------------------- |
| Column (列)     | 你想基于哪一列的信息来筛选？   | `Process Name` (进程名), `Path` (路径), `Result` (结果)              |
| Relation (关系) | 你设定的条件是什么样的关系？   | `is` (是), `is not` (不是), `contains` (包含), `ends with` (以…结尾) |
| Value (值)      | 具体的条件内容是什么？         | `chrome.exe`, `C:\Windows`, `SUCCESS`                                |
| Action (动作)   | 满足以上条件的事件要如何处理？ | `Include` (包含/只看), `Exclude` (排除/不看)                         |

下面会有一些例子来进行筛选。

#### Event Class

Even Class 指的是 PM 能够捕捉监控的事件类型

##### 都有哪些 Event Class

我们打开筛选，选择 `Event Class`，我们能够看到有这些 Class

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-18.png" alt="Even Class" />

- File System：这个类别包含了所有与**文件和文件夹**相关的操作。任何程序对硬盘上文件的读、写、创建、删除、重命名或查询等活动，都属于这个类别。
- Network：这个类别包含了所有的**网络通信**活动。比如程序访问网站、发送/接收数据、进行 DNS 查询等。
- Process：这个类别包含了与**进程和线程生命周期**相关的事件。例如一个新进程的启动、一个进程的退出、线程的创建与销毁，以及加载动态链接库 (DLL) 等。
- Profiling：这是一个相对特殊的类别。它与具体的文件或网络操作无关，而是 ProcMon 定期抓取的**线程性能快照**。它会记录在某个时间点，系统中的线程正在执行什么代码（即线程的调用堆栈）。
- Registry：这个类别包含了所有与 **Windows 注册表**相关的操作。任何对注册表的读取、写入、创建或删除键/值的行为都属于此类。

##### Even Class 快速筛选

这五个图标可以快速对 Class 进行筛选

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-20.png" alt="Class 快速筛选" />

从左到右分别是：

- Registry
- File System
- Network
- Process（还有 Thread）
- Profiling

比如说下图就是筛选 Network

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-21.png" alt="Network 筛选" width="1250" />

#### Operation

每个 Class 下都会有各个 Operation，我们可以在筛选里看到

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-22.png" alt="Operation 筛选" />

有很多操作，下面简单介绍一下

##### 文件系统操作

这类操作涉及对文件、目录和卷（磁盘驱动器）的所有交互。

| Operation                                   | 说明                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CreateFile                                  | 请求访问文件/目录。这是一个极其常见的操作，其名称有误导性。它不仅用于创建文件，更多是用于打开一个已存在的文件或目录，以便进行读取、写入、查询等后续操作。                                                                                                                                                                                                                                                                  |
| CloseFile                                   | 关闭文件句柄。当程序完成了对一个文件的所有操作后，会通过此操作释放对该文件的占用。                                                                                                                                                                                                                                                                                                                                         |
| ReadFile                                    | 读取文件内容。从一个已打开的文件中读取数据。                                                                                                                                                                                                                                                                                                                                                                               |
| WriteFile                                   | 写入文件内容。向一个已打开的文件中写入数据。                                                                                                                                                                                                                                                                                                                                                                               |
| LockFile / UnlockFileSingle / UnlockFileAll | 锁定/解锁文件。锁定文件的一部分或全部，以防止其他进程同时修改，保证数据一致性。之后再进行解锁。                                                                                                                                                                                                                                                                                                                            |
| FlushBuffersFile                            | 刷新文件缓冲区。将内存中尚未写入磁盘的文件数据，强制立即写入到物理磁盘中，以防止数据丢失。                                                                                                                                                                                                                                                                                                                                 |
| Query…File / Query…Volume                   | 查询文件/卷信息。这是一大类操作，用于获取文件、目录或卷的各种属性信息，而不读取文件内容本身。常见的有： <br>- QueryBasicInformationFile: 获取基本信息（如创建/修改时间、属性）。 <br>- QueryStandardInformationFile: 获取标准信息（如文件大小）。 <br>- QuerySecurityFile: 获取文件的安全描述符（权限信息）。 <br>- QueryDirectory: 枚举目录下的文件和子目录。 <br>- QueryNetworkOpenInformationFile: 获取网络文件的信息。 |
| Set…File / Set…Volume                       | 设置文件/卷信息。这也是一大类操作，用于修改文件或目录的属性信息。常见的有：<br>- SetBasicInformationFile: 设置基本信息（如时间戳）。 <br>- SetRenameInformationFile: 重命名或移动文件。 <br>- SetDispositionInformationFile: 设置文件处置信息。这通常是删除文件的标志性操作。                                                                                                                                              |
| CreateFileMapping                           | 创建文件映射。将一个文件映射到进程的虚拟内存空间中，之后可以像操作内存一样直接读写文件，通常用于高性能 I/O 或进程间共享数据。                                                                                                                                                                                                                                                                                              |
| FileSystemControl                           | 文件系统控制。执行各种高级的文件系统级别操作，例如获取卷信息、锁定卷等。                                                                                                                                                                                                                                                                                                                                                   |
| VolumeMount / VolumeDismount                | 加载/卸载卷。例如插入 U 盘时会触发 VolumeMount，安全弹出 U 盘时会触发 VolumeDismount。                                                                                                                                                                                                                                                                                                                                     |

##### 注册表操作

这类操作涉及对 Windows 注册表的所有读、写、创建和删除活动。

| Operation                               | 说明                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| RegOpenKey / RegOpenKey2                | 打开注册表项。类似于 CreateFile，这是对注册表项进行任何操作前的第一步，用于获取该项的句柄。 |
| RegCloseKey                             | 关闭注册表项。操作完成后，释放对注册表项的占用。                                            |
| RegCreateKey                            | 创建注册表项。在注册表中创建一个新的项（类似于文件夹）。                                    |
| RegDeleteKey                            | 删除注册表项。从注册表中删除一个项。                                                        |
| RegQueryValue                           | 查询键值。读取一个注册表项中特定"值"的数据。这是程序读取配置时最常见的操作。                |
| RegSetValue                             | 设置键值。向一个注册表项中写入或修改一个"值"的数据。                                        |
| RegDeleteValue                          | 删除键值。删除一个注册表项下的某个"值"。                                                    |
| RegEnumValue / RegEnumKey               | 枚举值/项。遍历一个注册表项下的所有值或所有子项。                                           |
| RegQueryKey                             | 查询项信息。获取一个注册表项的元数据，例如它有多少个子项、多少个值、上次修改时间等。        |
| RegQueryKeySecurity / RegSetKeySecurity | 查询/设置项安全。读取或修改注册表项的访问权限。                                             |
| RegLoadKey / RegUnloadKey               | 加载/卸载配置单元。将一个独立的注册表文件（hive）加载到注册表树中，或将其卸载。             |
| RegSaveKey / RegRestoreKey              | 保存/恢复项。将一个注册表项及其所有子项保存到一个文件中，或从文件中恢复。                   |
| RegFlushKey                             | 刷新注册表项。将对注册表的修改强制写入磁盘。                                                |

##### 网络操作

这类操作涉及所有基于 TCP 和 UDP 协议的网络通信。

| Operation                               | 说明                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| TCP Connect / UDP Connect               | 建立连接。客户端尝试与服务器的特定 IP 地址和端口建立 TCP 或 UDP 连接。                                       |
| TCP Accept                              | 接受连接。服务器端接受一个来自客户端的 TCP 连接请求。                                                        |
| TCP Send / UDP Send                     | 发送数据。通过已建立的连接发送网络数据包。                                                                   |
| TCP Receive / UDP Receive               | 接收数据。接收传入的网络数据包。                                                                             |
| TCP Disconnect / UDP Disconnect         | 断开连接。关闭一个 TCP 或 UDP 连接。                                                                         |
| TCP Retransmit                          | TCP 重传。当发送的数据包未能得到对方确认时，TCP 协议会重新发送该数据包。频繁出现此操作可能表示网络状况不佳。 |
| TCP Other / UDP Other / TCP/UDP Unknown | 其他/未知操作。一些不常见的 TCP/UDP 控制操作。                                                               |
| TCP TCPCopy / UDP TCPCopy               | TCP 数据复制。表示网络数据在内核缓冲区中的复制操作。                                                         |

##### 进程与线程操作

| Operation                            | 说明                                                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Process Create / Process Start       | 创建进程。一个程序启动了另一个新的程序。Process Start 是 Process Create 事件的补充，提供了更多关于新进程的信息。     |
| Process Exit                         | 进程退出。一个程序执行完毕或被终止。                                                                                 |
| Thread Create                        | 创建线程。一个进程内部创建了一个新的执行线程来并发执行任务。                                                         |
| Thread Exit                          | 线程退出。进程内的一个执行线程完成了它的任务并退出。                                                                 |
| Load Image                           | 加载映像。一个进程加载了一个动态链接库 (DLL) 或一个可执行文件 (EXE) 到其内存空间中。这是程序启动和运行时的核心活动。 |
| Process Profiling / Thread Profiling | 进程/线程分析。用于性能分析的事件，系统定期对进程或线程的活动状态进行采样（抓取调用堆栈）。                          |
| Process Statistics                   | 进程统计。提供关于进程资源使用的统计信息。                                                                           |

##### 系统与设备操作

这类操作涉及与硬件设备、系统控制和电源管理等相关的底层活动。

| Operation (操作)                                    | 详细说明                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| DeviceIoControl / InternalDeviceIoControl           | 设备 I/O 控制。应用程序或驱动程序向硬件设备驱动发送控制命令，是与硬件交互的主要方式。 |
| SystemControl                                       | 系统控制。与 Windows 管理规范(WMI)相关的系统级控制和查询。                            |
| CancelRemoveDevice / RemoveDevice / SurpriseRemoval | 设备移除。与硬件设备的安全移除或意外移除（如直接拔掉 U 盘）相关的事件。               |
| Eject / StopDevice                                  | 弹出/停止设备。通常与"安全删除硬件"功能相关。                                         |
| Power / Shutdown                                    | 电源/关机。与系统电源状态改变（如休眠、唤醒）或系统关闭流程相关的事件。               |
| CreatePipe / CreateMailSlot                         | 创建管道/邮槽。创建用于进程间通信(IPC)的机制。                                        |
| Debug Output Profiling                              | 调试输出分析。捕获通过 OutputDebugString API 发送的调试信息。                         |

#### Count Occurrences 快速筛选

Count Occurrences 在 `Event -> Count Occurrences` 这里。

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-24.png" alt="Count Occurrences" width="488" />

这是一个非常实用的**数据汇总和分析工具**。它的作用是，当你对某个单元格的值（比如一个进程名、一个操作类型或一个结果）感到好奇时，它可以快速地告诉你：**在当前显示的事件列表中，这一列里每个不同的值分别出现了多少次**。

在 `Column` 中进行筛选

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-26.png" alt="Column 筛选" />

然后点击右上角的 `Count` 可以进行统计。统计的结果可以进行右键进行快速筛选设置

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-25.png" alt="Count 统计" width="800" />


#### Filter 配置保存

我们可以将当前设置的 Filter 进行保存：`Filter -> Save Filter`

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-27.png" alt="Filter 配置保存" />

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-28.png" alt="Filter 配置保存 2" />

如果想要导出的话，需要使用 `Filter -> Organize Filters`

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-29.png" alt="导出 Filter" width="334" />

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-30.png" alt="导出 Filter 2" />

## 右键快速操作

我们选择一个 Event，可以通过右键快速地进行操作


<!-- 链接引用定义 -->
[procmon-learn]: https://learn.microsoft.com/en-us/sysinternals/downloads/procmon "Process Monitor - Microsoft Learn"
[ms-symbols]: https://msdl.microsoft.com/download/symbols "Microsoft Symbol Server"

<img src="https://personal-knowledge-base-1314508256.cos.ap-shanghai.myqcloud.com/Asset/images/Windows%20%E8%BF%9B%E7%A8%8B%E7%9B%91%E6%8E%A7%E5%B7%A5%E5%85%B7%EF%BC%9AProcess%20Monitor-23.png" alt="右键操作" />
