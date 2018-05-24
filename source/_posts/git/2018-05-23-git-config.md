---
file: 2018-05-23-git-config
title: git系列之配置详解
date: '2018-05-18 20:12'
categories:
  - git系列
  - git config
tags:
  - git
  - git系列
  - git config
license: nd
abbrlink: 46722
---

## Git 的配置文件

Git 自带一个 git config 的工具来帮助设置控制 Git 外观和行为的配置变量。 这些变量存储在三个不同的位置，针对三个级别`System`,`User`和`Repository`：

1.  `/etc/gitconfig` 文件(一般是 Git 的安装目录): 包含系统上每一个用户及他们仓库的`通用配置`。 如果使用带有 `--system` 选项的 git config 时，它会从此文件读写配置变量。

2.  `~/.gitconfig` 或 `~/.config/git/config` 文件(当前用户主目录)：只针对`当前用户`。 可以传递 `--global` 选项让 Git 读写此文件。

3.  当前使用仓库的 Git 目录中的 `config` 文件（就是 `.git/config`）：针对`该仓库`。

你可以通过`git config -l --show-origin`来查看当前目录下的 git 配置信息(`配置来源`+`配置`)：

<!--more-->

```bash
$ git config -l --show-origin
file:"C:\\ProgramData/Git/config"       core.symlinks=false
file:"C:\\ProgramData/Git/config"       core.autocrlf=true
file:"C:\\ProgramData/Git/config"       core.fscache=true
file:"C:\\ProgramData/Git/config"       rebase.autosquash=true
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    http.sslcainfo=C:/Program Files/Git/mingw64/ssl/certs/ca-bundle.crt
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    http.sslbackend=openssl
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    diff.astextplain.textconv=astextplain
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    filter.lfs.clean=git-lfs clean -- %f
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    credential.helper=manager
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    user.name=John Doe
file:C:/Users/Administrator/.gitconfig  user.email=suchenxiaoyu@gmail.com
file:C:/Users/Administrator/.gitconfig  user.name=suchenxiaoyu
file:C:/Users/Administrator/.gitconfig  gui.recentrepo=C:/WorkSpace/Center
file:.git/config        core.repositoryformatversion=0
file:.git/config        core.filemode=false
file:.git/config        core.bare=false
file:.git/config        core.logallrefupdates=true
file:.git/config        remote.origin.url=https://github.com/suchenrain/workspace.git
file:.git/config        remote.origin.fetch=+refs/heads/*:refs/remotes/origin/*
file:.git/config        branch.master.remote=origin
file:.git/config        branch.master.merge=refs/heads/master
file:.git/config        gui.wmstate=zoomed
file:.git/config        gui.geometry=443x321+-964+107 649 330
file:.git/config        branch.dev.remote=origin
file:.git/config        branch.dev.merge=refs/heads/dev
```

你会发现其中`user.name`在 global 和 repository 级别同时存在，此时将使用 repository 里的配置。即配置优先级：`Repository > Global > System`。

## 初次使用 Git 前的配置

### 用于提交的用户信息

当安装完 Git 应该做的第一件事就是设置你的用户名称与邮件地址。 这样做很重要，因为每一个 Git 的提交都会使用这些信息，并且它会写入到你的每一次提交中，`不可更改`：

```bash
git config --global user.name "suchenxiaoyu"
git config --global user.email suchenxiaoyu@gmail.com
```

当你想针对特定项目使用不同的用户名称与邮件地址时，可以在那个项目目录下运行没有 `--global` 选项的命令来进行配置。

{% hint danger %}
这里的用户信息并不是你的 git 账户信息，这些信息是用于每一次的提交。当然，你也可以使用你的 git 账号信息作为用户信息，这并没有什么不可以。
{% endhint%}

### 文本编辑器

设置 Git 默认使用的文本编辑器, 一般可能会是 Vi 或者 Vim。如果你有其他偏好，比如 Emacs 的话，可以重新设置：

```bash
git config --global core.editor emacs
```

如果是在 windows 上，假设你想设置 Notepad++:

```bash
git config --global core.editor "'C:/Program Files/Notepad++/notepad++.exe' -multiInst -nosession"
```

### 差异分析工具

还有一个比较常用的是，在解决合并冲突时使用哪种差异分析工具。比如要改用 vimdiff 的话：

```bash
git config --global merge.tool vimdiff
```

Git 可以理解 kdiff3，tkdiff，meld，xxdiff，emerge，vimdiff，gvimdiff，ecmerge，和 opendiff 等合并工具的输出信息。

当然，你也可以指定使用自己开发的工具，具体请参考后续文章。

### 查看配置信息

要检查已有的配置信息，可以使用 git config --list 命令：

```bash
$ git config --list
或者
$ git config -l

user.name=suchenxiaoyu
user.email=suchenxiaoyu@example.com
color.status=auto
color.branch=auto
color.interactive=auto
color.diff=auto
...
```

{% hint warning%}
有时候会看到重复的变量名，那就说明它们来自不同的配置文件（比如 /etc/gitconfig 和 ~/.gitconfig），不过最终 Git 实际采用的是最后一个。
{% endhint %}

直接查阅某个环境变量的设定，只要把特定的名字跟在后面即可，像这样：

```bash
$ git config user.name
suchenxiaoyu
```

{% sfb info %}
参考：
[1]. [Git 安装配置](http://www.runoob.com/git/git-install-setup.html)
[2]. [First-Time Git Setup](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup)
{% endsfb %}
