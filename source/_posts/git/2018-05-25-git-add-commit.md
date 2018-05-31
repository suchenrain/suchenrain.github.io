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
updated: 2018-05-31 12:55:00
---

到了这里相信你的机器上已经有了一个 Git 仓库，并且工作区里也签出了工作副本。通常，当项目达到想要记录的状态时，我们开始对文件进行更改并将这些变更的快照提交到存储库中。

工作目录里的文件无非两种状态：`已追踪`或者`未追踪`。已追踪文件是指那些被纳入了版本控制的文件，在上一次快照中有它们的记录;它们可以是`「未修改」`、`「已修改」`、`「已暂存（staged）」`。简而言之，追踪的文件就是 Git 所知道的文件。

工作目录中除已追踪文件以外的所有其它文件都属于`未追踪`文件，它们既不存在于上次快照的记录中，也没有放入暂存区。 初次克隆某个仓库的时候，工作目录中的所有文件都属于已追踪文件，并处于未修改状态。

编辑过工作区的某些文件之后，由于自上次提交后对它们做了修改，Git 将它们标记为`已修改`文件。 我们逐步将这些修改过的文件放入暂存区(add)，然后提交所有暂存了的修改(commit)，如此反复。所以使用 Git 时文件的生命周期大致如下：

<!--more-->

![git文件状态变化周期](https://suchenrain-1255943826.file.myqcloud.com/Post/lifecycle.png 'git文件状态变化周期')

---

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

---

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

---

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

---

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

新添加的未跟踪文件前面有 ?? 标记，新添加到暂存区中的文件前面有 A 标记，修改过的文件前面有 M 标记。 你可能注意到了 M 有两个可以出现的位置，出现在右边的 M 表示该文件被修改了但是还没放入暂存区，出现在靠左边的 M 表示该文件被修改了并放入了暂存区。 例如，上面的状态报告显示：

* 在工作区新添加了 lib/file4.zc 文件且未追踪
* lib/file3.zc 为工作区新添加文件并且放入了暂存区。
* readme.md 文件在工作区被修改了但是还没有将修改后的文件放入暂存区
* License.txt 文件被修改了并将修改后的文件放入了暂存区
* test.md 在工作区被修改并提交到暂存区后又在工作区中被修改了，所以在暂存区和工作区都有该文件被修改了的记录。

---

**`如何理解上述短格式？`**

短格式使用两位字母的状态码`XY`。

对于合并冲突的路径，X 和 Y 显示合并的每一边的修改状态。对于那些没有合并冲突的路径，`X 显示了索引(暂存区)的状态`，并且 `Y 显示了工作树(工作目录)的状态`。对于未被追踪的路径，XY 是`??`其他状态码可以解释如下：

* '' = unmodified
* M = modified
* A = added
* D = deleted
* R = renamed
* C = copied
* U = updated but unmerged

```
X          Y     Meaning
-------------------------------------------------
         [AMD]   not updated
M        [ MD]   updated in index
A        [ MD]   added to index
D                deleted from index
R        [ MD]   renamed in index
C        [ MD]   copied in index
[MARC]           index and work tree matches
[ MARC]     M    work tree changed since index
[ MARC]     D    deleted in work tree
[ D]        R    renamed in work tree
[ D]        C    copied in work tree
-------------------------------------------------
D           D    unmerged, both deleted
A           U    unmerged, added by us
U           D    unmerged, deleted by them
U           A    unmerged, added by them
D           U    unmerged, deleted by us
A           A    unmerged, both added
U           U    unmerged, both modified
-------------------------------------------------
?           ?    untracked
!           !    ignored
-------------------------------------------------
```

所以可以用如下表格描述上面的输出，比如 readme.md，它在工作区被修改了，但暂存区无变化，说明文件在工作区被修改但未放入暂存区。再比如 lib/file4.zc，它在工作区和暂存区均未知状态，说明是工作区新的未追踪文件。

| 暂存区状态 | 工作区状态 | 文件         |
| ---------- | ---------- | ------------ |
| M          |            | License.txt  |
| A          |            | lib/file3.zc |
|            | M          | readme.md    |
| M          | M          | test.md      |
| ?          | ?          | lib/file4.zc |

更多请参阅[git status](https://git-scm.com/docs/git-status)

---

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

所谓的 glob 模式是指 shell 所使用的简化了的正则表达式。 星号（）匹配零个或多个任意字符；[abc] 匹配任何一个列在方括号中的字符（这个例子要么匹配一个 a，要么匹配一个 b，要么匹配一个 c）；问号（?）只匹配一个任意字符；如果在方括号中使用短划线分隔两个字符，表示所有在这两个字符范围内的都可以匹配（比如 [0-9] 表示匹配所有 0 到 9 的数字）。 使用两个星号（） 表示匹配任意中间目录，比如`a/**/z` 可以匹配 a/z, a/b/z 或 `a/b/c/z`等。

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

GitHub 在 https://github.com/github/gitignore 中针对几十种项目和程序语言维护了一个很完整、好用的 .gitignore 范例文件列表，你可以试试。

{% endhint%}

一般来说，一个 git 仓库会在根目录有这样一个.gitignore 文件, 它依次作用于整个仓库目录。然而，子目录也可以有自己的.gitignore 文件。这些嵌套的.gitignore 文件中的规则只适用于它们所在目录下的文件。

更多详情可以参见`man gitignore`。

---

## 查看已暂存和未暂存的修改

`git status`告诉你的只是哪些文件发生了什么样的变化，如果你想知道具体的更改，那么你需要使用`git diff`命令。通常它用于回答两个问题：

* 当前做的哪些更改还没有暂存？（`git diff`）
* 有哪些更新已经暂存起来准备好了下次提交？（`git diff --staged`）

假设我们项目当前状态如下：

```bash
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   readme.md

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   test.md
```

要查看尚未暂存的文件更新了哪些部分，不加参数直接输入 git diff：

```bash
$ git diff
diff --git a/test.md b/test.md
index 8e86c6b..e77b92e 100644
--- a/test.md
+++ b/test.md
@@ -1,3 +1,4 @@
 i hate u
 i like u
 i love u
+i hate you
```

此命令比较的是`工作目录中当前文件和暂存区域快照之间的差异`， 也就是修改之后还没有暂存起来的变化内容。

若要查看已暂存的将要添加到下次提交里的内容，可以用 git diff --cached 命令。（Git 1.6.1 及更高版本还允许使用 git diff --staged，效果是相同的，但更好记些。）

```bash
$ git diff --staged
diff --git a/readme.md b/readme.md
index f7ec434..f44d5bd 100644
--- a/readme.md
+++ b/readme.md
@@ -1,2 +1,3 @@
 add a line
 add another line
+test1
```

{% hint success%}
**小结**
`git diff` &nbsp;(查看工作区和暂存区的差异)
`git diff --staged`&nbsp; (查看暂存区和版本库的差异)
{% endhint %}

{% hint info%}
**Git Diff 的插件版本**

git 默认使用 git diff 来分析文件差异。 但是，如果你喜欢通过图形化的方式或其它格式输出方式的话，可以使用 git difftool 命令来用 Araxis ，emerge 或 vimdiff 等软件输出 diff 分析结果。 使用 git difftool --tool-help 命令来看你的系统支持哪些 Git Diff 插件。
{% endhint %}

---

## 提交更新

到此，相信你已经准备好将暂存区的修改提交到版本库了。每次准备提交前，先用 `git status` 看下，是不是都已暂存起来了， 然后再运行提交命令 `git commit`：

```bash
$ git commit

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# On branch master
# Changes to be committed:
#       modified:   readme.md
#       modified:   test.md
#
~
~
```

这会启动文本编辑器以便输入本次提交的说明。 (默认会启用 shell 的环境变量 $EDITOR 所指定的软件，一般都是 vim 或 emacs。输入你的提交信息，保存退出完成提交。

另外，你也可以在 commit 命令后添加 -m 选项，将提交信息与命令放在同一行，如下所示：

```bash
$ git commit -m 'first commit'
[master 643c866] first commit
 2 files changed, 2 insertions(+)
```

---

## 跳过使用暂存区域

尽管使用暂存区域的方式可以精心准备要提交的细节，但有时候这么做略显繁琐。 Git 提供了一个跳过使用暂存区域的方式， 只要在提交的时候，给 git commit 加上 -a 选项，Git 就会自动把所有`已经跟踪过的文件`暂存起来一并提交，从而跳过 git add 步骤：

```bash
$ git status -s
 M readme.md
?? demofile.zc

$ git commit -a -m 'skip staged step'
[master be44449] skip staged step
 1 file changed, 1 insertion(+)

# untracked files remain
$ git status -s
?? demofile.zc
```

{% hint warning%}
只是针对 tracked 的文件，未追踪的文件还是在工作区！
{% endhint %}

---

## 移除文件

假设由于不小心将某文件提交了版本库，那么如何移除呢？

要从 Git 中移除某个文件，就必须要从已跟踪文件清单中移除（确切地说，是从暂存区域移除），然后提交。 可以用 `git rm` 命令完成此项工作，并`连带从工作目录中删除指定的文件`，这样以后就不会出现在未跟踪文件清单中了。

如果只是简单地从工作目录中手工删除文件，运行 `git status` 时就会在 “Changes not staged for commit” 部分（也就是 未暂存清单）看到：

```bash
$ rm test.md
$ git status
On branch master
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        deleted:    test.md

no changes added to commit (use "git add" and/or "git commit -a")
```

然后再运行 `git rm` 记录此次移除文件的操作：

```bash
$ git rm test.md
rm 'test.md'

$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        deleted:    test.md
```

下一次提交时，该文件就不再纳入版本管理了。

如果删除之前修改过并且已经放到暂存区域的话，则必须要用强制删除选项 -f（译注：即 force 的首字母）。 这是一种安全特性，用于防止误删还没有添加到快照的数据，这样的数据不能被 Git 恢复。

另外一种情况是，我们想把文件从 Git 仓库中删除（亦即从暂存区域移除），但仍然希望保留在当前工作目录中。 换句话说，你想让文件保留在磁盘，但是并不想让 Git 继续跟踪。 当你忘记添加 .gitignore 文件，不小心把一个很大的日志文件或一堆 .a 这样的编译生成文件添加到暂存区时，这一做法尤其有用。 为达到这一目的，使用 --cached 选项：

```bash
$ git rm --cached test.md
```

`git rm` 命令后面可以列出文件或者目录的名字，也可以使用 glob 模式。 比方说：

```bash
$ git rm log/\*.log
```

注意到星号 \* 之前的反斜杠 \， 因为 Git 有它自己的文件模式扩展匹配方式，所以我们不用 shell 来帮忙展开。 此命令删除 log/ 目录下扩展名为 .log 的所有文件。 类似的比如：

```bash
$ git rm \*~
```

删除以 ~ 结尾的所有文件。

---

## 移动文件(重命名)

要在 Git 中对文件改名，可以这么做：

`$ git mv file_from file_to` 它会恰如预期般正常工作。 实际上，即便此时查看状态信息，也会明白无误地看到关于重命名操作的说明：

```bash
$ git mv README.md README
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

    renamed:    README.md -> README
```

其实，运行 git mv 就相当于运行了下面三条命令：

```bash
$ mv README.md README
$ git rm README.md
$ git add README
```

如此分开操作，Git 也会意识到这是一次改名，所以不管何种方式结果都一样。 两者唯一的区别是，mv 是一条命令而另一种方式需要三条命令，直接用 git mv 轻便得多。

---

{% sfb info %}
参考：
[1]. [Git Basics - Recording Changes to the Repository](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository)
{% endsfb %}
