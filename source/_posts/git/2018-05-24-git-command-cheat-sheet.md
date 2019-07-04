---
file: 2018-05-15-git-command-summary
title: git command cheat sheet
date: '2018-05-15 20:12'
categories:
  - git系列
  - git命令
tags:
  - git命令
  - git系列
  - git
license: nd
abbrlink: 40446
updated: 2019-07-04 23:16:08
---

## 更新日志

- 2018-06-04&nbsp;&nbsp;&nbsp;&nbsp;git log
- 2018-06-03&nbsp;&nbsp;&nbsp;&nbsp;git add + git commit
- 2018-05-31&nbsp;&nbsp;&nbsp;&nbsp;git status
- 2018-05-24&nbsp;&nbsp;&nbsp;&nbsp;git init
- 2018-05-23&nbsp;&nbsp;&nbsp;&nbsp;git config
- 2018-05-15&nbsp;&nbsp;&nbsp;&nbsp;初稿

---

## 关于

实话说 git 是笔者用过的并觉得最好的版本控制系统，相较于 Microsoft 的 TFS 以及 SVN，git 都要优雅许多。然而接触它这么久，还是不敢说已经完全掌握并理解它，但这并不妨碍我对它的热爱。以前也记录过使用的一些总结，后来由于某种原因丢失了，所以想温故而知新。

{% hint warning%}
**注意**：本文的关注点在于如何使用 git 所提供的命令上，诸如环境安装，配置此类问题均不在范畴。
{% endhint %}

<!--more-->

---

## git init

git-init - 用于创建空的 Git 仓库或者重新初始化一个已存在的 Git 仓库。

以下均假设未设置 Git 相关参数环境变量，如`GIT_DIR`，`GIT_TEMPLATE_DIR` etc.

```bash 以下在git version 2.13.0.windows.1运行测试通过
# 新建git仓库
$ git init  # 将当前目录初始化为Git仓库
$ git init [directory]  # 在当前路径新建`directory`目录并初始化为Git仓库
$ pwd
/c/WorkBench/suchenrain/temptest
$ git init test1
Initialized empty Git repository in C:/WorkBench/suchenrain/temptest/test1/.git/

$ git init [path] # 在指定的路径`path`下初始化Git仓库
$ git init to/test  # 相对路径即 ./to/test
Initialized empty Git repository in C:/WorkBench/suchenrain/temptest/to/test/.git/

$ git init /to/test # 根路径（Git安装路径）
Initialized empty Git repository in C:/WorkSpace/Develop/Git/to/test/.git/

-------------------------------------------------------------------------------------
# 裸仓库
$ git init --bare # 只生成Git版本库，没有工作区(适用于git服务器)
$ git init --bare bare
Initialized empty Git repository in C:/WorkBench/suchenrain/temptest/bare/

$ cd bare
$ tree -F -L 1
.
|-- HEAD
|-- config
|-- description
|-- hooks/
|-- info/
|-- objects/
`-- refs/

-------------------------------------------------------------------------------------
# 分离版本库（指定git版本库的路径，而不是默认的./.git。常用于移动已有仓库的版本库）
$ git init --separate-git-dir fake src
Initialized empty Git repository in C:/WorkBench/suchenrain/temptest/fake/
$ tree -F -a -L 2
.
|-- fake/               # git版本库
|   |-- HEAD
|   |-- config
|   |-- description
|   |-- hooks/
|   |-- info/
|   |-- objects/
|   `-- refs/
`-- src/                # 工作区
    `-- .git            # 版本库路径信息文件

$ vi src/.git
gitdir: C:/WorkBench/suchenrain/temptest/fake       # 版本库路径为fake
~
~
~

-------------------------------------------------------------------------------------
# 仓库访问权限
$ git init --shared[=(false|true|umask|group|all|world|everybody|0xxx)]

# false等价于umask 这是默认设置，表示使用系统默认的文件权限

# group (or true) 仓库组可写。Note that the umask still applies to the other permission bits
(e.g. if umask is 0022, using group will not remove read privileges from other (non-group) users)

# all (or world or everybody)
Same as group, but make the repository readable by all users.

# 0xxx
# u-user g-group o-others
# rwx
# 4 stands for "read",
# 2 stands for "write",
# 1 stands for "execute", and
# 0 stands for "no permission."
$ git init --shared=0660 testShared
```

---

## git clone

```sh
# 克隆仓库到当前目录下
$ git clone <repo>

# 克隆仓库到指定目录
$ git clone <repo> <directory>

# 克隆仓库并签出指定分支（默认为master分支）
$ git clone -b <branch> <repo>

# 克隆带有子模块的仓库，正常命令只会包含子模块的空目录
# 自动初始化并更新仓库中的每一个子模块
$ git clone --recursive <repo>

# 或者
$ git submodule init
$ git submodule update
```

---

## git config

```bash 以下在git version 2.15.0.windows.1 运行测试通过
# 查看所有配置
$ git config -l, --list
# 查看配置并显示配置来源
$ git config --show-origin -l

-------------------------------------------------------------------------------------
# 设置配置
$ git config --system user.name "John Doe" # 设置system级别用户名
$ git config --global user.name "suchenxiaoyu" # 设置global级别用户名

-------------------------------------------------------------------------------------
# 读取配置
$ git config user.name # 读取最终生效的配置
$ git config --get user.name # 读取最终生效的配置
suchenxiaoyu
$ git config --get-all user.name # 读取所有配置
John Doe
suchenxiaoyu

-------------------------------------------------------------------------------------
# 添加配置
$ git config --add user.name test # 添加repository级别配置
$ git config --global --add user.name test # 添加global级别配置(增加一条配置不管存在与否)
$ git config --show-origin --get-all user.name # 读取user.name的所有配置值并显示来源
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    John Doe
file:C:/Users/Administrator/.gitconfig                  suchenxiaoyu
file:C:/Users/Administrator/.gitconfig                  test
file:.git/config                                        test

-------------------------------------------------------------------------------------
# 移除配置
$ git config --global --unset user.name # 移除global级别用户名（适合只有一条记录的配置）
warning: user.name has multiple values
$ git config --global --unset-all user.name # 移除global级别用户名的所有配置
$ git config --show-origin --get-all user.name
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    John Doe
file:.git/config        test

-------------------------------------------------------------------------------------
$ git config --unset user.name #移除repository级别user.name
$ git config --show-origin --get-all user.name
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    John Doe #user.name只剩system级别配置

-------------------------------------------------------------------------------------
$ git config --show-origin --get-regexp user  # 根据正则获取配置信息，如 获取所有级别包含user的配置
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    user.name John Doe
file:C:/Users/Administrator/.gitconfig                  user.email suchenxiaoyu@gmail.com
file:C:/Users/Administrator/.gitconfig                  xuser.name haha
file:.git/config                                        user.name te
file:.git/config                                        user.hello te
file:.git/config                                        xuser.name haha

-------------------------------------------------------------------------------------
$ git config --remove-section  user    # remove a section: name
# (移除repository级别的用户节点 user.name,user.email,etc.)
$ git config --show-origin --get-regexp user
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    user.name John Doe
file:C:/Users/Administrator/.gitconfig                  user.email suchenxiaoyu@gmail.com
file:C:/Users/Administrator/.gitconfig                  xuser.name haha
file:.git/config                                        xuser.name haha
```

---

## git status

`git status` 用于查看当前工作区文件状态。

```bash 以下在git version 2.17.1.windows.2运行测试通过
# 查看工作区当前状态
$ git status

# 短格式-输出两位字母状态码
$ git status -s, --short

-------------------------------------------------------------------------------------
# 附加输出已暂存的具体变化，一个-v相当于 diff --cached
# 两个-v 相当于再附加上未暂存的具体变化
$ git status -v -v
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   test.md

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   readme.md

Changes to be committed:
diff --git c/test.md i/test.md
index e77b92e..23ff8f0 100644
--- c/test.md
+++ i/test.md
@@ -2,3 +2,4 @@ i hate u
 i like u
 i love u
 i hate you
+i like you
--------------------------------------------------
Changes not staged for commit:
diff --git i/readme.md w/readme.md
index d8ac117..4094f29 100644
--- i/readme.md
+++ w/readme.md
@@ -3,3 +3,4 @@ add another line
 test1
 test2
 test3
+test4

-------------------------------------------------------------------------------------
# 简洁状态下也显示分支信息（搭配 -s）
$ git status -s -b
## master
 M readme.md
M  test.md

-------------------------------------------------------------------------------------
# 显示已经隐藏起来的条目数量
$ git stash   # 隐藏当前工作目录的变化
Saved working directory and index state WIP on master: be44449 skip staged step
$ git status --show-stash
On branch master
nothing to commit, working tree clean
Your stash currently has 1 entry
```

---

## git add

add 命令用于将工作区变化放入暂存区。

```bash 以下在git version 2.17.1.windows.2运行测试通过
# 特定文件
$ git add readme.md

# 指定目录下(包括子目录)的所有变化
$ git add lib = git add lib/
# 当前目录下所有变化
$ git add .

# 暂存已忽略的文件
$ git add -f temp.dll

# 进入交互模式
$ git add -i [path]

           staged     unstaged path
  1:    unchanged        +1/-0 lib/file4.zc
  2:    unchanged        +1/-0 readme.md
  3:        +2/-0        +1/-0 test.md

*** Commands ***
  1: status       2: update       3: revert       4: add untracked
  5: patch        6: diff         7: quit         8: help
What now>

# 交互式地选择补丁(等同于交互模式下选择patch子命令)
$ git add -p, -patch
```

---

**`交互模式`**

进入交互模式后默认输出 status 子命令的结果，并且处于交互命令循环中。此时光标以一个`>`结尾，可以通过键入选项数字或者类似`s`,`sta`等使选择唯一的字母。

主命令循环有 6 个子命令：

### status

用于显示暂存区和版本库及工作区的变化

- staged - 显示暂存区版本库当前版本的变化，即将会提交的变化。
- unstaged - 显示工作区与暂存区的变化，即可以暂存的变化。

```bash
           staged     unstaged path
  1:    unchanged        +1/-0 lib/file4.zc
  2:    unchanged        +1/-0 readme.md
  3:        +2/-0        +1/-0 test.md # 已暂存的变化（新增2行内容），未暂存的变化（新增一行内容）
```

### update

用于暂存选择的变化。

```bash
*** Commands ***
  1: status       2: update       3: revert       4: add untracked
  5: patch        6: diff         7: quit         8: help
What now> 2
           staged     unstaged path
  1:    unchanged        +1/-0 lib/file4.zc
  2:    unchanged        +1/-0 readme.md
  3:        +2/-0        +1/-0 test.md
Update>>
```

注意此时已经在 update 子命令下`>>`，你可以通过如下方式选择你需要暂存的变化：

- `1,2` 以`,`分隔多个选择
- `1-3`或 `1-`进行范围选择
- `-2`取消选中

选择完之后，已选中的变化会以`*`高亮显示。`空行回车`即可暂存所选中的变化。

```bash 以下在git version 2.17.1.windows.2运行测试通过
Update>> 3
           staged     unstaged path
  1:    unchanged        +1/-0 lib/file4.zc
  2:    unchanged        +1/-0 readme.md
* 3:        +2/-0        +1/-0 test.md
Update>>
updated 1 path

*** Commands ***
  1: status       2: update       3: revert       4: add untracked
  5: patch        6: diff         7: quit         8: help
What now> 1
           staged     unstaged path
  1:    unchanged        +1/-0 lib/file4.zc
  2:    unchanged        +1/-0 readme.md
  3:        +3/-0      nothing test.md  # 工作区变化已经全部暂存
```

### revert

类似 update 命令，用于将选中的已暂存变化回退至版本库中的当前版本。如果是新路径，即将新追踪的文件回退至未追踪状态。

### add untracked

类似 update 和 revert，用于追踪新文件。

### patch

类似 update 但是更细致化，当你选择需要暂存的变化后，会将暂存区与工作区的差异（即将要放入暂存区的变化）依次显示并询问你的动作。这实际上相当于更加`细粒度的暂存`你选择的那些变化。

可用的动作：

- y - stage this hunk(暂存当前变化块)
- n - do not stage this hunk(不暂存)
- q - quit; do not stage this hunk or any of the remaining ones(退出 patch)
- a - stage this hunk and all later hunks in the file(暂存所有)
- d - do not stage this hunk or any of the later hunks in the file(不暂存当前文件的此处及之后的变化块)
- g - select a hunk to go to(跳转至其它变化块)
- / - search for a hunk matching the given regex(搜索指定的变化块)
- j - leave this hunk undecided, see next undecided hunk(跳过当前变化块，跳至`下一个未决定`的变化块)
- J - leave this hunk undecided, see next hunk(跳过当前变化块，跳至`下一个`变化块)
- k - leave this hunk undecided, see previous undecided hunk(跳过当前变化块，跳至`前一个未决定`的变化块)
- K - leave this hunk undecided, see previous hunk(跳过当前变化块，跳至`前一个`的变化块)
- s - split the current hunk into smaller hunks(将当前变化块分割成更小的变化块,`细粒度`)
- e - manually edit the current hunk(手动编辑当前变化块+ -操作)
- ? - print h

### diff

用于查看将要提交的内容（暂存区与版本库当前版本）。

---

## git commit

用于将暂存区的变化更新到版本库中，在新的提交中储存暂存区的当前内容，以及来自用户描述更改的日志消息。

```bash 以下在git version 2.17.1.windows.2运行测试通过
# 自动暂存所有被修改或删除的已追踪文件并提交
# (未追踪文件不受影响)
# 用于跳过手动stage
$ git commit -a, --all

# 交互式地选择补丁提交
$ git commit -p, --patch

# 交互式模式
$ git commit --interactive

# 复用指定的提交信息
$ git commit -C <commit>, --reuse-message=<commit>
$ git commit -c <commit>, --reedit-message=<commit> # 可以另外再编辑

# 指定作者信息(override)
$ git commit --author=author@example.com

# 指定提交信息 (-m 与 -c,-C及-F互斥)
$ git commit -m 'commit message'
$ git commit -m 'first message' -m 'second message' # 最终以段落形式串联
$ git log -1
commit fe9e1ce441873311a532239a3cca709acbd2d59f (HEAD -> master)
Author: suchenxiaoyu <suchenxiaoyu@gmail.com>
Date:   Mon Jun 4 18:20:11 2018 +0800

    first

    second

# 替换/修正上一次提交
$ git commit --amend  # 默认使用上一次提交的所有信息
$ git commit --amend -m 'replace message'

# 预提交(模拟提交)
$ git commit --dry-run
```

---

## git log

用于查看历史提交日志。

```bash
# 查看最近2次提交并显示内容差异
$ git log -p -2

# 提交的简略统计信息
$ git log --stat
commit 817c17b5d37a6f1f44b0d5a87466895a2b327cfa (HEAD -> master)
Author: suchenxiaoyu <suchenxiaoyu@gmail.com>
Date:   Mon Jun 4 18:20:11 2018 +0800

    test

 readme.md | 1 +
 1 file changed, 1 insertion(+)

# 只显示 --stat 中最后的行数修改添加移除统计
$ git log --shortstat

---------------------------------------------------------------
# 仅在提交信息后显示已修改的文件清单
$ git log --name-only
# 显示新增、修改、删除的文件清单(状态码)
$ git log --name-status

# 仅显示 SHA-1 的前几个字符
$ git log --abbrev-commit

# 使用较短的相对时间显示（比如，“2 weeks ago”）
$ git log --relative-date

# ASCII图形(显示分支与合并)
$ git log --graph

---------------------------------------------------------------
# 仅显示最近的n条提交
$ git log -n

# 仅显示指定时间之前/后的提交
$ git log --since,--after=<time format>
$ git log --until,--before=<time format>

$ git log --since=2.days  # 两天前开始的提交
$ git log --since="2018-06-02"
$ git log --since="3 days 5 minutes ago" # 距现在3天零5分钟内的提交

# 指定作者的提交
$ git log --author=gitster
# 指定提交者的提交
$ git log --committer=commiter

# 提交说明中包含指定关键字的提交（多个关键字时需要使用--all-match,否则是或关系）
$ git log --grep=<text>
$ git log --grep=skip --grep=staged --all-match # 同时包含'skip'和'staged'

# 显示添加或移除了某些字符串的提交
$ git log -Slove # 显示新加或者删除'love'改动的提交

# 只关心特定文件或目录的历史提交
$ git log -- lib/file1.zc # 特定文件
$ git log -- lib # 特定目录

---------------------------------------------------------------
# 指定日志展示的格式（oneline | short | full |fuller）
$ git log --pretty=oneline
817c17b5d37a6f1f44b0d5a87466895a2b327cfa (HEAD -> master) test
be444493d956aee03d387276a883358ebe77410e skip staged step
05cb82feb2f77d9d83642b61c14835c35b138258 skip stage step
643c8668bf7857ce49ebf7a4d778a3c69623881e first commit
0f6c323da12fd853d640146f12dd70b8d6d516d2 demo 1
82af2fec9c052826abbb642b26948d0ff932dd93 test
84b6ea98f62b7d06b98b4a94c515ae6a548376f2 initial project version

---------------------------------------------------------------
# 自定义日志格式
$ git log --pretty=format:"%h - %an, %ar : %s"
$ git log --pretty="%h , %s" # 简写形式
817c17b - suchenxiaoyu, 38 minutes ago : test
be44449 - suchenxiaoyu, 4 days ago : skip staged step
643c866 - suchenxiaoyu, 4 days ago : first commit
0f6c323 - John Doe, 4 days ago : demo 1
82af2fe - John Doe, 5 days ago : test
84b6ea9 - suchenxiaoyu, 11 days ago : initial project version

---------------------------------------------------------------
```

`git log --pretty=format` 常用的选项:

```bash
%H    提交对象（commit）的完整哈希字串
%h    提交对象的简短哈希字串
%T    树对象（tree）的完整哈希字串
%t    树对象的简短哈希字串
%P    父对象（parent）的完整哈希字串
%p    父对象的简短哈希字串
%an   作者（author）的名字
%ae   作者的电子邮件地址
%ad   作者修订日期（可以用 --date= 选项定制格式）
%ar   作者修订日期，按多久以前的方式显示
%cn   提交者（committer）的名字
%ce   提交者的电子邮件地址
%cd   提交日期
%cr   提交日期，按多久以前的方式显示
%s    提交说明
```

{% hint info %}
**作者**指的是实际作出修改的人，**提交者**指的是最后将此工作成果提交到仓库的人。(分布式 Git)
{% endhint %}

```bash
# 显示从2018/6/1开始到1分钟之前这段时间内由'suchenxiaoyu'对文件'readme.md'的非合并提交
$ git log --pretty="%h - %s" --author=suchenxiaoyu --since="2018-06-01" \
> --before="a minute ago" --no-merges -- readme.md
817c17b - test
```

---

## References

- [Git Reference][0]
- [Pro Git][1]
- [Git Community Book][2]

[0]: https://git-scm.com/docs 'Git Reference'
[1]: https://git-scm.com/book/en/v2 'Pro Git'
[2]: http://gitbook.liuhui998.com/index.html 'Git Community Book 中文版'
