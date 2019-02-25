---
title: 'Angular 实战系列 - Part 1: MEAN 配置 & Angular 架构'
abbrlink: 30078
categories:
  - Angular
  - Angular实战系列
tags:
  - Angular实战
date: 2019-01-02 20:55:57
updated: 2019-01-02 21:57:27
license: nd
---

本系列教程的第一部分将介绍如何为实际的 Angular 应用程序设置云托管的 MongoDB 数据库、Node 服务器和前端。

1.  [介绍：我们打算做什么？](#介绍：我们打算做什么？)
1.  [配置 Angular 应用](#配置Angular应用)
1.  [配置托管的 MongoDB](#配置托管的MongoDB)
1.  [Auth0 的配置](#Auth0的配置)
1.  [Node.js 服务器设置](#Node.js服务器设置)
1.  [Angular: 创建 HomeComponent](#Angular-创建HomeComponent)
1.  [Angular: 布局和全局组件](#Angular-布局和全局组件)

### 介绍：我们打算做什么？

本系列教程将教你如何构建一个真实的基于`MEAN技术栈`的应用程序，涵盖从构思和数据建模到生产部署的所有内容。

为了了解生产级的 JavaScript web 应用程序开发的来龙去脉，我们将会构建一个围绕事件的应用程序。通过 RSVP 应用程序，管理员能够发布、更新和删除事件信息；其他用户能够回复事件。这个 RSVP 应用程序的功能将包括以下:

- 身份验证和角色授权（客户端和服务端）
- 使用 API 进行 CRUD 操作
- 搜索和过滤
- 模版驱动的表单
- 具有自定义验证的响应式表单
- 简单的动画
- 延迟加载
- 在 VPS 上使用 nginx 和 SSL 进行生产部署

废话不多说，开始吧！

### 配置 Angular 应用

整个系列我们将使用`Angular CLI` 进行构建开发，所以保证你已经全局安装了 CLI:

```
$ npm install -g @angular/cli
```

{% note success%}
**Angular CLI**: `6.1.5` **Node**: `10.7.0` **Angular**: `6.1.10`
{% endnote %}

#### 创建 Angular 项目

安装好 CLI 后，打开终端并进入你想创建项目的路径，执行下面的命令:

```
ng new mean-rsvp --routing --style scss
```

CLI 会生成一个带有`路由模块`和 `SCSS` 支持的 Angular 项目。一旦项目依赖安装完成，我们就可以着手开发了。

#### 添加 Title 服务

为了能够在路由时动态地改变页面标题，我们需要使用 Angular 内置的`Title`服务。这是因为我们创建的是一个单页应用，`<title>`标签并不在我们的 Angular 应用程序内，所以我们无法对它进行操作。

```typescript app.module
// src/app/app.module.ts
import {BrowserModule,Title} from '@angular/platform-browser'
...
@NgModule({
  ...,
  providers:[
    Title
  ],
  ...
})
```

#### 添加 Bootstrap

打开`src/index.html`并添加`Bootstrap`样式 CDN：

```html
<!-- src/index.html -->
...
<head>
  ...
  <title>RSVP</title>
  ...
  <link
    rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
    integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
    crossorigin="anonymous"
  />
</head>
...
```

或者通过`angular.json`配置`styles`引入 bootstrap 样式（此处略）。

#### 全局 SCSS

现在我们将添加一些 SCSS 来管理应用程序的全局样式,包含基本的布局和媒体查询。

首先在`src/assets`下创建新的`scss`文件夹，然后将`src/styles.scss`移动到这个新建的路径。接着修改 angular.json 中对应项目的`styles`：

```json
...
      "styles": [
        "assets/scss/styles.scss"
      ],
 ...
```

做完这些，项目的样式将管理在在 `assets` 文件夹中。

##### BASE STYLES

```scss
/* src/assets/scss/_base.scss */
/*--------------------
       BASICS
--------------------*/
body {
  min-width: 320px;
}

/*-- Cursor --*/

a,
input[type=button],
input[type=submit],
button {
  cursor: pointer;
}

/*-- Link Buttons --*/
...

/*-- Forms --*/
...
/*-- Helpers --*/
...
```

Bootstrap 提供了大量样式，`_base.scss`则提供了一些基本的帮助和改进样式。

##### VARIABLES AND PARTIALS

创建新的文件夹`src/assets/scss/partials`,添加`_layout_vars.scss`文件：

```scss
/* src/assets/scss/partials/_layout.vars.scss */
/*--------------------
   LAYOUT VARIABLES
--------------------*/

$padding-screen-small: 3%;
$padding-screen-large: 1.5% 3%;
```

再添加`_responsive.partial.scss`文件：

```scss
/* src/assets/scss/partials/_responsive.partial.scss */
/*--------------------
      RESPONSIVE
--------------------*/

/*-- Variables --*/

$large: 'screen and (min-width: 768px)';

/*-- Mixins --*/

@mixin mq($mqString) {
  @media #{$mqString} {
    @content;
  }
}
```

文件包含了一个`$large`变量，其中包含一个用于大屏幕大小的媒体查询，以及一个`mq()` 混合，用于在 SCSS 中轻松定位媒体查询。如果有必要，我们可以随着应用程序的增长向该文件添加更多变量。

##### IMPORT GLOBAL SCSS

最后，我们整合这些创建的样式，以导入项目中。还记得前面项目样式放在`assets/scss/styles.scss`吗, 所以只需：

```scss
/* src/assets/scss/styles.scss */
// partials
@import 'partials/layout.vars';
@import 'partials/responsive.partial';

// global styles
@import 'base';
```

### 配置托管的 MongoDB

[`MongoDB`](https://docs.mongodb.com/manual/)是一个开源的文档数据库。为了提高速度和易用性，我们将在应用程序的数据库中使用[`mLab`](https://mlab.com/plans/pricing/#plan-type=sandbox)的免费云托管 MongoDB 部署。我们还将通过[`MongoBooster`](https://mongobooster.com/)连接管理 MongoDB。

具体的账号注册，数据库创建连接管理这里就不再赘述，相信电脑前聪明的你很快就能搞定！

### Auth0 的配置

到了这里说明你已经配置好数据库啦，真棒！接下来，我们的 Angular 应用程序和 Node API 将使用 IDaaS(身份即服务)平台[`Auth0`](https://auth0.com/)进行身份验证和路由授权。

#### 注册免费账号

我们需要一个 Auth0 帐户来管理身份验证。你可以在[这里注册](https://auth0.com/signup)一个免费帐户。接下来，设置一个 Auth0 应用程序和 API，这样 Auth0 就可以与 Angular 应用程序和 Node API 进行交互。

#### 配置应用程序

1. 进入 Dashboard，创建新的应用程序，如`RSVP MEAN App`，并选择`SPA`.
1. 切换到`Settings`页面,**Allowed Callback URLs**:添加`http://localhost:8083/callback`和`http://localhost:4200/callback`.
1. **Allowed Web Origins**,添加`http://localhost:8083` 和 `http://localhost:4200`.
1. **Allowed Logout URLs**, 添加 `http://localhost:4200`.
1. 高级设置的 OAuth 下的 **JsonWebToken Signature Algorithm**,确保设置为 `RS256`.

我们在回调 url 中添加了两个端口，并允许 web 源，因为我们将在开发期间从这两个端口运行和测试应用程序。端口 `4200` 是 Angular CLI 服务于 Angular 应用的端口。端口 `8083` 是我们的 Node API 和服务器使用的端口:为了测试产品构建，这是必要的。项目部署后，我们将替换这些设置为生产环境。

#### 配置 API

1. 切换到 API，创建 API 配置。输入 API 的名称(例如:RSVP 表示 API)。
1. 将标识符设置为 API 端点 URL。此标识符是授权调用的`audience`参数。在我们的应用程序中，是`http://localhost:8083/api/`。
1. 签名算法配置为`RS256`。

### Node.js 服务器设置

紧接着就是我们的 Node 服务器和 API 了。

#### 安装依赖项

在我们的 Angular 项目根目录下，运行下面命令：

```
$ npm install express body-parser express-jwt jwks-rsa method-override mongoose cors --save
```

#### 服务端文件结构

在项目根目录下创建`server`文件夹并在其中添加两个文件:`server/api.js`和`server/config.js`，同时在根目录下创建`server.js`文件。至此文件结构大概如下：

```
...
server/
  |- api.js
  |- config.js
src/
...
server.js
...
```

#### 配置项

打开`server/config.js`,添加如下配置：

```javascript
module.exports = {
  AUTH0_DOMAIN: '[YOUR_AUTH0_DOMAIN]', // e.g. suchenrain.auth0.com
  AUTH0_API_AUDIENCE: '[YOUR_AUTH0_API]', // e.g. `http://localhost:8083/api/`
  MONGO_URI: 'mongodb://[USER]:[PWD]@[DS######].mlab.com:[PORT]/[DB_NAME]'
};
```

记住将上述的相应值替换成你的配置，这些配置可以在 Auth0 和 mLab 账号里找到。

#### Node Server

打开`server.js`,添加如下配置：

```js
// server.js
/*
 |--------------------------------------
 | Dependencies
 |--------------------------------------
 */

// Modules
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const cors = require('cors');
// Config
const config = require('./server/config');

/*
 |--------------------------------------
 | MongoDB
 |--------------------------------------
 */

mongoose.connect(config.MONGO_URI);
const monDb = mongoose.connection;

monDb.on('error', function() {
  console.error(
    'MongoDB Connection Error. Please make sure that',
    config.MONGO_URI,
    'is running.'
  );
});

monDb.once('open', function callback() {
  console.info('Connected to MongoDB:', config.MONGO_URI);
});

/*
 |--------------------------------------
 | App
 |--------------------------------------
 */

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cors());

// Set port
const port = process.env.PORT || '8083';
app.set('port', port);

// Set static path to Angular app in dist
// Don't run in dev
if (process.env.NODE_ENV !== 'dev') {
  app.use('/', express.static(path.join(__dirname, './dist')));
}

/*
 |--------------------------------------
 | Routes
 |--------------------------------------
 */

require('./server/api')(app, config);

// Pass routing to Angular app
// Don't run in dev
if (process.env.NODE_ENV !== 'dev') {
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/dist/index.html'));
  });
}

/*
 |--------------------------------------
 | Server
 |--------------------------------------
 */

app.listen(port, () => console.log(`Server running on localhost:${port}`));
```

请注意，有几个部分是与环境相关的。对于开发，我们希望能够利用 Angular CLI 提供和监视文件的功能，而不需要每次检查工作时都构建一个完整的项目。为了便于实现这一点，我们将从开发中分离 Node.js 服务器和 Angular 前端开始。

这样，我们就可以在`localhost:8083`上运行 Node API，而 Angular 应用程序在`localhost:4200`上运行。对于生产环境，我们希望 Node 服务器运行 API 并使用静态路径来提供前端服务。

#### API 路由

打开`api.js`文件并编辑：

```js
// server/api.js
/*
 |--------------------------------------
 | Dependencies
 |--------------------------------------
 */

const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

/*
 |--------------------------------------
 | Authentication Middleware
 |--------------------------------------
 */

module.exports = function(app, config) {
  // Authentication middleware
  const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: config.AUTH0_API_AUDIENCE,
    issuer: `https://${config.AUTH0_DOMAIN}/`,
    algorithm: 'RS256'
  });

  /*
 |--------------------------------------
 | API Routes
 |--------------------------------------
 */

  // GET API root
  app.get('/api/', (req, res) => {
    res.send('API works');
  });
};
```

Auth0 API 结合`express-jwt`和`jwks-rsa`一起使用，我们可以在必要时实现对特定 API 路由进行保护。实现这一点，我们可以通过向希望保护的路由添加`jwtCheck`中间件函数。

#### 启动项目

为了方便开发，全局安装`nodemon`来监视 Node 服务器的变化，而不需要在更新之后重新启动:
`npm install nodemon -g`

开发阶段，我们会经常性的修改项目，所以打算使用分开的终端窗口来启动`Angular App`和`Node API`。

```bash
# Angular App => http://localhost:4200
$ ng serve

# Node API => http://localhost:8083/api
# Windows:
$ SET NODE_ENV=dev
$ nodemon server
# OR Mac:
$ NODE_ENV=dev nodemon server
```

### Angular: 创建 HomeComponent

运行下面的命令，添加一个主页面组件：

```TypeScript
$ ng g component pages/home
```

将新创建的 Home 组件添加到路由：

```TypeScript
// src/app/app-routing.module.ts
import {HomeComponent} from './pages/home/home.componet';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  }
];
...

```

#### 使用 Title 服务

前面我们已经在[Angular App Setup](#添加-Title-服务)全局注入了`Title`服务，现在我们可以直接使用它：

```typescript
// src/app/pages/home/home.component.ts
...
import { Title } from '@angular/platform-browser';

...
export class HomeComponent implements OnInit {
  pageTitle = 'Events';

  constructor(private title: Title) { }

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

}
```

上述代码导入了 Title 服务，然后添加一个名为 pageTitle 的属性，默认值为`Events`。然后我们将 Title 服务传递给构造函数，在`ngOnInit()`生命周期方法中，我们将使用`Title. settitle()`方法将文档标题更改为本地`pageTitle`的值。通过将这个标题存储在属性中，我们还可以在组件的模板中使用它来设置标题:

```html
<!-- src/app/pages/home/home.component.html -->
<h1 class="text-center">{{ pageTitle }}</h1>
```

文档标题和标题现在应该显示在浏览器中。我们已经有了路由和 home 组件，接下来我们可以开始 Angular 应用的全局布局了。

### Angular: 布局和全局组件
