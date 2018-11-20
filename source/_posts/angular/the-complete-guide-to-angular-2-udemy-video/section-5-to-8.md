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
updated: 2018-11-19 19:33:34
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

- `Emulated: 0`: default behavior. Use shimmed CSS that emulates the native behavior.
- `Native: 1`: Use shadow roots. This works only if natively available on the platform.
- `None: 2`
- `ShadowDom: 3`: Use Shadow DOM to encapsulate styles.

usage:

```
@Component({
  ...
  encapsulations: ViewEncapsulation.ShadowDom
})
```

### Local References and @ViewChild

In template place a local reference on element then it will hold a reference to this element. you can use it directly only in current template context.
usage:

```
<element #someRef ></element>
<button (click)='demo(someRef.value)'></button>
```

if you want getting access to the template&DOM, using `@ViewChild`.

```
@ViewChild('someRef') someEle: ElementRef;
...
someEle.nativeElement.value;

```

### ng-content and @ContentChild

projecting content into component dynamically. such as Tabs

```
// component 'demo' template code
<div class="panel-heading"></div>
<div class="panel-body">
  <ng-content></content>
</div>

// another component template
<demo>
  <p #projected >this is the content i want project into demo component</p>
</demo>


// final html we will see
<div class="panel-heading"></div>
<div class="panel-body">
  <p>this is the content i want project into demo component</p>
</div>
```

A question: how demo component get access to the projected content? The answer is `@ContentChild`

```
// same as above
...
// demo component code
@ContentChild('projected') somePropertyName: ElementRef;

```

### Lifecycle

- **ngOnChanges**: called after a bound input property changes.
- **ngOnInit**: called once the component is initialized.
- **ngDoCheck**: called during every change detection run.
- **ngAfterContentInit**: called after content(ng-content) has been projected into view.
- **ngAfterContentChecked**: called every time the projected content has been checked
- **ngAfterViewInit**: called after the component's view(and child views) has been initialized.
- **ngAfterViewChecked**: called every time the view(and child views) have been checked.
- **ngOnDestroy**: called once the component is about to be destroyed.

## Directives Deep Dive

### Create Attribute Directive

```typescript appBasicHighlight.directive.ts
import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appBasicHighlight]'
})
export class BasicHighlightDirective {
  constructor(private elementRef: ElementRef) {}
  ngOnInit() {
    this.elementRef.nativeElement.style.backgroundColor = 'green';
  }
}
```

usage:

```html
<p appBasicHighlight></p>
```

Enhancing directive using the `Renderer`:

```typescript better-highlight.directive.ts
import { Directive, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appBetterHighlight]'
})
export class BetterHighlightDirective {
  constructor(private elRef: ElementRef, private renderer: Renderer2) {}
  ngOnInit() {
    this.renderer.setStyle(this.elRef.nativeElement, 'background-color', 'blue');
  }
}
```

usage:

```html
<p appBetterHighlight></p>
```

{% note info%}
**Why**
Angular is not limited to running in the browser and for example also works with service worker. it is a better practice to use the renderer for dom access instead of accessing the native element directly.
{% endnote%}

### HostListener and HostBinding

HostListener: Listen to Host Events.
HostBinding: Bind to the Host properties.

```typescript
import { Directive, RendererV2, ElementRef, HostListener, HostBinding } from '@angular/core';

@Directive({
  selector: 'hoverHighlight'
})
export class HoverHighlightDirective {
  @HostBinding('style.backgroundColor') backgroundColor: string = 'transparent';

  constructor(private elRef: ElementRef, private renderer: RendererV2) {}

  ngOnInit() {}

  @HostListener('mouseenter')
  mouseover(eventData: Event) {
    this.render.setStyle(this.elRef.nativeElement, 'background-color', 'blue', false, false);
    //this.backgroundColor = 'blue';
  }
  @HostListener('mouseleave')
  mouseleave(eventData: Event) {
    this.render.setStyle(this.elRef.nativeElement, 'background-color', 'transparent', false, false);
    //this.backgroundColor = 'transparent';
  }
}
```

### Binding to Directive Properties

```typescript
import { Directive, RendererV2, ElementRef, HostListener, HostBinding, Input } from '@angular/core';

@Directive({
  selector: 'hoverHighlight'
})
export class HoverHighlightDirective {
  @Input() defaultColor: string = 'transparent';
  @Input() hightlightColor: string = 'blue';
  // using alias see usage 2
  @Input('hoverHighlight') hightlightColor: string = 'blue';

  @HostBinding('style.backgroundColor') backgroundColor: string;

  constructor(private elRef: ElementRef, private renderer: RendererV2) {}

  ngOnInit() {
    this.backgroundColor = this.defaultColor;
  }

  @HostListener('mouseenter')
  mouseover(eventData: Event) {
    this.backgroundColor = this.hightlightColor;
  }
  @HostListener('mouseleave')
  mouseleave(eventData: Event) {
    this.backgroundColor = this.defaultColor;
  }
}
```

```html template
<p hoverHighlight [defaultColor]="'yellow'" [highlightColor]="'red'">just a demo here!</p>
// short cut - no square bracket
<p hoverHighlight defaultColor="yellow" highlightColor="red">just a demo here!</p>
// usage 2 note alias!
<p [hoverHighlight]="'red'" [defaultColor]="'yellow'">just a demo here!</p>
```

### what happens behind Structural Directive

As you know angular structual directive prefix with a star(\*). `ng-template` is a element that itself not rendered and it define a template for angular to use(determine which to render).

```html
<div *ngIf="onlyOdd"><p>something</p></div>
// will be transformed to property binding as below
<ng-template [ngIf]="onlyOdd">
  <div><p>something</p></div>
</ng-template>
```

### Create Structual Directive like \*ngIf

we will create our owned structual directive with the same functionality as `*ngIf`.

```typescript
@Directive({
  selector: 'appUnless'
})
export class UnlessDirective {
  @Input()
  set appUnless(condition: boolean) {
    if (!condition) {
      this.vcRef.createEmbeddedView(this.templateRef);
    } else {
      this.vcRef.clear();
    }
  }

  constructor(private templateRef: TemplateRef<any>, private vcRef: ViewContainerRef) {}
}
```

usage:

```html
<div *appUnless="false"><p>some thing.</p></div>
// which will be transformed to below
<ng-template [appUnless]="false">
  <div><p>some thing.</p></div>
</ng-template>
```
