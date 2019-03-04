---
title: 'Angular 实战系列 - Part 2: 身份验证和数据建模'
abbrlink: 64307
categories:
  - Angular
  - Angular实战系列
tags:
  - Angular实战
date: 2019-01-04 14:55:57
updated: 2019-02-26 17:26:03
license: nd
---

在本系列的[第 1 部分](/posts/30078)我们已经介绍了如何配置云托管的 MongoDB, Node 服务器，还有 Angular 前端项目。

接下来本系列的第 2 部分将介绍身份验证、授权、功能模块规划和数据建模:

1. [Angular:身份验证][1]
1. [角色授权][2]
   <!--more-->
1. [规划功能模块][3]
1. [数据建模][4]

[1]: #Angular-身份验证
[2]: #角色授权
[3]: #规划功能模块
[4]: #数据建模

### Angular:身份验证

继续第 1 部分的内容，现在添加身份验证模块，它包含：

- 登录和注销
- 用户信息和令牌管理
- 会话持久性
- 使用访问令牌对 HTTP 请求进行授权

#### 安装 Auth0.js

首先安装 Auth0 依赖，用于和之前注册的 Auth0 账号进行交互：

```sh
$ npm install auth0-js@latest --save
```

#### 动态环境配置

创建一个文件来存储关于应用程序环境的信息。我们目前在`localhost:4200`上进行开发，但是最终将部署在节点服务器上，在生产环境中，它会运行在反向代理上。我们需要确保开发环境不会破坏生产环境，反之亦然。

创建`src/app/core`文件夹，然后添加一个名为`env.config.ts`的文件:

```typescript
// src/app/core/env.config.ts
const _isDev = window.location.port.indexOf('4200') > -1;
const getHost = () => {
  const protocol = window.location.protocol;
  const host = window.location.host;
  return `${protocol}//${host}`;
};
const apiURI = _isDev ? 'http://localhost:8083/api/' : `/api/`;

export const ENV = {
  BASE_URI: getHost(),
  BASE_API: apiURI
};
```

上述代码检测主机环境并设置应用程序的基础 URI 和基础 API URI。在需要检测和使用这些 uri 的地方，可以引入`ENV`变量。

{%note info%}
另一种方法是配置`environments/environment.*.ts`。。
{% endnote%}

#### 安全认证设定

创建`src/app/auth/auth.config.ts`文件用于存储 Auth0 认证相关的配置信息：

```ts
// src/app/auth/auth.config.ts
import { ENV } from './../core/env.config';

interface AuthConfig {
  CLIENT_ID: string;
  CLIENT_DOMAIN: string;
  AUDIENCE: string;
  REDIRECT: string;
  SCOPE: string;
}

export const AUTH_CONFIG: AuthConfig = {
  CLIENT_ID: '[AUTH0_CLIENT_ID]',
  CLIENT_DOMAIN: '[AUTH0_CLIENT_DOMAIN]', // e.g., you.auth0.com
  AUDIENCE: '[YOUR_AUTH0_API_AUDIENCE]', // e.g., http://localhost:8083/api/
  REDIRECT: `${ENV.BASE_URI}/callback`,
  SCOPE: 'openid profile'
};
```

这些配置信息可以在你的 Auth0 账号里找到。

#### 身份认证服务

`AuthService`将会负责前端的身份验证逻辑,用 CLI 为生成模板：

```
$ ng g service auth/auth --spec false
```

打开该文件并添加：

```ts auth.service
// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AUTH_CONFIG } from './auth.config';
import * as auth0 from 'auth0-js';

@Injectable()
export class AuthService {
  // Create Auth0 web auth instance
  private _auth0 = new auth0.WebAuth({
    clientID: AUTH_CONFIG.CLIENT_ID,
    domain: AUTH_CONFIG.CLIENT_DOMAIN,
    responseType: 'token',
    redirectUri: AUTH_CONFIG.REDIRECT,
    audience: AUTH_CONFIG.AUDIENCE,
    scope: AUTH_CONFIG.SCOPE
  });
  accessToken: string;
  userProfile: any;
  expiresAt: number;
  // Create a stream of logged in status to communicate throughout app
  loggedIn: boolean;
  loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);
  loggingIn: boolean;

  constructor(private router: Router) {
    // If app auth token is not expired, request new token
    if (JSON.parse(localStorage.getItem('expires_at')) > Date.now()) {
      this.renewToken();
    }
  }

  setLoggedIn(value: boolean) {
    // Update login status subject
    this.loggedIn$.next(value);
    this.loggedIn = value;
  }

  login() {
    // Auth0 authorize request
    this._auth0.authorize();
  }

  handleAuth() {
    // When Auth0 hash parsed, get profile
    this._auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken) {
        window.location.hash = '';
        this._getProfile(authResult);
      } else if (err) {
        console.error(`Error authenticating: ${err.error}`);
      }
      this.router.navigate(['/']);
    });
  }

  private _getProfile(authResult) {
    this.loggingIn = true;
    // Use access token to retrieve user's profile and set session
    this._auth0.client.userInfo(authResult.accessToken, (err, profile) => {
      if (profile) {
        this._setSession(authResult, profile);
      } else if (err) {
        console.warn(`Error retrieving profile: ${err.error}`);
      }
    });
  }

  private _setSession(authResult, profile?) {
    this.expiresAt = authResult.expiresIn * 1000 + Date.now();
    // Store expiration in local storage to access in constructor
    localStorage.setItem('expires_at', JSON.stringify(this.expiresAt));
    this.accessToken = authResult.accessToken;
    this.userProfile = profile;
    // Update login status in loggedIn$ stream
    this.setLoggedIn(true);
    this.loggingIn = false;
  }

  private _clearExpiration() {
    // Remove token expiration from localStorage
    localStorage.removeItem('expires_at');
  }

  logout() {
    // Remove data from localStorage
    this._clearExpiration();
    // End Auth0 authentication session
    this._auth0.logout({
      clientId: AUTH_CONFIG.CLIENT_ID,
      returnTo: ENV.BASE_URI
    });
  }

  get tokenValid(): boolean {
    // Check if current time is past access token's expiration
    return Date.now() < JSON.parse(localStorage.getItem('expires_at'));
  }

  renewToken() {
    // Check for valid Auth0 session
    this._auth0.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken) {
        this._getProfile(authResult);
      } else {
        this._clearExpiration();
      }
    });
  }
}
```

上面代码使用`auth.config`里的配置实例化了一个`WebAuth`对象，并且提供了一个 RxJS 的`BehaviorSubject`身份验证状态事件流，使得我们可以在整个应用中订阅它。

构造函数在初始化时检查应用程序身份验证状态：如果用户没有从之前的会话中退出 Angular 应用程序(令牌还没有过期)，将会调用`renewToken()`的方法来验证他们在身份验证服务器上的 Auth0 会话是否仍然有效。如果是，我们会接收一个新的访问令牌。

`login()`方法使用`WebAuth`发起授权身份验证请求。Auth0 登录授权页面会显示给用户，然后用户可以进行登录。

当用户成功验证，应用的回调页面会接收到一个`access_token`和令牌过期时间(`expiresIn`)。`handleAuth()`方法使用 Auth0 的`parseHash()`回调方法来获取用户的概要文件(`_getProfile()`)，并且通过本地存储保存令牌,过期时间,概要文件设置会话信息(`_setSession()`)，同时调用`setLoggedIn()`同步用户验证状态,以便应用程序中的任何组件知道用户已经登陆了。

接着，我们创建了一些通用方法（`_clearExpiration`），用于从本地存储中轻松清除过期信息。

`logout()`方法清除本地存储的过期信息，并通过 Auth0 的 API 注销当前会话，并且重定向到我们指定的页面（受页）。

`tokenValid()`访问器，用于检查当前日期时间是否小于令牌过期日期时间。

最后，我们将实现`renewToken()`方法，如果用户的身份验证会话仍然处于活动状态，则使用 Auth0 `checkSession()`方法从 Auth0 请求一个新的访问令牌。如果没有会话活动，我们将不做任何事情。我们不希望在这里产生任何错误或日志，因为没有会话并不意味着出了什么问题。

#### AuthService 全局实例

我们需要全局注册 AuthService 的单一实例，因此将在`app.module.ts`里注入依赖:

```ts app.module
// src/app/app.module.ts
...
import { AuthService } from './auth/auth.service';
...
@NgModule({
  ...
  providers: [
    ...,
    AuthService
  ],
  ...
})
...

```

#### 回调组件

接下来，我们将创建一个回调组件。通过验证后应用程序会被重定向到此。这个组件负责接收处理身份验证信息，然后显示一条加载消息，直到散列解析完成，Angular 应用程序重定向回主页。

{%note info%}
还记得我们之前已经将`http://localhost:4200/callback`和`http://localhost:8083/callback`添加到 Auth0 允许的客户端回调地址。
{%endnote%}

```sh
$ ng g component pages/callback
```

`AuthService`服务的`handleAuth()`方法必须在该组件的构造方法里调用，以便在应用初始化时运行。

```html
<!-- src/app/pages/callback/callback.component.html -->
<div>
  Loading...
</div>
```

然后添加回调路由：

```ts
// src/app/app-routing.module.ts
...
import { CallbackComponent } from './pages/callback/callback.component';

const routes: Routes = [
  ...
  {
    path: 'callback',
    component: CallbackComponent
  }
];
...
```

#### 在 HeaderComponent 添加登陆和注销

在 Header 组件里添加 AuthService 服务：

```ts
// src/app/header/header.component.ts
...
import { AuthService } from './../auth/auth.service';
...
export class HeaderComponent implements OnInit {
  ...
  constructor(
    ...,
    public auth: AuthService) { }
  ...
}
```

在组件模板里添加相应元素：

```html
<!-- src/app/header/header.component.html -->
<header id="header" class="header">
  <div class="header-page bg-primary">
    ...
    <div class="header-page-authStatus">
      <span *ngIf="auth.loggingIn">Logging in...</span>
      <ng-template [ngIf]="!auth.loggingIn">
        <a *ngIf="!auth.loggedIn" (click)="auth.login()">Log In</a>
        <span *ngIf="auth.loggedIn && auth.userProfile">
          {{ auth.userProfile.name }}
          <span class="divider">|</span>
          <a (click)="auth.logout()">Log Out</a>
        </span>
      </ng-template>
    </div>
    ...
  </div>
</header>
```

相应样式这里就不占用篇幅了，具体请参照源码。

我们现在可以登录我们的应用程序了! 通过单击“登录”链接并进行身份验证。登录之后，可以在 Header 的右上角看到名字和退出链接。

你可以试着关闭浏览器并重新打开它，你会发现登录状态是持久的(除非令牌已经过期，或者你点击了注销)

### 角色授权

对于我们的应用来说，只有是`admin`的用户才可以创建，更新和删除活动信息，其他普通用户只能回复活动。为了实现这些，我们需要给用户分配角色在 Node.js 的 API 和 Angular 应用里完成相应的逻辑代码。

首先来看看大概的步骤：

1. 使用 Auth0 规则创建我们的用户角色，然后将它们添加到 ID(客户端用户信息)和 access (API)令牌。
1. 实现 Node.js API 中间件以保证只有`admin`角色的用户可以访问相应 API。
1. Angular 中利用用户角色信息对路由和功能模块进行保护。

快上车！

#### 使用 Auth0 规则进行管理授权

所谓`Rules`是 Auth0 提供的一个拓展，它实际上是一个 Javascript 方法，每次进行用户身份认证的时候都会执行。

进入我们的[Auth0](https://manage.auth0.com/dashboard/us/suchenrain/rules/new)并选择创建一条`Set roles to a user`模板的 rule:

```JS Assign Admin to specified user
// set me as 'admin' role, and all others to 'user'
// save app_metadata to ID and tokens
function (user, context, callback) {

  // Roles should only be set to verified users.
  if (!user.email || !user.email_verified) {
    return callback(new UnauthorizedError('Please verify your email before logging in.'));
  }

  user.app_metadata = user.app_metadata || {};
  // You can add a Role based on what you want
  // In this case I check domain
  const addRolesToUser = function(user,cb) {
    if(user.email && user.email === '[MY_REGISTERED_ACCOUNT_EMAIL]'){
      cb(null,['admin']);
    }else{
      cb(null,['user']);
    }
  };

  addRolesToUser(user,function(err,roles){
    if(err){
      callback(err);
    }else{
      user.app_metadata.roles =roles;
      auth0.users.updateAppMetadata(user.user_id,user.app_metadata)
        .then(function(){
          // add metadata to both ID token and access token
          var namespace = 'http://yourapp.com/roles';
          var userRoles = user.app_metadata.roles;
          context.idToken[namespace] = userRoles;
          context.accessToken[namespace] = userRoles;
          callback(null,user,context);
        })
        .catch(function(err){
          callback(err);
      });
    }
  });
}
```

简单起见，我们只给自己的账号分配`admin`角色，其他账号都是普通`user`。

{%note warning%}
注意，上面代码还检查确保用户邮件必须是已经通过验证了。
{%endnote%}

`namespace`标识符可以是任何非 auth0 的 HTTP 或 HTTPS URL，并且不必指向实际的资源。Auth0 执行 OIDC 关于附加声明的建议，并且会静默排除任何没有名称空间的声明。[[了解更多]](https://auth0.com/docs/scopes/current#custom-claims)

现在，你可以在我们的 RSVP 程序进行登陆，登陆成功后，可以在[Auth0 的用户](https://manage.auth0.com/dashboard/us/suchenrain/users)查看用户的`Metadata`,你应该看到`app_metadata`大概如下：

```json
{
  "roles": ["admin"]
}
```

在客户端接收的 ID 和访问令牌, 会附带如下的键值对:

```
"http://myapp.com/roles": ["admin"]
```

#### Node API 管理员中间件

现在我们的 Auth0 身份验证已经可以提供角色支持，接下来利用它来保护需要管理员访问的 API 路由。

打开`config.js`并添加我们在上面设置的`namespace`:

```js
// server/config.js
module.exports = {
  ...,
  NAMESPACE: 'http://yourapp.com/roles'
};
```

添加中间件代码来确认用户是否经过身份验证，以及是否具有访问 API 的管理员权限。

```js
// server/api.js
...
module.exports = function(app, config) {
  // Authentication middleware
  const jwtCheck = jwt({
    ...
  });

  // Check for an authenticated admin user
  const adminCheck = (req, res, next) => {
    const roles = req.user[config.NAMESPACE] || [];
    if (roles.indexOf('admin') > -1) {
      next();
    } else {
      res.status(401).send({message: 'Not authorized for admin access'});
    }
  }

...
```

`express-jwt`包默认将解码后的令牌添加到`req.user`。`adminCheck`中间件查找这个属性，并在数组中查找 admin 的值。如果找到，则继续请求。如果没有，则返回 401 未授权状态，并显示一条简短的错误消息。

#### Angular 应用中的管理员授权

同样，我们需要在前端添加相应的管理员授权检测代码，我们需要修改`AuthService`服务。

首先，添加同样的`namespace`:

```ts
// src/app/auth/auth.config.ts
...
interface AuthConfig {
  ...,
  NAMESPACE: string;
};

export const AUTH_CONFIG: AuthConfig = {
  ...,
  NAMESPACE: 'http://yourapp.com/roles'
};
```

接着在`auth.service.ts`检查和保存管理员授权信息：

```ts 
// src/app/auth/auth.service.ts
...
export class AuthService {
  ...
  isAdmin: boolean;

  ...

  private _setSession(authResult, profile) {
    ...
    // If initial login, set profile and admin information
    if (profile) {
      ...
      this.isAdmin = this._checkAdmin(profile);
    }
    // Update login status in loggedIn$ stream
    ...
  }

  private _checkAdmin(profile) {
    // Check if the user has admin role
    const roles = profile[AUTH_CONFIG.NAMESPACE] || [];
    return roles.indexOf('admin') > -1;
  }

  ...
```

首先我们添加了一个属性：`isAdmin: boolean`，用来标识用户的管理员状态。另外，我们更新了`_setSession`方法，在用户通过验证后，检查了用户的角色信息并同步`isAdmin`。

至此，在后端 Node API 路由和 Angular 应用中都已经实现了权限校验。

### 规划功能模块

数据库、Angular 应用程序、身份验证和 Node API 基本结构已经搭建好了。现在是时候进行功能规划和数据建模了。在直接编写 API 和业务逻辑之前，规划应用程序的数据结构非常重要。

让我们从更高层次的角度思考一下 RSVP 应用程序的预期功能，然后我们将推断数据库模型应该是什么样子的。

#### 活动事件

- 在首页显示可参加的公开活动事件列表，并且可以进行搜索。这些活动必须发生在将来，而不是已经过期的。
- 管理员可以看到所有活动事件的列表，包括公开/私有/过去/将来的活动。
- 活动详情页面，已登陆用户可以回复参与活动，并且可以查看别人的回复。
- 活动只能被管理员创建更新和删除。
- 删除一个活动会同时清除所有相关联的回复。
- 公开的活动可以显示在首页，但是私有的活动也可以直接通过链接访问。
- 活动回复和活动的 ID

**活动属性**

- 活动 ID (数据库自动生成)
- 活动标题
- 地点
- 开始日期和时间
- 结束日期和时间
- 活动描述
- 可见性(公开/私有)

#### 活动回复

- 任何已认证的用户可以参与回复将要发生的活动，不管是公开还是私有。
- 用户不可以添加和更新一个已经结束的活动。
- 用户可以修改他们现有的回复，但不能删除它们。

**回复的属性**

- 回复 ID
- 用户 ID
- 名字
- 活动 ID
- 是否出席
- 额外出席人数（如果参加）
- 评论

#### 用户

- 用户应该能够在他们的个人资料中查看所有的已回复列表
- 用户数据不存储在 MongoDB 中，由 Auth0 托管。
- 用户通过用户 ID 与他们的 RSVPs 相关联。
- 用户只能更新自己的回复。
- 管理员可以对活动进行增删改查。

### 数据建模

我们已经对应用的功能有了大致的了解，接下来需要在`服务端`和`客户端`建立必要的数据模型。

#### 创建 Mongoose Schema

通过 `mongoose` 进行 `MongoDB` 对象建模。每个 `mongoose` 模式会映射到一个 `MongoDB` 集合，并定义该集合中文档对象的原型。

在`server`下新建`models`文件夹,添加`Event.js`和`Rsvp.js`:

```js Event
// server/models/Event.js
/*
 |--------------------------------------
 | Event Model
 |--------------------------------------
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  startDatetime: { type: Date, required: true },
  endDatetime: { type: Date, required: true },
  description: String,
  viewPublic: { type: Boolean, required: true }
});

module.exports = mongoose.model('Event', eventSchema);
```

{%note info%}
MongoDB 会自动生成对象 ID。
{%endnote%}

```js Rsvp
// server/models/Rsvp.js
/*
 |--------------------------------------
 | Rsvp Model
 |--------------------------------------
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rsvpSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  eventId: { type: String, required: true },
  attending: { type: Boolean, required: true },
  guests: Number,
  comments: String
});

module.exports = mongoose.model('Rsvp', rsvpSchema);
```

在 Node API 中，我们将利用它们从 MongoDB 中

```js
// server/api.js
/*
 |--------------------------------------
 | Dependencies
 |--------------------------------------
 */
...
const Event = require('./models/Event');
const Rsvp = require('./models/Rsvp');
...
```

#### Angular 应用中的模型

同样在前端 Angular 应用里我们也需要定义 `Event` 和 `RSVP` 模型，用来接受从 Node API 检索回来的数据。通过 CLI 创建两个 `Class`:

```sh
$ ng g class core/models/event.model
$ ng g class core/models/rsvp.model

```

打开生成的文件并添加：

```ts  Event Model
// src/app/core/models/event.model.ts
export class EventModel {
  constructor(
    public title: string,
    public location: string,
    public startDatetime: Date,
    public endDatetime: Date,
    public viewPublic: boolean,
    public description?: string,
    public _id?: string
  ) {}
}
```

```ts RSVP Model
// src/app/core/models/rsvp.model.ts
export class RsvpModel {
  constructor(
    public userId: string,
    public name: string,
    public eventId: string,
    public attending: boolean,
    public guests?: number,
    public comments?: string,
    public _id?: string
  ) {}
}
```

#### 在 MongoDB 里创建和初始化 Collections

为了查询数据库，我们准备在 MongoDB 里创建必要的 collection 和一些原始数据。这一切都将通过之前提到的 MongoBooster 来完成：

##### 创建 Collection

通过 MongoBooster 连接到我们托管的 MyLab 数据库，并创建`events`和`rsvps`两个 collections.

##### 添加原始数据

打开 Mongo shell：

```sql Add Events
db.getCollection("events").insert([{
    "title": "Test Event Past",
    "location": "Home",
    "description": "This event took place in the past.",
    "startDatetime": ISODate("2018-05-05T06:00:00.000+08:00"),
    "endDatetime": ISODate("2018-05-05T08:00:00.000+08:00"),
    "viewPublic": true
},
...
])
```

```sql Add RSVP
db.getCollection("rsvps").insert([{
    "userId": "[Auth0_USER_ID]",--auth0|5c3dc9607493d4385206e45
    "eventId": "[Event_Object_ID]",--5c3ed83c22a9361ec0ac215d
    "attending": true,
    "comments": "i will attend on time.",
    "guests": 5,
    "name": "chen zhuang"
},
...
])
```

记得替换上面相应的数据，`userId`对应 Auth0 上的已认证的用户，`eventId`对应我们已经插入的原始 event 数据。

### 小结

在 Angular 实战系列的第 2 部分中，我们已经介绍了 MEAN 应用程序的身份验证和授权、功能规划和数据建模。在本系列教程的[第 3 部分](/posts/65062)中，我们将使用 Node API 从数据库中获取数据，并使用 Angular 显示数据，完成过滤和排序。

---

> _**系列索引**_
>
> - [Angular 实战系列 - Part 1: MEAN 配置 & Angular 架构][91]
> - [~~Angular 实战系列 - Part 2: 身份验证和数据建模~~`(你现在在这里)`][92]
> - [Angular 实战系列 - Part 3: 抓取和展示数据][93]
> - [Angular 实战系列 - Part 4: 访问控制，管理和详情页面][94]
> - [Angular 实战系列 - Part 5: 动画和模板驱动表单][95]
> - [Angular 实战系列 - Part 6: 响应式表单和自定义验证][96]
> - [Angular 实战系列 - Part 7: 相关数据和令牌更新][97]
> - [Angular 实战系列 - Part 8: 延迟加载，生产部署和 SSL][98]

[91]: /posts/30078
[92]: /posts/64307
[93]: /posts/65062
[94]: /posts/48469
[95]: /posts/7096
[96]: /posts/5650
[97]: /posts/32171
[98]: /posts/25434