---
title: Git系列—撤销操作
categories:
  - git系列
tags:
  - git
  - git系列
  - 撤销
license: nd
abbrlink: 12438
date: 2018-06-05 14:52:39
updated: 2018-06-05 14:52:46
---

在任何一个阶段，都有可能想要撤消某些操作。方法的选择取决你的情况：是否已提交。如果是，你又想如何修复。

## 未提交

### 重置工作区

日常开发中，你可能会遇到工作区的文件搞的一团乱麻，这时你会想回到之前的状态：编辑前的干净状态，上次暂存的状态，上次储藏队列的状态。

#### 干净状态

所谓的干净状态即最近一次提交时的状态。本质上是将版本库中版本恢复到`工作区`和`暂存区`中。即`重置`。

<!--more-->

```bash
# 重置暂存区，与上一次commit保持一致
$ git reset
$ git reset HEAD

# 重置当前分支HEAD指针为指定commit，并重置暂存区，工作区不变
$ git reset [commit]

# 重置暂存区与工作区，与上一次commit保持一致
$ git reset --hard
$ git reset --hard HEAD

# 重置当前分支HEAD指针为指定commit，并重置暂存区与工作区
$ git reset --hard [commit]

# 重置当前HEAD为指定commit，但保持暂存区和工作区不变
$ git reset --keep [commit]
```

{% hint info%}
`fatal: Cannot do hard reset with paths.`
如果只是重置暂存区，reset 可以使用 paths。而有`--hard`时不能使用。
{% endhint %}

如果你只是想恢复`部分特定文件`，那么：

```bash
# 重置暂存区和工作区的单个指定文件，与上一次commit保持一致
$ git checkout head test.md
# 约等同于
$ git reset test.md # 注意此处 额外重置了HEAD指针
$ git checkout test.md

# 重置暂存区与工作区的lib文件夹下内容，与上一次commit保持一致
$ git checkout head lib

# 重置暂存区与工作区，与上一次commit保持一致
$ git checkout head . # 等同于reset --hard

# 恢复某个commit的指定paths到暂存区和工作区(不会更新HEAD)
$ git checkout [commit] [paths]
```

#### 上次暂存状态

某种情况下，你先将一部分修改进行了暂存，而在后来你想将工作区回退至暂存的状态。即将暂存区中的版本恢复至工作区。

```bash
# 恢复暂存区的指定文件到工作区
$ git checkout [file]

# 恢复暂存区的指定paths到工作区
$ git checkout [paths]
```

#### 储藏队列

除了工作区，暂存区和版本库，还有一个特殊的`储存队列`。

当你正在做一项复杂的工作时, 发现了一个和当前工作不相关但是又很讨厌的 bug. 你这时想先修复 bug 再做手头的工作, 那么就可以用 git stash 来保存当前的工作状态, 等你修复完 bug 后,执行'反储藏'(unstash)操作就可以回到之前的工作里。

```bash
$ git stash <message>
```

这条命令将目前工作区的修改保存到 stash 中，这会将工作区和暂存区重置回当前分支上次提交时的状态。当你修复完 bug 后, 你可以用`git stash apply`来回复到以前的工作状态。

```bash
# 使用顶部的stash
$ git stash apply

# 使用特定stash
$ git stash apply stash@{1}

# 查看stashes
$ git stash list
```

## 已提交

如果你已经做了一个提交(commit),但是你马上后悔了。这里有两种截然不同的方法去处理这个问题:

* 新建提交去修正错误的提交（适合代码已发布）
* 修改旧提交

### 新建提交

创建一个新的，撤消(revert)了前期修改的提交(commit)是很容易的; 只要把出错的提交(commit)的名字(reference)做为参数传给命令: `git revert`就可以了; 下面这条命令就演示了如何撤消最近的一个提交:

```bash
$ git revert HEAD
```

这样就创建了一个撤消了上次提交(HEAD)的新提交, 你就有机会来修改新提交(new commit)里的提交注释信息.

你也可撤消更早期的修改, 下面这条命令就是撤消“上上次”(next-to-last)的提交:

```bash
$ git revert HEAD^
```

在这种情况下,git 尝试去撤消老的提交,然后留下完整的老提交前的版本.　如果你最近的修改和要撤消的修改有重叠(overlap),那么就会被要求手工解决冲突(conflicts),　就像解决合并(merge)时出现的冲突一样。

### 修改旧提交

如果你刚刚做了某个提交(commit), 但是你又想马上修改这个提交; `git commit --amend`能让你修改刚才的这个提交(HEAD commit). 这个命令会默认使用刚才的提交信息将暂存区中的文件进行提交并覆盖刚才的那个旧提交。
