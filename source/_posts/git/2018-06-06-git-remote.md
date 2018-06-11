---
title: Git系列-远程仓库
categories:
  - git系列
  - git remote
tags:
  - git remote
  - 远程仓库
abbrlink: 38902
license: nd
date: 2018-06-06 17:20:49
---

相信到了这里，你已经可以建立自己的 git 仓库并进行基本的版本管理了。然而这仅限于你自己的机器，这是远远不够的。还记得建立 git 仓库的时候我们介绍了`git clone`从别处拷贝仓库，这里的`别处`就是我们要介绍的`远程仓库`。所谓的远程仓库是指托管在因特网或其他网络中的项目的版本库，你可以有好几个远程仓库，通常有些仓库对你只读，有些则可以读写。 与他人协作涉及管理远程仓库以及根据需要推送或拉取数据。 管理远程仓库包括了解如何添加远程仓库、移除无效的远程仓库、管理不同的远程分支并定义它们是否被跟踪等等。

## 查看已经配置的远程仓库

如果想查看当前已经配置的远程仓库服务器，可以运行 `git remote` 命令。 它会列出指定的每一个远程服务器的简写。 如果是克隆的仓库，那么至少应该能看到 `origin` - 这是 Git 给你克隆的仓库服务器的默认名字：

```bash
$ pwd
/c/Hexo/gitpost/project
$ git remote
```

上述是新建的仓库，所以还没有配置远程仓库地址。

## 添加远程仓库

运行 `git remote add <shortname> <url>` 添加一个新的远程 Git 仓库，同时指定一个你可以轻松引用的简写：

```bash
$ git remote add gitdemo https://github.com/suchenrain/gitpost.git

$ git remote
gitdemo

$ git remote -v
gitdemo https://github.com/suchenrain/gitpost.git (fetch)
gitdemo https://github.com/suchenrain/gitpost.git (push)
```
