---
title: Angular 7 (formerly Angular 2) - The Complete Guide | Part 2
author: 橙橙GG
categories:
  - Angular 2
tags:
  - angular 7
  - angular 2
  - udemy
  - the complete guide to angular 2
abbrlink: 54676
date: 2018-11-07 20:18:59
updated: 2018-11-07 20:25:41
---

## Components & Databinding Deep Dive

Usually we splitting `Apps` into `Components`. so how does `component communicate` with each other?

### Property Binding

Generally all properties or components are only accessible inside these components not from outside. But you can expose property to the world by adding `@Input` decorator, so that any parent component is now able to pass data to our exposed properties `downstream`.

<!-- more -->

- **`Binding to custom properties`**

* **Syntax**

```
// component
@Input() customPropertyName: Type;

// template
<selector [customPropertyName]="expression">
```

- **Alias**

```
// component
@Input('alias') customPropertyName: Type;

// template
<selector [alias]="expression">
```

### Event Binding

The other direction(upstream) what if we have a component and something changes in there and we want inform the parent component.

- **`Binding to custom events`**

  - **Syntax**

  ```
  // child component
  @Output() someEvent: new EventEmitter<dataType>();

  onOtherEvent(){
      this.someEvent.emit(data)
  }

  // child template
  <element (otherEvent)="onOtherEvent()">

  //==================================================

  // host template
  <selector (someEvent)="someEvented($event)"></selector>

  // parent component
  someEvented(data: dataType){

  }
  ```

- Alias
  ```
  @Output('alias') someEvent: new EventEmitter<dataType>();
  ...
  <selector (alias)="someEvented($event)"></selector>
  ....
  ```

### View Encapsulation

### Local References
