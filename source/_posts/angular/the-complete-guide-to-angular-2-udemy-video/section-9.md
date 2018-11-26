---
title: Angular 7 (formerly Angular 2) - The Complete Guide | Part 3
author: 橙橙GG
categories:
  - Angular 2
tags:
  - angular 7
  - angular 2
  - udemy
  - the complete guide to angular 2
abbrlink: 5461
date: 2018-11-20 17:24:47
updated: 2018-11-20 17:24:56
---

## Using Services & Dependency Injection

### Service Creation

```typescript logging.service.ts
export class LoggingService {
  logStatusChange(status: string) {
    console.log('new status:' + status);
  }
}
```

<!--more-->

usage:

```typescript demo.component.ts
@Component({
    ...
})
export class DemoComponent{
    // it means demo component need a loggingService instance, and angular injector will give us
    // this instance from demo component providers / appcomponent providers / appmodule providers
    constructor(private logSvc: LoggingService){

    }
}

```

### Hierarchical Injector(service instance)

There are 3 places where we can provide a service.

- **AppModule**: Same instance of service is available `Application-wide`. in our whole app in all components in all directives in all other services.

- **AppComponent**: Same instance of Service is available for `all components`(but not for other services)

- **Any other component**: Same instance of service is available for `the component and all its child components`.

{% note info%}
The instances don't propagate up, they only `go down` that tree of components. in a lowest level it will actually even `overwrite` if we were to provide the same service on a hight level
{%endnote%}

### Injecting Services into Services

service can be injected into other service by using a specific metadata `@Injectable`. Let's say you have a `serveice A` and `target service`, if you want inject A into target then you should add the `@Injectable` to target.

### Cross-Component Communication Through Service

By using event emiter service, components could talk to each other.

```typescript logging.service.ts
export class LoggingService {
  statusChanged = new EventEmitter<string>();
}
```

```typescript component A
@Component({...})
export class AComponent{
    constructor(private logSvc: LoggingService){}

    onSetTo(){
        this.logSvc.statusChanged.emit('changed');
    }
}
```

```typescript component B
@Component({...})
export class BComponent{
    constructor(private logSvc: LoggingService){
        this.logSvc.statusChanged.subscribe((status: string)=>{
            alert('New status'+ status);
        })
    }

    onSetTo(status: string){
        this.logSvc.statusChanged.emit(status);
    }
}
```

### Application-Wide services in Angular 6+

If you're using Angular 6+ (check your `package.json` to find out), you can provide application-wide services in a different way.

Instead of adding a service class to the `providers[]` array in `AppModule` , you can set the following config in`@Injectable()` :

```
@Injectable({providedIn: 'root'})
export class MyService { ... }
```

This is exactly the same as:

```
export class MyService { ... }
```

and

```
import { MyService } from './path/to/my.service';

@NgModule({
    ...
    providers: [MyService]
})
export class AppModule { ... }
```

Using this new syntax is **completely optional**, the traditional syntax (using `providers[]` ) will still work. The "new syntax" does offer one advantage though: Services `can be loaded lazily` by Angular (behind the scenes) and redundant code can be removed automatically. This can lead to a better performance and loading speed - though this really only kicks in for bigger services and apps in general.
