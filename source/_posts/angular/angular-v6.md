---
title: angular 6.0发布啦
categories:
  - Angular
tags:
  - angular
  - ng-conf
license: nd
abbrlink: 64464
date: 2018-05-12 18:23:34
---
{% sfb info%}
翻译自：[version-6-of-angular-now-available](https://blog.angular.io/version-6-of-angular-now-available-cc56b0efa7a4)
{% endsfb %}

Angular 6.0.0 已经发布啦! 这是一个重要的版本，因为我们更多地将关注点从Angular自身底层框架转移到了相关的工具链上,如何让Angular的快速开发在以后变得更加简单。

![a photo by Manu Murthy of the Angular Team](https://suchenrain-1255943826.file.myqcloud.com/Post/1_V3Kfghg_jIV0ubxmAnCXBA.jpeg)

作为这次新版本发布的一部分, 我们升级了框架包的主版本(`@angular/core`, `@angular/common`, `@angular/compiler`, etc), Angular CLI, 以及 Angular Material + CDK。为了区分交叉兼容性，我们更改了主版本号，所以现在发布的都是6.0.0版本。而这些项目的小版本和补丁版本将根据项目的需要发布。

你可以通过我们的changelogs来查看全部变更列表: [framework](https://github.com/angular/angular/blob/master/CHANGELOG.md), [material+cdk](https://github.com/angular/material2/blob/master/CHANGELOG.md), [cli](https://github.com/angular/angular-cli/releases).

## ng update

`ng update <package>` 是一个CLI的新命令。它会分析你项目的 `package.json`文件并且利用Angular的相关知识智能地为你推荐更新. 实际例子请查阅[update guide](https://update.angular.io/).
<!--more-->
不仅可以通过`ng update` 来帮助你使用依赖包的合适版本,及保持包的同步, 第三方也可以通过[schematics](https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2)提供更新脚本 . 如果你的一个依赖包提供了`ng update` schematic, 它们可以在需要进行破坏更改时自动更新代码！

`ng update` 不会取代你的包管理器, 而是借助于npm或者yarn来管理依赖项。除了更新依赖项和对等的依赖项之外, 如果有需要，`ng update`会对你的项目做相应的转换。

举个例子，`ng update @angular/core` 会更新所有的Angualr框架包，连同RxJS和TypeScrit。并且它会运行这些依赖项的任何可用的schematics，从而保证项目最新。作为这一命令的一部分，我们将自动将`RxJS -compat`安装到应用程序中，以使更加顺利的使用RxJS v6。

我们期望在未来的几个月里会看到更多的库和包添加`ng update`的schematics，而且我们已经从企业组件库团队那里听说过，他们计划使用`ng update`来通过自动化的方式来推动重要的变化，以节省开发人员的时间。

Learn more about [how the ng update command works](https://github.com/angular/devkit/blob/master/docs/specifications/update.md). 想创建属于你自己的`ng update` schematic, 请移步 [package.json of rxjs](https://github.com/ReactiveX/rxjs/blob/8c5d680494a8bc986e638f6138447917c7ba180f/package.json#L231-L233) 以及 [collection.json](https://github.com/ReactiveX/rxjs/blob/master/migrations/collection.json).

## ng add

另一个新的CLI命令`ng add <package>`使您的项目更容易添加新的功能。`ng add`将使用你的包管理器来下载新的依赖项，并调用安装脚本(实现为schematic)，该脚本可以通过配置更改更新项目，添加额外的依赖项(例如，poly填充)，或者使用特定于包的初始化代码。

在你的新`ng new`应用程序中尝试以下几点:
 * `ng add @angular/pwa` — 通过添加应用程序清单和`service worker`，将应用程序转换为PWA。
 * `ng add @ng-bootstrap/schematics` — 添加 ng-bootstrap 到你的项目中。
 * `ng add @angular/material` — 安装和设置 Angular Material和主题，并将新的开始组件注册到`ng generate`
 * `ng add @clr/angular@next` — 从虚拟机安装和设置Clarity
 * `ng add @angular/elements` — 添加必须的`document-register-element.js` polyfill（填充）以及`angular elements`相关依赖 (see below)

因为`ng add`是建立在schematics和npm注册表之上的，我们希望相关库和社区能够帮助我们构建一个丰富的`ng add`支持包生态系统。

查阅 [Angular Material’s ng-add schematic](https://github.com/angular/material2/blob/master/src/lib/schematics/collection.json) 例子来开始构建你自己的 ng-add schematics.

## Angular Elements

Angular Elements的第一个版本集中于允许你通过将其作为定制元素注册在现有的angular应用程序中引导angular组件。我们在angular.io上广泛使用这一点并作为我们的内容管理系统的一部分，从而允许通过嵌入的HTML对功能进行动态引导。这代替了在静态html内容中手工引导的angular组件的需要。

更多请查阅[an example of registering a component as a custom element](https://stackblitz.com/edit/angular-f3nrpv?file=app%2Fapp.module.ts) 或更多关于 [Angular Elements](https://angular.io/guide/elements).

油管视频 [Angular Elements Quick Start](https://www.youtube.com/watch?v=4u9_kdkvTsc) 

## Angular Material + CDK Components

最大的变化就是用于显示分层数据的新的树组件。下面的模式来自数据表组件, CDK提供了核心树指令。使用Angular Material所提供的和Material设计一样的样式。 我们最近讨论了这个组件，所以请查看更多信息。这些新的树组件都有样式(Material’s `mat-tree`)和没有样式的版本(CDK’s `cdk-tree`)。

在树组件的旁边，我们也有新的徽章和底板组件。标识符有助于显示一些有用的信息，比如未读项计数。bottom -sheets是一种特殊类型的以移动为中心的对话框，它从viewport的底部出现，通常用于在操作之后呈现一个选项列表。

`@angular/cdk/overlay`包是cdk中最强大的基础设施之一。随着版本6的发布，这个包现在包含了新的定位逻辑，可以帮助弹出窗口在所有情况下智能地保持在屏幕上。

## Angular Material Starter Components

![ng generate for adding a dashboard to your project](https://suchenrain-1255943826.file.myqcloud.com/Post/1_vD2u7I_a_uxs33qcdo2R6g.gif)

一旦您运行了`ng add @angular/material`以向现有应用程序添加材料，您还将能够生成3个新的启动组件。

### Material Sidenav

现在，您可以生成一个starter组件，包括带有应用程序名称和边导航的工具栏。该组件基于断点响应。

Run:

```
ng generate @angular/material:material-nav --name=my-nav
```

这将创建这个starter组件:

![material-nav](https://suchenrain-1255943826.file.myqcloud.com/Post/1_PKi-6dOhlb61g8CM2JCx-Q.png)

### Material Dashboard

现在，您可以生成一个包含动态网格列表的starter dashboard组件。

Run:

```
ng generate @angular/material:material-dashboard --name=my-dashboard
```

这将创建这个starter组件:

![material-dashboard](https://suchenrain-1255943826.file.myqcloud.com/Post/1_De1Vnm2m1yID_EL_xRYIyw.png)

### Material Data Table

您可以生成一个启动数据表组件，它预先配置了一个数据源来进行排序和分页。

Run:

```
ng generate @angular/material:material-table --name=my-table
```

这将创建这个starter组件:

![material-table](https://suchenrain-1255943826.file.myqcloud.com/Post/1_2MO1hno7d30iTPIZ9CnBzw.png)

了解更多[Angular Material Schematics.](https://material.angular.io/guide/schematics)

## CLI Workspaces

CLI v6现在支持包含多个项目的工作空间，例如多个应用程序或库。CLI项目现在将使用`angular.json`替`.angular-cli.json`用于构建和项目配置。

每个CLI工作区都有项目，每个项目都有目标，每个目标都可以有配置。

```json
{
  "projects": {
    "my-project-name": {
      "projectType": "application",
      "architect": {
        "build": {
          "configurations": {
            "production": {},
            "demo": {},
            "staging": {},
          }
        },
        "serve": {},
        "extract-i18n": {},
        "test": {},
      }
    },
    "my-project-name-e2e": {}
  },
}
```

了解更多新版配置文件[new configuration file](https://github.com/angular/angular-cli/wiki/angular-workspace)

## Library Support

我们的CLI中最需要的特性之一是支持创建和构建库，我们可以很自豪地介绍:

```
ng generate library <name>
```

![ng generate library within an existing project](https://suchenrain-1255943826.file.myqcloud.com/Post/1_6uz18nxGzAtk5ftoDZv_iQ.gif)

该命令将在CLI工作区中创建一个库项目，并将其配置为测试和构建。

[Learn more about creating libraries with the Angular CLI](https://github.com/angular/angular-cli/wiki/stories-create-library)

## Tree Shakable Providers

为了使你的应用程序更小，我们已经从模块引用服务的模式转换为服务引用模块。这意味着允许我们只将模块中注入的服务捆绑到你的代码库中。

### Before

```typescript app.module.ts
@NgModule({
  ...
  providers: [MyService]
})
export class AppModule {}
```

```typescript my-service.ts
import { Injectable } from '@angular/core';

@Injectable()
export class MyService {
  constructor() { }
}
```

### After

我们的NgModule中不需要引用。

```typescript my-service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MyService {
  constructor() { }
}
```

[Read more about Dependency Injection](https://angular.io/guide/dependency-injection)

## Animations Performance Improvements

我们已经更新了动画的实现，将不再需要[web 动画填充库](https://angular.io/guide/browser-support#enabling-polyfills). 这意味着你可以从你的程序中移除这些填充库并减少大约47KB的包大小, 同时增加Safari的动画性能。

## RxJS v6

Angular已经更新到使用v6的RxJS。RxJS是一个独立的项目，在几周前发布了v6。RxJS v6带来了几个主要的更改，以及向后兼容包RxJS -compat，它将使您的应用程序正常工作。

RxJS已经被重新整理，使它更容易被树摇（tree-shakable），确保只有你使用的RxJS片段包含在最终的生产包中。

如果您使用`ng update`，您的应用程序应该可以继续工作，但是您可以了解更多关于[5.5 to 6.0 migration](https://github.com/ReactiveX/rxjs/blob/master/MIGRATION.md).

## Long Term Support (LTS)

我们正在扩大对所有主要产品的长期支持。

之前我们宣布只有v4和v6是LTS版本，但是为了使从一个专业升级到下一个更容易，并且给更大的项目更多的时间来计划更新，我们决定从v4开始扩展对所有主要版本的长期支持。

每个主要的版本将被支持18个月，大约6个月的积极开发，然后是12个月的关键补丁和安全补丁

了解更多关于如何[Angular versions and releases](https://angular.io/guide/releases).

## How to update to 6.0.0

访问[update.angular.io](https://update.angular.io/) 来获取关于更新应用程序的信息和指南。

更新通常遵循3个步骤，并将利用新的ng update工具。

 1. Update @angular/cli
 2. Update your Angular framework packages
 3. Update other dependencies

让开发人员轻松地了解最新版本对我们来说非常重要，所以让我们知道您在评论中对这个版本的看法!

## What about Ivy?

在[ng-conf我们提到了一个叫做Ivy的新项目](https://youtu.be/dIxknqPOWms?t=1360) — 我们的下一代渲染管道。Ivy目前正在开发中，并不是6.0版的一部分。我们将在接下来的几个月里宣布一项关于Ivy的选择预览。关注这个博客的最新信息。

