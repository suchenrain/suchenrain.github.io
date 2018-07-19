---
title: python 环境管理
categories:
  - python
tags:
  - python 环境管理
  - conda
license: nd
abbrlink: 44663
date: 2018-07-18 17:12:27
updated: 2018-07-19 11:28:47
---

建立正常运作的 Python 环境是一个具有挑战性的主题。本文的目的在于如何帮助 python 开发者更好的管理相应的环境。

## Why

为什么需要管理多个 python 环境呢？你可能会问：安装最新的不就好了吗？

别着急，先看下面几个问题：

<!--more-->

- 你开发了一个应用程序，它之前运行得很好。但是现在你试着运行它，它不工作了。也许其中一个包不再与程序的其他部分兼容（所谓的"breaking changes"）。可能的解决方案是设置一个新的环境，其中包含相应的 Python 版本和与应用程序完全兼容的软件包。
- 你可能和别人协同开发，你想确认你的程序能在其他成员的电脑上也正常运行。如果他们的 python 环境和你的不一样？该怎么办呢？

Python 开发环境由特定的 Python 版本和一些包组成。因此，如果想要开发或使用具有不同 Python 或软件包版本需求的应用程序，你就需要设置不同的环境。

那么，如何做呢？

## How

有两个流行的 python 环境设置工具：

- **[PIP][0]** (一个 python 包管理工具，'Pip Installs Packages'的缩写)和**[virtualenv][1]** (创建隔离环境的一个工具)
- **Conda**(一个包和环境管理工具)

[0]: https://pip.pypa.io/en/stable/
[1]: https://virtualenv.pypa.io/en/stable/

在接下来我们介绍`Conda`的使用，因为它有如下优点：

- 清晰的结构:目录简洁有条理
- 透明的文件管理:所有文件都包含在安装文件夹。
- 灵活性:它包含很多包(PIP 包也可安装到 Conda 环境)
- 多用途:不仅是管理 Python 环境和包,还可以用于管理其他语言比如 R(统计计算的编程语言)

### Conda 版本的选择

目前有 3 种安装包：

- [Anaconda][2] (free)
- [Miniconda][3] (free)
- [Anaconda Enterprise platform][4] (商用))

[2]: https://www.anaconda.com/download/
[3]: https://conda.io/miniconda.html
[4]: https://www.anaconda.com/enterprise/

这里我们只讨论前两种，它们都会安装 Conda 以及设置默认环境（base environment）。区别在于，Anaconda 会安装超过 150 个系统包（比如用于统计和机器学习的包），同时它还会安装一个图形化的工具 Anadaconda Navigator。而对于迷你的 Miniconda，它需要更少的磁盘空间，因为它并不会安装额外的软件包。
{% hint %}
关于选择 Python 2.7 还是 3.x 安装包，取决你的实际需求，并且这会成为默认根环境的 python 版本。
{% endhint %}

### Managing environments（环境管理）

window 为例，打开`Anaconda Prompt`

添加新的环境

```
conda create --name py27 python=2.7
```

激活特定环境/切换回根环境

```
# 激活
conda activate py27

#
conda deactivate
```

conda 信息

```
conda info

# 已有环境信息
conda env list
```

### Managing Packages(包管理)

#### Package channels(包通道)

通道里包含依赖包的路径信息，Conda 通过这些信息寻找依赖包。在 Conda 的安装过程中，（Conda 的开发人员）通道是默认设置的，因此没有任何进一步的修改，这些是 Conda 将开始搜索包裹的位置。

通道以分层的顺序存在。最高优先级的通道是 Conda 检查的第一个通道，寻找需要的包。可以改变这个顺序，并向它添加通道（并设置它们的优先级）

在通道列表中添加一个通道作为最低优先级是一个很好的做法。通过这种方式，你可以包含“特殊的”软件包，它们不是默认设置的（连续体通道）的一部分。因此，在最后你可以得到所有的缺省包——不存在通过较低优先级通道重写它们的风险——以及需要的“特殊”选项。

![图 1 - channels work flow](http://suchenrain-1255943826.file.myqcloud.com/Post/python/channels.jpeg 'channels work flow')

要安装一个无法在这些默认通道中找到的软件包，你可以在[这里](https://anaconda.org/anaconda/repo)搜索特定的软件包。注意：并不是所有的包都可以在所有平台上使用。

```
# 添加最低优先级的通道
conda config --append channels newchannel

# 添加最高优先级的通道
conda config --prepend channels newchannel

# 通道列表
conda config --get channels
```

{%hint error%}
值得注意的是，如果多个通道都包含了同一个包的不同版本，那么通道的层次优先级决定了最终将会被安装的包版本，即使优先级高的通道包含更旧的版本。
{% endhint%}

![图 2- priority > version](http://suchenrain-1255943826.file.myqcloud.com/Post/python/1_MlQ3bR4i6tYs_Jx-DEVPWg.jpeg 'priority > version')

**搜索/安装/移除 包**

```
# 已安装包的信息
conda list

# 搜索指定包
conda search -f seaborn

# 从通道列表里的最高级通道安装包
# 如果未指定版本，默认安装最新可用的版本
conda install seaborn
conda install seaborn=0.7.0

# 从指定通道里安装包,yaml
conda install -c mychannel yaml

# 更新所有已安装的包
conda update

# 更新指定的包
conda update seaborn

# 移除指定的包
conda remove seaborn
```

**`阻止包更新（固定包版本）`**

在当前`环境`的目录的`conda-meta`文件夹下创建一个名为`pinned`文件，往这个文件添加你要阻止更新的包列表。比如说，强制`seaborn`使用 0.7.x 分支，锁定`yaml`固定使用 0.1.7 版本：

```
seaborn 0.7.*
yaml ==0.1.7
```

**`更新某个环境的Python版本`**

Python 本身也是一个包。

首先，查看可用的版本。

```
conda search -f python
```

替换当前的 python 版本

```
conda install python=3.4.2
```

要将 Python 版本更新到其分支的最新版本（例如，将 3.4.2 升级到 3.4.4 的 3.4.4），运行：

```
conda update python
```

**`添加PIP包`**
在本文开始的时候，我建议使用 Conda 作为包和环境管理器（而不是 PIP）。正如我上面提到的，PIP 包也可以作为一个包安装到 Conda 环境中。

因此，如果一个包在 Conda 通道不可用时，你可以尝试从[PyPI 包索引](https://pypi.python.org/pypi)中安装它。可以通过使用 pip 命令来做到这一点（默认情况下，Conda 安装程序可以使用这个命令，因此你可以在任何活动环境中应用它）。例如，如果你想要安装 lightgbm 包（它是一个梯度增强框架），运行：

```
pip install lightgbm
```
