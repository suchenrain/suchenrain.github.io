---
title: 'Git系列—记录变更到版本库中'
categories:
  - git系列
tags:
  - git系列
  - git
license: nd
abbrlink: 20456
date: 2018-05-26 17:54:55
updated: 2018-05-29 21:55:00
---

到了这里相信你的机器上已经有了一个 Git 仓库，并且工作区里也签出了工作副本。通常，当项目达到想要记录的状态时，我们开始对文件进行更改并将这些变更的快照提交到存储库中。

工作目录里的文件无非两种状态：`已追踪`或者`未追踪`。已追踪文件是指那些被纳入了版本控制的文件，在上一次快照中有它们的记录;它们可以是`「未修改」`、`「已修改」`、`「已暂存（staged）」`。简而言之，追踪的文件就是 Git 所知道的文件。

工作目录中除已追踪文件以外的所有其它文件都属于`未追踪`文件，它们既不存在于上次快照的记录中，也没有放入暂存区。 初次克隆某个仓库的时候，工作目录中的所有文件都属于已追踪文件，并处于未修改状态。

编辑过工作区的某些文件之后，由于自上次提交后对它们做了修改，Git 将它们标记为`已修改`文件。 我们逐步将这些修改过的文件放入暂存区(add)，然后提交所有暂存了的修改(commit)，如此反复。所以使用 Git 时文件的生命周期大致如下：

<!--more-->

![git文件状态变化周期](https://suchenrain-1255943826.file.myqcloud.com/Post/lifecycle.png 'git文件状态变化周期')

## 检查当前文件状态

```bash
$ git status
On branch master
nothing to commit, working tree clean
```

这说明现在的工作目录相当干净。换句话说，所有已跟踪文件在上次提交后都未被更改过。 此外，上面的信息还表明，当前目录下没有出现任何处于未跟踪状态的新文件，否则 Git 会在这里列出来。 最后，该命令还显示了当前所在分支，并告诉你这个分支同远程服务器上对应的分支没有偏离。

新建一个文件。 如果之前并不存在这个文件，使用 git status 命令，你将看到一个新的未跟踪文件：

```bash
$ echo 'i hate u' > test.md
$ git status
On branch master
Untracked files:
  (use "git add <file>..." to include in what will be committed)

        test.md

nothing added to commit but untracked files present (use "git add" to track)
```

Git 不会自动将新的文件纳入跟踪范围，除非你明明白白地告诉它“我需要跟踪该文件”， 这样的处理让你不必担心将生成的二进制文件或其它不想被跟踪的文件包含进来。

## 跟踪新文件

通过使用命令 git add 开始跟踪一个文件。

```bash
$ git add test.md
```

此时再运行 git status 命令，会看到 README 文件已被跟踪，并处于暂存状态：

```bash
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        new file:   test.md
```

只要在 Changes to be committed 这行下面的，就说明是已暂存状态。git add 命令使用文件或目录的路径作为参数；如果参数是目录的路径，该命令将递归地跟踪该目录下的所有文件。

## 暂存已修改文件

修改一个已被跟踪的文件 readme.md, 然后运行 git status 命令:

```bash
$ echo 'add a line' > readme.md
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        new file:   test.md

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   readme.md
```

文件 readme.md 出现在 Changes not staged for commit 这行下面，说明已追踪文件的内容发生了变化，但还没有放到暂存区。 要暂存这次更新，需要运行 git add 命令。 这是个多功能命令：可以用它开始跟踪新文件，或者把已追踪的文件放到暂存区，还能用于合并时把有冲突的文件标记为已解决状态等。 将这个命令理解为“添加内容到下一次提交中”而不是“将一个文件添加到项目中”要更加合适。

```bash
$ git add readme.md
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   readme.md
        new file:   test.md
```

现在更改后的 readme.md 也已经暂存了。不过在提交记录之前，我们再次对 readme.md 进行修改并查看状态：

```bash
$ echo 'add another line' >> readme.md
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   readme.md
        new file:   test.md

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   readme.md
```

见鬼了？ 你会发现 readme.md 文件同时出现在暂存区和非暂存区。 这怎么可能呢？ 好吧，`实际上 Git 只不过暂存了你运行 git add 命令时的版本`， 如果你现在提交，readme.md 的版本是你最后一次运行 git add 命令时的那个版本，而不是你运行 git commit 时，在工作目录中的当前版本。 所以，运行了 git add 之后又作了修订的文件，需要重新运行 git add 把最新版本重新暂存起来。

## 状态简览

git status 命令的输出十分详细，同时也有些啰嗦。 通过 git status -s 命令或 git status --short 命令，输出将更加简洁：

```bash
$ git status -s
M  License.txt
A  lib/file3.zc
 M readme.md
MM test.md
?? lib/file4.zc
```

新添加的未跟踪文件前面有 ?? 标记，新添加到暂存区中的文件前面有 A 标记，修改过的文件前面有 M 标记。 你可能注意到了 M 有两个可以出现的位置，出现在右边的 M 表示该文件被修改了但是还没放入暂存区，出现在靠左边的 M 表示该文件被修改了并放入了暂存区。 例如，上面的状态报告显示：在工作区新添加了 lib/file4.zc 文件且未追踪， lib/file3.zc 为工作区新添加文件并且放入了暂存区。readme.md 文件在工作区被修改了但是还没有将修改后的文件放入暂存区,License.txt 文件被修改了并将修改后的文件放入了暂存区。 而 test.md 在工作区被修改并提交到暂存区后又在工作区中被修改了，所以在暂存区和工作区都有该文件被修改了的记录。

{% hint warning%}
**如何理解上述标记？**

可以用如下表格描述上面的输出，比如 readme.md，它在工作区被修改了，但暂存区无变化，说明文件在工作区被修改但未放入暂存区。再比如 lib/file4.zc，它在工作区和暂存区均未知状态，说明是工作区新的未追踪文件。
{% endhint %}

| 暂存区状态 | 工作区状态 | 文件         |
| ---------- | ---------- | ------------ |
| M          |            | License.txt  |
| A          |            | lib/file3.zc |
| M          | readme.md  |
| M          | M          | test.md      |
| ?          | ?          | lib/file4.zc |

## 忽略特定文件

一般我们总会有些文件不需要纳入 Git 的管理，也不希望它们总出现在未追踪文件列表。 它们通常都是些自动生成的文件，比如日志文件，或者编译过程中创建的临时文件等。 在这种情况下，我们可以创建一个名为 .gitignore 的文件，列出要忽略的文件规则。 来看一个实际的例子：

```bash
$ cat .gitignore
*.[oa]
*~
```

第一行告诉 Git 忽略所有以 .o 或 .a 结尾的文件。一般这类对象文件和存档文件都是编译过程中出现的。 第二行告诉 Git 忽略所有以波浪符（~）结尾的文件，许多文本编辑软件（比如 Emacs）都用这样的文件名保存副本。 此外，你可能还需要忽略 log，tmp 或者 pid 目录，以及自动生成的文档等等。 要养成一开始就设置好 .gitignore 文件的习惯，以免将来误提交这类无用的文件。

文件 .gitignore 的格式规范如下：

* 所有空行或者以 ＃ 开头的行都会被 Git 忽略。

* 可以使用标准的 glob 模式匹配。

* 匹配模式可以以（/）开头防止递归。

* 匹配模式可以以（/）结尾指定目录。

* 要忽略指定模式以外的文件或目录，可以在模式前加上惊叹号（!）取反。

所谓的 glob 模式是指 shell 所使用的简化了的正则表达式。 星号（_）匹配零个或多个任意字符；[abc] 匹配任何一个列在方括号中的字符（这个例子要么匹配一个 a，要么匹配一个 b，要么匹配一个 c）；问号（?）只匹配一个任意字符；如果在方括号中使用短划线分隔两个字符，表示所有在这两个字符范围内的都可以匹配（比如 [0-9] 表示匹配所有 0 到 9 的数字）。 使用两个星号（_) 表示匹配任意中间目录，比如`a/**/z` 可以匹配 a/z, a/b/z 或 `a/b/c/z`等。

我们再看一个 .gitignore 文件的例子：

```bash
# 不要追蹤檔名為 .a 結尾的檔案
*.a

# 但是要追蹤 lib.a，即使上面已指定忽略所有的 .a 檔案
!lib.a

# 只忽略根目錄下的 TODO 檔案，不包含子目錄下的 TODO
/TODO

# 忽略 build/ 目錄下所有檔案
build/

# 忽略 doc/notes.txt，但不包含 doc/server/arch.txt
doc/*.txt

# 忽略所有在 doc/ 目錄底下的 .pdf 檔案
doc/**/*.pdf
```

可以看出规范的应用顺序为从上到下，所以在制定.gitignore 文件时，`尽量把粗粒度规则写在上面，细粒度的放在下面`。

{% hint info%}
**Tip**

如果你的项目管理想要有個好开头，GitHub 在 https://github.com/github/gitignore 中针对几十种项目和程序语言维护了一个很完整、好用的 .gitignore 范例文件列表。

{% endhint%}

{% sfb info %}
参考：
[1]. [Git Basics - Recording Changes to the Repository](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository)
{% endsfb %}
