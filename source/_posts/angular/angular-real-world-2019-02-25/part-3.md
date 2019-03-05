---
title: 'Angular 实战系列 - Part 3: 抓取和展示数据'
abbrlink: 65062
categories:
  - Angular
  - Angular实战系列
tags:
  - Angular实战
date: 2019-01-08 18:55:57
updated: 2019-03-04 16:17:14
license: nd
---

在本系列的[第 2 部分](/posts/64307)我们已经介绍身份认证，授权，功能规划以及数据建模。

接下来本系列的第 3 部分将介绍如何通过 Node API 从 MongoDB 检索数据以及通过 Angular 在前段显示和过滤数据:

1. [API:获取 Events 数据][1]
   <!--more-->
1. [Angular:获取 Events 数据][2]
1. [Angular: 创建 Utility 服务][3]
1. [Angular: 创建过滤/排序服务][4]
1. [Angular: 首页活动事件列表][5]

[1]: #API-获取-Events-数据
[2]: #Angular-获取-Events-数据
[3]: #Angular-创建-Utility-服务
[4]: #Angular-创建过滤-排序服务
[5]: #Angular-首页活动事件列表

---

### API:获取 Events 数据

让我们继续上次的内容。我们的数据库中已经有数据，所以现在是用 API 检索数据的时候了。我们将从编写四个 API 开始，它们将分别从 MongoDB 获取如下数据:

- 将要发生的公开活动列表
- 包含所有活动的列表(需要 admin 权限)
- 活动详情(需要身份认证)
- 活动的回复列表(需要身份认证)

打开`server/api.js`, 让我们开始吧！

#### GET Future Public Events

获取未来的公开的活动列表数据：

```js api/events
// server/api.js
...
/*
 |--------------------------------------
 | API Routes
 |--------------------------------------
 */

 const _eventListProjection = 'title startDatetime endDatetime viewPublic';

  // GET list of public events starting in the future
  app.get('/api/events', (req, res) => {
    Event.find({viewPublic: true, startDatetime: { $gte: new Date() }}, _eventListProjection, (err, events) => {
      let eventsArr = [];
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (events) {
        events.forEach(event => {
          eventsArr.push(event);
        });
      }
      res.send(eventsArr);
    });
  });

  ...
```

#### GET All Public and Private Events

获取所有的活动列表(包含过去和将来的公开或私密活动)：

```js api/events/admin
// server/api.js
  ...
  // GET list of all events, public and private (admin only)
  app.get('/api/events/admin', jwtCheck, adminCheck, (req, res) => {
    Event.find({}, _eventListProjection, (err, events) => {
      let eventsArr = [];
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (events) {
        events.forEach(event => {
          eventsArr.push(event);
        });
      }
      res.send(eventsArr);
    });
  });

  ...
```

注意，这里添加了`jwtCheck`和`adminCheck`中间件对请求进行身份校验。只有管理员才能通过列表和所有活动进行交互，虽然普通用户也可以并只限于通过直接链接查看私密活动信息!(简单起见，本系列不会继续深入细化数据权限校验，不过你可以自己研究研究，这并不是什么难事)

#### GET Event Details

获取特定活动信息:

```js api/event/:id
// server/api.js
  ...
  // GET event by event ID
  app.get('/api/event/:id', jwtCheck, (req, res) => {
    Event.findById(req.params.id, (err, event) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (!event) {
        return res.status(400).send({message: 'Event not found.'});
      }
      res.send(event);
    });
  });

  ...
```

#### GET RSVPs for an Event

获取特定活动的回复信息：

```js api/event/:eventId/rsvps
// server/api.js
  ...
  // GET RSVPs by event ID
  app.get('/api/event/:eventId/rsvps', jwtCheck, (req, res) => {
    Rsvp.find({eventId: req.params.eventId}, (err, rsvps) => {
      let rsvpsArr = [];
      if (err) {
        return res.status(500).send({message: err.message});
      }
      if (rsvps) {
        rsvps.forEach(rsvp => {
          rsvpsArr.push(rsvp);
        });
      }
      res.send(rsvpsArr);
    });
  });

  ...
```

### Angular:获取 Events 数据

Node API 已经就绪了，我们只需在 Angular 中请求它们然后显示返回的数据就可以啦。

#### 添加 HttpClientModule 模块

首先我们需要在根模块导入`HttpClientModule`,因为我们需要通过 HTTP(s)服务调用后台 API:

```ts
...
import { HttpClientModule } from '@angular/common/http';
...
@NgModule({
  ...
  imports: [
    ...,
    HttpClientModule
  ],
  ...
})
...
```

#### 创建 API 服务

现在我们将创建一个 API 服务专注于从 Node API 返回特定的数据。通过 CLI 在`src/app/core`文件夹生成`api.service.ts`:

```ts api.service.ts
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError as ObservableThrowError } from 'rxjs';
import { catchError, retryWhen } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { ENV } from './env.config';
import { EventModel } from './models/event.model';
import { RsvpModel } from './models/rsvp.model';

@Injectable()
export class ApiService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private get _authHeader(): string {
    return `Bearer ${this.auth.accessToken}`;
  }
  private get _setAuthHeader(): any {
    return {
      headers: new HttpHeaders().set('Authorization', this._authHeader)
    };
  }

  private _handleError(err: HttpErrorResponse | any): Observable<any> {
    const errorMsg = err.message || 'Error: Unable to complete request.';
    if (err.message && err.message.indexOf('No JWT present') > -1) {
      this.auth.login();
    }
    return ObservableThrowError(errorMsg);
  }

  // GET list of public , future events
  getEvent$(): Observable<EventModel[]> {
    return this.http
      .get<EventModel[]>(`${ENV.BASE_API}events`)
      .pipe(catchError(error => this._handleError(error)));
  }

  // GET all event - private and public (admin only)
  getAdminEvent$(): Observable<Array<EventModel>> {
    return this.http
      .get<Array<EventModel>>(
        `${ENV.BASE_API}events/admin`,
        this._setAuthHeader
      )
      .pipe(catchError(error => this._handleError(error)));
  }

  // GET event by id (login required)
  getEventById$(id: string): Observable<EventModel> {
    return this.http
      .get<EventModel>(`${ENV.BASE_API}event/${id}`, this._setAuthHeader)
      .pipe(catchError(error => this._handleError(error)));
  }

  // GET RSVPs by event ID (login required)
  getRsvpsByEventId$(eventId: string): Observable<RsvpModel[]> {
    return this.http
      .get<Array<RsvpModel>>(
        `${ENV.BASE_API}event/${eventId}/rsvps`,
        this._setAuthHeader
      )
      .pipe(catchError(error => this._handleError(error)));
  }
```

我们会发出未经身份验证和身份验证的请求，因此我们将导入`HttpClient`和`HttpHeaders`(以添加带有访问令牌的授权头部)以及`HttpErrorResponse`。如果在尝试发出经过身份验证的请求时没有发现 JWT，我们还需要`AuthService`来提示登录。

我们将使用 API 调用创建流，因此我们将从 RxJS 导入`Observable`和`ObservableThrowError`以及可链式调用的 `catchError`操作符。我们需要环境配置中的 ENV 来获得适当的 API uri。最后，为了声明事件流的类型，我们需要前面创建的模型(`EventModel`和`RsvpModel`)。

为了发出经过身份验证的请求，我们需要使用存储在本地存储中的访问令牌设置一个授权头，这个访问令牌来自我们在第 2 部分中创建的[身份认证服务](/posts/64307/#Angular-身份验证)。我们将创建一个名为`_authHeader` 的访问器方法，使用当前存储的访问令牌返回必要的授权值。如果在会话期间以静默方式更新身份验证(稍后我们将实现静默的令牌更新)，则令牌可能会更改，因此我们将在每个请求时从服务中获取它，以确保其有效性。

最后，我们需要处理 API 错误信息。成功调用则将返回响应作为主体(在我们的示例中，返回 JSON)。如果调用失败，则检查错误消息，并在必要时提示重新登录，取消可观察对象，并在发生其他错误时生成错误提示。

#### API 服务注入

为了使 API 服务能在整个应用中使用，需要在根模块注入依赖：

```ts
// src/app/app.module.ts
...
import { ApiService } from './core/api.service';
...
@NgModule({
  ...
  providers: [
    ...,
    ApiService
  ],
  ...
})
...
```

#### 创建加载组件

由于我们将进行异步 API 调用，所以最好也有一个加载状态。或者，我们可以使用[route resolve](https://angular.io/api/router/Resolve)来防止在返回必要的 API 数据之前加载路由，但这可能会让应用程序在导航时显得迟缓。相反，我们可以显示一个带有非常简单的组件的加载图标:

```sh
$ ng g component core/loading --is --it --flat
```

现在需要一个合适的加载图标，你可以从[loading.io](https://loading.io/)选择你喜欢的。然后将它放在`src/assets/images`。接着编辑我们的`loading.component.ts`:

```ts
// src/app/core/loading.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
    <img src="/assets/images/loading.svg" />
  `,
  styles: [
    `
      :host {
        display: block;
      }
      img {
        display: block;
        margin: 20px auto;
        width: 50px;
      }
    `
  ]
})
export class LoadingComponent {}
```

我们的加载组件就完成了，简单吧！让我们试着把回调组件的`Loading...`字样替换成我们的加载组件：

```html
<!-- src/app/pages/callback/callback.component.html -->
<app-loading></app-loading>
```

你会发现，当成功登陆跳转时，将会显示我们的加载图标。

### Angular: 创建 Utility 服务

在开始构建组件之前，让我们先创建一个可以在整个开发过程中利用的的实用程序服务。

```sh
$ ng g service core/utils
```

```ts Utils
// src/app/core/utils.service.ts
import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable()
export class UtilsService {
  constructor(private datePipe: DatePipe) {}

  isLoaded(loading: boolean): boolean {
    return loading === false;
  }

  eventDates(start, end): string {
    // Display single-day events as "Jan 7, 2018"
    // Display multi-day events as "Aug 12, 2017 - Aug 13, 2017"
    const startDate = this.datePipe.transform(start, 'mediumDate');
    const endDate = this.datePipe.transform(end, 'mediumDate');

    if (startDate === endDate) {
      return startDate;
    } else {
      return `${startDate} - ${endDate}`;
    }
  }

  eventDatesTimes(start, end): string {
    // Display single-day events as "1/7/2018, 5:30 PM - 7:30 PM"
    // Display multi-day events as "8/12/2017, 8:00 PM - 8/13/2017, 10:00 AM"
    const _shortDate = 'M/d/yyyy';
    const startDate = this.datePipe.transform(start, _shortDate);
    const startTime = this.datePipe.transform(start, 'shortTime');
    const endDate = this.datePipe.transform(end, _shortDate);
    const endTime = this.datePipe.transform(end, 'shortTime');

    if (startDate === endDate) {
      return `${startDate}, ${startTime} - ${endTime}`;
    } else {
      return `${startDate}, ${startTime} - ${endDate}, ${endTime}`;
    }
  }

  eventPast(eventEnd): boolean {
    // Check if event has already ended
    const now = new Date();
    const then = new Date(eventEnd.toString());
    return now >= then;
  }
}
```

这里我们使用了 Angular 内置的`DatePipe`,所以我们需要导入它，并且在根模块里注入依赖。

`isLoaded()`用于检查传入值是否严格等于`false`,我们打算在每个组件里添加一个`loading`属性用于同步 API 调用的的状态，因为`loading`值可能会为`undefined`，所以通过这个公用方法可以防止显示错误的 UI。

然后`eventDates()`和`eventDatesTimes()`用于转换时间的显示格式。而`eventPast()`用于检查是否是过去的时间，从而告诉我们活动已经过期。

为了全局使用这个通用的服务，在根模块注入相应依赖。

```ts
// src/app/app.module.ts
...
import { DatePipe } from '@angular/common';
import { UtilsService } from './core/utils.service';
...
@NgModule({
  ...,
  providers: [
    ...,
    DatePipe,
    UtilsService
  ],
  ...
})
...
```

### Angular: 创建过滤/排序服务

对于获取的数据数组，我们需要添加一些方法来组织它们。就如同 AngularJS 里面的内置过滤器，比如`filter`和`orderBy`。虽然 Angular 使用[pipes](https://angular.io/guide/pipes)来转换数据，但是并不提供用于过滤或排序的开箱即用管道。([原因](https://angular.io/guide/pipes#appendix-no-filterpipe-or-orderbypipe))

出于性能和影响最小化的考虑，我们将不创建自定义管道来实现筛选或排序功能。这只会重新引入 Angular 团队试图通过删除这些过滤器来解决的问题。相反，正确的方法是使用服务。

我们将会添加几个全局通用的服务方法用于搜索，过滤和排序: `$ ng g service core/filter-sort`

打开`src/app/core/filter-sort.service.ts`:

```ts filter-sort
import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable()
export class FilterSortService {
  constructor(private datePipe: DatePipe) {}

  private _objArrayCheck(array: any[]): boolean {
    // Checks if the first item in the array is an object
    // (assumes same-shape for all array items)
    // Necessary because some arrays passed in may have
    // models that don't match {[key: string]: any}[]
    // This check prevents uncaught reference errors
    const item0 = array[0];
    const check = !!(
      array.length &&
      item0 !== null &&
      Object.prototype.toString.call(item0) === '[object Object]'
    );
    return check;
  }

  search(
    array: any[],
    query: string,
    excludeProps?: string | string[],
    dateFormat?: string
  ) {
    // Match query to strings and Date objects / ISO UTC strings
    // Optionally exclude properties from being searched
    // If matching dates, can optionally pass in date format string
    if (!query || !this._objArrayCheck(array)) {
      return array;
    }
    const lQuery = query.toLowerCase();
    const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/; // ISO UTC
    const dateF = dateFormat ? dateFormat : 'medium';
    const filteredArray = array.filter(item => {
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          if (!excludeProps || excludeProps.indexOf(key) === -1) {
            const thisVal = item[key];
            if (
              // Value is a string and NOT a UTC date
              typeof thisVal === 'string' &&
              !thisVal.match(isoDateRegex) &&
              thisVal.toLowerCase().indexOf(lQuery) !== -1
            ) {
              return true;
            } else if (
              // Value is a Date object or UTC string
              (thisVal instanceof Date ||
                thisVal.toString().match(isoDateRegex)) &&
              // https://angular.io/api/common/DatePipe
              // Matching date format string passed in as param (or default to 'medium')
              this.datePipe
                .transform(thisVal, dateF)
                .toLowerCase()
                .indexOf(lQuery) !== -1
            ) {
              return true;
            }
          }
        }
      }
    });
    return filteredArray;
  }

  noSearchResults(arr: any[], query: string): boolean {
    // Check if array searched by query returned any results
    return !!(!arr.length && query);
  }

  orderByDate(array: any[], prop: string, reverse?: boolean) {
    // Order an array of objects by a date property
    // Default: ascending (1992->2017 | Jan->Dec)
    if (!prop || !this._objArrayCheck(array)) {
      return array;
    }
    const sortedArray = array.sort((a, b) => {
      const dateA = new Date(a[prop]).getTime();
      const dateB = new Date(b[prop]).getTime();
      return !reverse ? dateA - dateB : dateB - dateA;
    });
    return sortedArray;
  }
}
```

`_objArrayCheck()`方法，用于确保我们尝试搜索或排序的数组包含对象。如果没有，就会产生未捕获的引用错误，因此我们希望有一种方法来防止这种情况。

`search()`方法接受要筛选的对象数组、要搜索的查询、要从搜索中排除的任何可选属性(单个属性字符串或属性数组)，以及可选的日期格式字符串。`dateFormat`应该是`Angular DatePipe`中的一种格式。这允许用户搜索原始数据中可读性差得多的日期。开发可以确定他们想要查询的格式。例如，如果转换 UTC 日期字符串或 JavaScript 日期对象，用户可以查询 Jan 并接收数据中实际值为 2017-01-07T15:00:00.000Z 的结果。

如果查询是`falsey`，我们将返回未经过滤的数组。否则，我们将把查询设置为小写，因为我们的搜索应该不区分大小写(我们将对查询的值执行相同的操作)。由于 UTC 日期在 JavaScript 中被识别为字符串而不是日期，因此我们将使用正则表达式将其与其他字符串区分开来。如果没有传递`dateFormat`参数，我们将默认为`medium`(例如，2010 年 9 月 3 日，12:05:08 PM)。

接下来，我们将使用数组方法`filter()`对数组进行筛选。我们将遍历数组中每个对象中的每个属性，首先确保对象包含`hasOwnProperty()`方法中的属性。如果键不匹配`excludeProps`中传递的任何内容，将检查与`query`匹配的值.

这对于不同的值类型是不同的。搜索处理字符串、JavaScript 日期对象和 UTC 字符串。如果我们想确保搜索不查询某些属性，我们将确保在调用组件中的方法时将它们作为`excludedProps`传入。

`noSearchResults()`方法只接受一个数组和一个查询，如果该数组为空且有查询，则返回 true。

`orderByDate()`方法接受一个对象数组、包含要排序的日期值的属性和一个可选的反向参数，以将排序顺序从升序更改为降序。如果没有传递属性，则返回未排序的数组。

在根模块注入依赖：

```ts
// src/app/app.module.ts
...
import { FilterSortService } from './core/filter-sort.service';
...
@NgModule({
  ...,
  providers: [
    ...,
    FilterSortService
  ],
  ...
})
...
```

现在我们可以在组件中根据日期搜索和排序活动事件列表。

### Angular: 首页活动事件列表

组件应该获取和显示事件列表。我们已经创建了 Node API 来返回该数据，并实现了 API 服务来获取它。现在我们需要在组件里订阅这些数据并显示在页面。

为了使用[`ngModel`](https://angular.io/api/forms/NgModel)指令，我们需要在根模块导入`FormsModule`:

```ts
// src/app/app.module.ts
...
import { FormsModule } from '@angular/forms';
...
@NgModule({
  ...,
  imports: [
    ...,
    FormsModule
  ],
  ...
})
...
```

接着，更新我们的主页组件，让它可以显示公开的活动信息。

```ts
// src/app/pages/home/home.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiService } from './../../core/api.service';
import { UtilsService } from './../../core/utils.service';
import { FilterSortService } from './../../core/filter-sort.service';
import { Subscription } from 'rxjs';
import { EventModel } from './../../core/models/event.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  pageTitle = 'Events';
  eventListSub: Subscription;
  eventList: EventModel[];
  filteredEvents: EventModel[];
  loading: boolean;
  error: boolean;
  query: '';

  constructor(
    private title: Title,
    public utils: UtilsService,
    private api: ApiService,
    public fs: FilterSortService
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
    this._getEventList();
  }

  private _getEventList() {
    this.loading = true;
    // Get future, public events
    this.eventListSub = this.api.getEvents$().subscribe(
      res => {
        this.eventList = res;
        this.filteredEvents = res;
        this.loading = false;
      },
      err => {
        console.error(err);
        this.loading = false;
        this.error = true;
      }
    );
  }

  searchEvents() {
    this.filteredEvents = this.fs.search(
      this.eventList,
      this.query,
      '_id',
      'mediumDate'
    );
  }

  resetQuery() {
    this.query = '';
    this.filteredEvents = this.eventList;
  }

  ngOnDestroy() {
    this.eventListSub.unsubscribe();
  }
}
```

```html
<!-- src/app/pages/home/home.component.html -->
<h1 class="text-center">{{ pageTitle }}</h1>
<app-loading *ngIf="loading"></app-loading>

<ng-template [ngIf]="utils.isLoaded(loading)">
  <ng-template [ngIf]="eventList">
    <ng-template [ngIf]="eventList.length">
      <!-- Search events -->
      <label class="sr-only" for="search">Search</label>
      <div class="search input-group mb-3">
        <div class="input-group-prepend">
          <div class="input-group-text">Search</div>
        </div>
        <input
          id="search"
          type="text"
          class="form-control"
          [(ngModel)]="query"
          (keyup)="searchEvents()"
        />
        <span class="input-group-append">
          <button
            class="btn btn-danger"
            (click)="resetQuery()"
            [disabled]="!query"
          >
            &times;
          </button>
        </span>
      </div>

      <!-- No search results -->
      <p
        *ngIf="fs.noSearchResults(filteredEvents, query)"
        class="alert alert-warning"
      >
        No events found for <em class="text-danger">{{ query }}</em>, sorry!
      </p>

      <!-- Events listing -->
      <section class="list-group">
        <a
          *ngFor="let event of fs.orderByDate(filteredEvents, 'startDatetime')"
          [routerLink]="['/event', event._id]"
          class="list-group-item list-group-item-action flex-column align-items-start"
        >
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1" [innerHTML]="event.title"></h5>
            <small
              >{{ utils.eventDates(event.startDatetime, event.endDatetime)
              }}</small
            >
          </div>
        </a>
      </section>
    </ng-template>

    <!-- No upcoming public events available -->
    <p *ngIf="!eventList.length" class="alert alert-info">
      No upcoming public events available.
    </p>
  </ng-template>

  <!-- Error loading events -->
  <p *ngIf="error" class="alert alert-danger">
    <strong>Oops!</strong> There was an error retrieving event data.
  </p>
</ng-template>
```

### 小结

我们已经介绍了如何使用 Node API 从数据库中获取数据，以及如何在 Angular 中操作和显示数据。在本系列教程的[下一部分](/posts/48469)中，我们将处理访问管理、显示管理事件列表以及开发带有选项卡子组件的事件详细信息页面。

> _**系列索引**_
>
> - [Angular 实战系列 - Part 1: MEAN 配置 & Angular 架构][91]
> - [Angular 实战系列 - Part 2: 身份验证和数据建模][92]
> - [~~Angular 实战系列 - Part 3: 抓取和展示数据~~`(你现在在这里)`][93]
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
