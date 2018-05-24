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
---

## 更新日志

* 2018-05-24&nbsp;&nbsp;&nbsp;&nbsp;git init
* 2018-05-23&nbsp;&nbsp;&nbsp;&nbsp;git config
* 2018-05-15&nbsp;&nbsp;&nbsp;&nbsp;初稿

## 关于

实话说 git 是笔者用过的并觉得最好的版本控制系统，相较于 Microsoft 的 TFS 以及 SVN，git 都要优雅许多。然而接触它这么久，还是不敢说已经完全掌握并理解它，但这并不妨碍我对它的热爱。以前也记录过使用的一些总结，后来由于某种原因丢失了，所以想温故而知新。

{% hint warning%}
**注意**：本文的关注点在于如何使用 git 所提供的命令上，诸如环境安装，配置此类问题均不在范畴。
{% endhint %}

<!--more-->

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

## git config

```bash 以下在git version 2.15.0.windows.1 运行测试通过
# 查看所有配置
$ git config -l, --list
# 查看配置并显示配置来源
$ git config --show-origin -l

# 设置配置
$ git config --system user.name "John Doe" # 设置system级别用户名
$ git config --global user.name "suchenxiaoyu" # 设置global级别用户名

# 读取配置
$ git config user.name # 读取最终生效的配置
$ git config --get user.name # 读取最终生效的配置
suchenxiaoyu
$ git config --get-all user.name # 读取所有配置
John Doe
suchenxiaoyu

# 添加配置
$ git config --add user.name test # 添加repository级别配置
$ git config --global --add user.name test # 添加global级别配置(增加一条配置不管存在与否)
$ git config --show-origin --get-all user.name # 读取user.name的所有配置值并显示来源
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    John Doe
file:C:/Users/Administrator/.gitconfig                  suchenxiaoyu
file:C:/Users/Administrator/.gitconfig                  test
file:.git/config                                        test

# 移除配置
$ git config --global --unset user.name # 移除global级别用户名（适合只有一条记录的配置）
warning: user.name has multiple values
$ git config --global --unset-all user.name # 移除global级别用户名的所有配置
$ git config --show-origin --get-all user.name
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    John Doe
file:.git/config        test

$ git config --unset user.name #移除repository级别user.name
$ git config --show-origin --get-all user.name
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    John Doe #user.name只剩system级别配置

$ git config --show-origin --get-regexp user  # 根据正则获取配置信息，如 获取所有级别包含user的配置
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    user.name John Doe
file:C:/Users/Administrator/.gitconfig                  user.email suchenxiaoyu@gmail.com
file:C:/Users/Administrator/.gitconfig                  xuser.name haha
file:.git/config                                        user.name te
file:.git/config                                        user.hello te
file:.git/config                                        xuser.name haha

$ git config --remove-section  user    # remove a section: name
# (移除repository级别的用户节点 user.name,user.email,etc.)
$ git config --show-origin --get-regexp user
file:"C:\\Program Files\\Git\\mingw64/etc/gitconfig"    user.name John Doe
file:C:/Users/Administrator/.gitconfig                  user.email suchenxiaoyu@gmail.com
file:C:/Users/Administrator/.gitconfig                  xuser.name haha
file:.git/config                                        xuser.name haha
```

## References

* [Pro Git][1]
* [Git Community Book][2]

[1]: https://git-scm.com/book/en/v2 "Pro Git"
[2]: http://gitbook.liuhui998.com/index.html "Git Community Book 中文版"
