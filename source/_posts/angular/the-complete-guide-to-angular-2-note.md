---
title: Notes of Angular 7 (formerly Angular 2) - The Complete Guide | Udemy Video
author: 橙橙GG
categories:
  - Angular 2
tags:
  - angular 7
  - angular 2
  - udemy
  - the complete guide to angular 2
abbrlink: 4782
date: 2018-10-31 16:35:21
updated: 2018-11-01 20:19:52
---

## Component Selector

```bash
# component selector
## element
'app-demo'
usage: <app-demo></app-demo>
## attribute
'[app-demo]'
usage: <div app-demo></div>
## class
'.app-demo'
usage: <div class='app-demo'></div>
```

## Data Binding

---

### String Interpolation(插值)

**Syntax**:

```html
{{ expression }}
```

_`expression`_ represent a `String` value or something that can be converted to `String` or a function that returns what we metioned above.

### Property Binding(属性绑定)

**Syntax**:

```html
<element [property]="expression"></element>
```

_`property`_ represent the `bindable` html element property.
_`expression`_ represent a `String` value or something that can be converted to `String` or a function that returns what we metioned above.

### String Interpolation vs Property Binding

In most cases they are equivalent:

```html
<p>{{ someText }}</p>
# equals to
<p [innerText]="someText"></p>
```

when should you use which of the two:

- **string interpolation**: if you want output something in your template print some text.
- **property binding**: if you want to change some property be that of an aged female element or a directive or a component.

{% note info %}
Don't mix property binding and string interpolation. **{\{ expression \}\}** won't work between `""`.
{% endnote %}

### Event Binding

**Syntax**:

```html
// use parentheses
<element (event)="func()"></element>
```

_`event`_ the `bindable` event name, e.g. `click` `keyup` `mouseenter`
_`func`_ the callback function when event triggered.

### Two-Way-Databinding

**Syntax**:

```html
// use square brackets and parentheses
<element [(ngModel)]="model"></element>
```

_`ngModel`_ the built-in angular directive.
_`model`_ the view model a property difined in our typescript code.
{% note %}
_**Important**_ : For Two-Way-Binding (covered in the next lecture) to work, you need to enable the `ngModel` directive. This is done by adding the `FormsModule` to the `imports[]` array in the AppModule.
You then also need to add the import from `@angular/forms` in the app.module.ts file:
`import { FormsModule } from '@angular/forms';`
{% endnote %}
