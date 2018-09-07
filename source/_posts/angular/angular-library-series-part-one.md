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
updated: 2018-09-07 18:45:58
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

{% gist 796a51b5d6801ffccb90d360d9900777 example-ng6-lib-angular.json %}

这里有几个值得注意的元素：

`root`
指向库项目的根文件夹。

`sourceRoot`
指向存放库的实际源代码的根路径。

`projectType`
项目类型:`library` 和`application`.

`prefix`
CLI 生成组件的选择器前缀标识符

`architect`
包含很多个部分比如`build`,`test`和`lint`,这些设置告诉 Angular CLI 如何处理相应的 process.请注意，在构建的部分，使用的是**ng-packagr**.

## ng-packagr dependency in package.json

当我们创建库的时候 Angular CLI 自己就已经意识到它需要用到**ng-packagr**，所以它在我们的工作区 package.json 里面添加了相应的**devDependencies**:

```
"ng-packagr": "^3.0.0",
```

## build path in tsconfig.json

当我们想测试我们的 example-ng6-lib 的时候，我们希望能像引入第三方库一样使用它，而不是作为应用的一组文件集。通常，当我们在项目中使用第三方类库时，我们通过`npm install`将库安装到**node_modules**文件夹内。

尽管如此，example-ng6-lib 并不会安装到**node_modules**，而是将被构建到我们工作空间的`dist`文件夹的子文件夹中。Angular CLI 把这个文件夹添加到**tsconfig.json**中使得它可以作为一个库导入到应用中。

```
"paths": {
    "example-ng6-lib": [
    "dist/example-ng6-lib"
    ],
    "example-ng6-lib/*": [
    "dist/example-ng6-lib/*"
    ]
}
```

## example-ng6-lib 源代码

**src**文件夹位于`projects/example-ng6-lib`. Angular CLI 默认为新库创建了一个包含服务和组件的模块，此外还有另外一些文件：

`package.json`
这是针对库的特定 package.json 文件。当库作为一个**npm**包发布时，这个文件一会一同发布，所以当别人通过 npm 使用我们的库时，就会安装这个文件里指定的依赖。

`public_api.ts`
这就是所谓的入口文件。它定义了我们库的哪些部分是外部可见的。你可能会问：这不是模块中的`export`做的事情吗？的确是的，但这可能比那更复杂一点。我们会在后面再讨论这个。

`ng-package.json`
**ng-packagr**的配置文件。如果是在以前，我们需要熟悉它的内容。但是现在，新的 Angular CLI 足以告诉 ng-packagr 在哪里找到我们的入口文件以及在哪里构建我们的库。

# 库构建

在使用我们新创建的库之前，我们需要对它进行编译：

```
ng build --prod example-ng6-lib
```

编译后的库文件将会放在`example-ng6-lib-app\dist\example-ng6-lib`

使用`--prod`选项可以确保我们更早地发现预编译错误。

# 在项目应用中使用库

构建一个库的核心思想之一就是，我们通常有一个和库一起构建的应用程序，以便测试它。

这里**example-ng6-lib-app**将会使用我们的库。

## 导入 example-ng6-lib 模块

修改**AppModule**模块：src\app\app.module.ts

把`ExampleNg6LibModule`添加到`imports`数组中。可能你使用的 IDE 会提示你引入相应的模块文件，但是请不要相信它！我们应该通过库名称导入它：

```
import { ExampleNg6LibModule } from "example-ng6-lib";
```

这是可行的，因为当以名称导入库时，Angular CLI 首先查找`tsconfig.json paths`，然后是 node_modules。

{% hint danger%}
**NOTE**：在测试应用程序中，使用名称而不是单独的文件来导入库。
{% endhint %}

至此，app.module.ts 文件应该差不多像这样：
{% gist 796a51b5d6801ffccb90d360d9900777 example-ng6-lib-app.module.ts %}

## 使用 example-ng6-lib 组件

简单起见，我们在 AppComponent 模板里面使用类库默认创建的组件。

我们替换 AppComponent 模板的下半部分代码：

```
<enl-example-ng6-lib></enl-example-ng6-lib>
```

修改后的**src\app\app.component.html**
{% gist 796a51b5d6801ffccb90d360d9900777 example-ng6-lib-app.component.html%}

最后运行`ng serve`查看效果。

# 拓展我们的库

到目前为止我们已经知道如何构建并运行测试我们的类库。接下来给我们的类库添加一个新的组件。

下面是将要进行的步骤：

1. 在类库中创建新的组件
1. 将创建的组件在模块文件中导出
1. 将新的组件添加到入口文件总
1. 重新编译我们的类库
1. 在测试应用中使用新的组件

## 创建类库组件

通过`--project`选项告诉 Angular CLI 我们想要给指定的类库项目创建新的组件。现在创建一个简单的名叫`foo`的类库组件：

```
ng generate component foo --project=example-ng6-lib
```

CLI 自动帮我们创建了这个组件并将它添加到类库模块文件(`projects\example-ng6-lib\src\lib\example-ng6-lib.module.ts`)的`declarations`数组中.

## 从类库模块中导出组件

[0]: https://github.com/ng-packagr/ng-packagr
[1]: https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview
[2]: https://github.com/suchenrain/example-ng6-lib
[3]: https://blog.angularindepth.com/angular-and-internet-explorer-5e59bb6fb4e9
