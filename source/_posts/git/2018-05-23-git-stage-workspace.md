---
title: 'Git系列—理解Git的工作区、暂存区和版本库'
categories:
  - git系列
tags:
  - git系列
  - git目录
abbrlink: 55466
date: 2018-05-24 00:00:00
license: nd
---

## Git 目录

创建了版本库后。首先，让我们来看一看 Git 仓库的目录结构。作为演示，我们初始化了一个叫做 `project` 的 Git 仓库。使用`tree`查看项目结构如下：

```bash
$ cd C:/Hexo/gitpost/project
$ tree  -C -F -a -L 2
.
|-- .git/                   # 隐藏文件夹（**git版本库**）
|   |-- COMMIT_EDITMSG      #
|   |-- HEAD                # 这个git项目当前处在哪个分支里
|   |-- config              # 项目的配置信息，git config命令会改动它（仓库级别）
|   |-- description         # 项目的描述信息
|   |-- hooks/              # 系统默认钩子脚本目录
|   |-- index               # 索引文件（**暂存区**）
|   |-- info/               #
|   |-- logs/               # 各个refs的历史信息
|   |-- objects/            # Git本地仓库的所有对象 (commits, trees, blobs, tags)
|   `-- refs/               # 标识项目里的每个分支指向了哪个提交(commit)
`-- readme.md               # 项目文件（**工作区**）
```

<!--more-->

{% hint warning %}
以上使用 git version 2.15.0.windows.1 其他版本或略有差异。
{% endhint %}

接下来我们就可以来介绍工作区，暂存区和版本库的概念了。

## Git 工作区、暂存区和版本库

* `工作区`：(**Working Directory**)就是你在电脑里能看到的目录。存储着你现在签出(checkout)来用来编辑的文件. 当你在项目的不同分支间切换时, 工作目录里的文件经常会被替换和删除. 所有历史信息都保存在 '.git 目录'中 ;　工作目录只用来临时保存签出(checkout) 文件的地方, 你可以编辑工作目录的文件直到下次提交(commit)为止.
* `暂存区`：英文叫 **stage**, 或 **index**。一般存放在 ".git 目录下" 下的 index 文件（.git/index）中，所以我们把暂存区有时也叫作索引（index）。
* `版本库`：(**Repository**)工作区有一个隐藏目录.git，这个不算工作区，而是 Git 的版本库。

![工作区/暂存区/版本库关系](https://suchenrain-1255943826.file.myqcloud.com/Post/git-stage-workspace.jpg '工作区/暂存区/版本库关系')

图中左侧为工作区，右侧为版本库。在版本库中标记为 `index` 的区域是暂存区（stage, index），标记为 `master` 的是 master 分支所代表的目录树。

图中我们可以看出此时 `HEAD` 实际是指向 master 分支的一个`游标`。所以图示的命令中出现 HEAD 的地方可以用 master 来替换。

图中的 objects 标识的区域为 Git 的对象库，实际位于 `.git/objects` 目录下，里面包含了创建的各种对象及内容。

* 当对工作区修改（或新增）的文件执行 `git add` 命令时，暂存区的目录树被更新，同时工作区修改（或新增）的文件内容被写入到对象库中的一个新的对象中，而该对象的 ID 被记录在暂存区的文件索引中。

* 当执行提交操作（`git commit`）时，暂存区的目录树写到版本库（对象库）中，master 分支会做相应的更新。即 master 指向的目录树就是提交时暂存区的目录树。

* 当执行 `git reset HEAD` 命令时，暂存区的目录树会被重写，被 master 分支指向的目录树所替换，但是工作区不受影响。

* 当执行 `git rm --cached <file>` 命令时，会直接从暂存区删除文件，工作区则不做出改变。

* 当执行 `git checkout .` 或者 `git checkout -- <file>` 命令时，会用暂存区全部或指定的文件替换工作区的文件。这个操作很危险，会清除工作区中未添加到暂存区的改动。

* 当执行 `git checkout HEAD .` 或者 `git checkout HEAD <file>` 命令时，会用 HEAD 指向的 master 分支中的全部或者部分文件替换暂存区和以及工作区中的文件。这个命令也是极具危险性的，因为不但会清除工作区中未提交的改动，也会清除暂存区中未提交的改动。

{% hint success%}

##### 小结

暂存区是 Git 非常重要的概念，弄明白了暂存区，就弄明白了 Git 的很多操作到底干了什么。
{% endhint %}
