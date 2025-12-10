---
title: Windows 终端美化指南：Oh My Posh + 主题 + 插件
published: 2025-10-04
description: 详细介绍如何在 Windows 终端中使用 Oh My Posh 进行美化，包含字体、主题、插件的安装与配置方法。
tags: [PowerShell,美化]
category: 工具脚本
draft: false
---

## 快速开始

### 安装 Oh My Posh

前往 [Oh My Posh 官网](https://ohmyposh.dev/docs/installation/windows) 查看详细安装说明。

```powershell
winget install JanDeDobbeleer.OhMyPosh --source winget --scope user --force
```

如需为所有用户安装，将 `--scope user` 替换为 `--scope machine`。


### 安装 Nerd Font 字体

推荐 [JetBrainsMono Nerd Font](https://www.nerdfonts.com/font-downloads)。

### 配置 PowerShell

查找你的 `$PROFILE` 路径：

```powershell
echo $PROFILE
```

若文件不存在，先创建：

```powershell
New-Item -Path $PROFILE -Type File -Force
```

编辑配置文件，添加：

```powershell
oh-my-posh init pwsh | Invoke-Expression
```

重启终端即可生效。

## 个性化主题

主题库见 [官方主题库](https://ohmyposh.dev/docs/themes)。

如选用 `1_shell` 主题，在 PowerShell 配置文件中添加：

```powershell
oh-my-posh init pwsh --config "https://github.com/JanDeDobbeleer/oh-my-posh/blob/main/themes/1_shell.omp.json" | Invoke-Expression
```

重启终端即可看到新主题效果。

## 插件推荐

### PSReadLine 自动补全

安装：

```powershell
Install-Module PSReadLine -Scope CurrentUser -Force
```

在 `$PROFILE` 中添加：

```powershell
Import-Module PSReadLine
Set-PSReadLineOption -PredictionViewStyle ListView
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -HistorySearchCursorMovesToEnd
Set-PSReadLineKeyHandler -Key Tab -Function MenuComplete
```

效果：


```powershell
  xxx on Saturday at 1:57 PM                                                           0.016s    MEM: 95% (15/15GB)
  {  home }  cle
<-/4>                                                                                   <History(4)>
> clear                                                                                    [History]
> cleart                                                                                   [History]
> clea                                                                                     [History]
> cd 'D:\$RECYCLE.BIN\'                                                                    [History]


```

```powershell
  xxx on Saturday at 1:58 PM                                                               0s    MEM: 95% (15/15GB)
  {  home }  .\Links\
Links                                      LockAppHost.exe
Local Settings                             LockScreenContentServer.exe
L:                                         lodctr.exe
label.exe                                  logagent.exe
LanguageComponentsInstallerComHandler.exe  logman.exe
launcher.exe                               logoff.exe
LaunchTM.exe                               LogonUI.exe
LaunchWinApp.exe                           lp
LegacyNetUXHost.exe                        lpkinstall.exe
LicenseManagerShellext.exe                 lpksetup.exe
licensingdiag.exe                          lpremove.exe
LicensingUI.exe                            ls
Limit-EventLog                             LsaIso.exe
LocationNotificationWindows.exe            lsass.exe
Locator.exe                                ltedit.bat
Lock-BitLocker                             lusrmgr.msc
```

```powershell
  xxx on Saturday at 1:58 PM                                                               0s    MEM: 95% (15/15GB)
  {  home }  cd .\.vscode\
.vscode           Contacts          Favorites         NetHood           Recent            Videos
「开始」菜单      Cookies           Links             OneDrive          Saved Games
3D Objects        Desktop           Local Settings    OpenVPN           Searches
AppData           Documents         Music             Pictures          SendTo
Application Data  Downloads         My Documents      PrintHood         Templates

```

### ZLocation 目录跳转

安装：

```powershell
Install-Module ZLocation -Scope CurrentUser
```

在 `$PROFILE` 中添加：

```powershell
Import-Module ZLocation
```

效果：


```powershell
 z

Weight Path
------ ----
     6 C:\Users\xxx
     0 C:\Users\xxx\Desktop
     0 C:\Users\xxx\Documents
     0 C:\Users\xxx\Documents\WindowsPowerShell
     0 C:\Users\xxx\Downloads
     0 C:\Users\xxx\Pictures
     0 D:\Env
     0 D:\Env\Rust
     0 D:\SoftWare
     0 E:\Document\配置备份\chatwise.zip


 z env
 pwd

Path
----
D:\Env


 z -
 pwd

Path
----
C:\Users\xxx



  xxx on Saturday at 2:04 PM                                                               0s    MEM: 95% (15/15GB)
  {  home } 
```

---

## 我的完整配置示例

```powershell
oh-my-posh init pwsh --config "https://github.com/JanDeDobbeleer/oh-my-posh/blob/main/themes/1_shell.omp.json" | Invoke-Expression
Import-Module PSReadLine
Set-PSReadLineOption -PredictionViewStyle ListView
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -HistorySearchCursorMovesToEnd
Set-PSReadLineKeyHandler -Key Tab -Function MenuComplete
Import-Module ZLocation
```

## 卸载与清理

1. 卸载 Oh My Posh：
   ```powershell
   winget uninstall JanDeDobbeleer.OhMyPosh
   ```
2. 卸载 PowerShell 模块：
   ```powershell
   Uninstall-Module oh-my-posh -AllVersions
   ```
3. 删除配置文件：
   ```powershell
   Remove-Item $env:POSH_PATH -Force -Recurse -ErrorAction SilentlyContinue
   Remove-Item $env:USERPROFILE\.config\ohmyposh -Force -Recurse -ErrorAction SilentlyContinue
   ```
4. 编辑 PowerShell 配置文件（`$PROFILE`），移除相关配置。
