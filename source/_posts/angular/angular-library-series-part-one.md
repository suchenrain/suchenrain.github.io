---
title: Angular Library系列 - 使用CLI创建自己的库
categories:
  - Angular
  - Library
tags:
  - angular 6
  - angular library
abbrlink: 8912
date: 2018-09-06 14:04:55
updated: 2018-09-06 19:32:10
---

随着`Angular 6`的发布, `Angular CLI`在一定程度上可以说是有了很大的提升。`Angular CLI`集成[`ng-packagr`][0]构建生成 Angular 库就是其中之一。**ng-packagr** 是由 David Herges 创建的一个很棒的工具，用于将你的库代码转换成官方约定的[Angular 包格式][1]。

接下来的内容中，你将体验创建一个自己的 Angular 库的具体过程。并且，为了避免陷入不必要的麻烦，创建的过程中我会着重强调一些实用的规则。

相应的[GitHub 代码][2]

# 介绍

通过`ng new` Angular CLI 为我们创建了一个新的工作区(workspace).

<!--more-->

在这个 Angular **workspace**中我们将创建两个项目：

- A library Project
  这是包含我们想要创建的组件和服务的库。
  这些代码是我们可以发布到**npm**等第三方库提供商的。
- An application project
  这个项目用来测试展示我们的库。有时候此项目用作库的文档说明或者用例演示。

这里还会有 Angular CLI 默认为我们创建的 e2e 测试项目，不过本文中我们将忽略它。

现在我们已经对我们的 Angular workspace 有了一个大概的认识，接下来是本教程一些具体的目标：

## 目标

- 使用 Angular CLI 创建一个与我们打算创建的库名称一样的工作区(workspace)：**example-ng6-lib**
- 创建名为`example-ng6-lib-app`的应用
- 创建名为`example-ng6-lib`库
- 使用`enl`作为库前缀
- 在`example-ng6-lib-app`里导入`example-ng6-lib`库并使用

# Angular 6

在写作本文的时候，Angular 6 还是刚出来不久，所以和以前的版本会有些细小的出入。

Angular CLI 的版本号开始和 Angular 保持一致：从 1.7 跳跃到 6.0.0

Angular CLI 的配置文件将使用`angular.json`替换原有的`angular-cli.json`

现在 CLI 生成的工作区(workspace)同时支持多个项目

# 创建 Angular 工作区

我们的第一个目标是创建一个名为`example-ng6-lib`的**Angular 工作区**。由于 CLI 现有的工作方式，我们需要以一种循环的方式来做这件事。我们需要创建一个名为`example-ng6-lib-app`的工作空间，然后将其重命名为`example-ng6-lib`(因为 CLI 默认会生成与工作区同名的 application 和 e2e 项目)：

```
ng new example-ng6-lib-app
rename example-ng6-lib-app example-ng6-lib
cd example-ng6-lib
ng serve
```

如果想要支持 IE, 需要做额外的一些工作：[Angular 和 IE][3]

# Angular 6 配置：angular.json

在我们进行下一步创建库之前，先让我们快速的看一下新的 Angular 配置文件:angular.json

相较于旧的 angular-cli.json, 配置内容变化许多。

最主要的是新增的`projects`对象,每个项目对应一个条目

```
"projects": {
  "example-ng6-lib-app": {
    ...
  },
  "example-ng6-lib-app-e2e": {
    ...
  }
},
```

到目前为止，我们只有两个 project:

- **example-ng6-lib-app**: 这是我们打算用来测试库的应用项目
- **example-ng6-lib-app-e2e**:这是默认的端到端测试项目（暂时忽略）

请记住，我们告诉 CLI 创建名为:`example-ng6-lib-app`的工作空间.

然后，CLI 我们创建了一个名为`example-ng6-lib-app`的默认应用程序。这让我们有机会将库项目命名为：`example-ng6-lib`。一旦我们创建了我们的库，对应的条目将添加到这个 projects 对象中。

{% hint%}
**Notes**：使用`库+app`来命名工作区，然后将其重命名为库的名称。
{%endhint%}

# 创建库模块

现在让我们在工作区创建名为`example-ng6-lib`的库。

```
ng generate library example-ng6-lib --prefix=enl
```

上面我们使用了`--prefix`选项，使得库元素特定的前缀。否则将默认使用 lib 作为前缀。

generate library 具体做了什么呢？

- 在`angular.json`文件中添加**example-ng6-lib project**条目
- 在`package.json`中为 ng-packagr 添加相应的依赖
- 在`tsconfig.json`文件里为 example-ng6-lib 添加构建路径的引用
- 在`projects/example-ng6-lib`路径下创建初始源代码

我们可以再具体深入地看看各自做了啥？

## example-ng6-lib project in angular.json

仔细瞧瞧**angular.json**,你会发现`projects`下面多了一条记录：**example-ng6-lib**

{% gist 796a51b5d6801ffccb90d360d9900777  %}

这里有几个值得注意的元素：

`root`
指向库项目的根文件夹。

`sourceRoot`
指向存放库的实际源代码的根路径。

`projectType`
项目类型:`library` 和`application`.

`prefix`

[0]: https://github.com/ng-packagr/ng-packagr
[1]: https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview
[2]: https://www.baidu.com
[3]: https://blog.angularindepth.com/angular-and-internet-explorer-5e59bb6fb4e9
