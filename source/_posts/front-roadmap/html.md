---
title: 你需要知道的HTML知识
categories:
  - 前端之路
tags:
  - HTML
license: nd
date: 2019-12-29 19:23:34
---

前端三大件：`HTML`+`CSS`+`JS`

今天我们就来说一说`HTML`，可能很多人觉得这个太简单了，就是平常写网页的一堆元素。然而越是基础的东西人们越容易忽略，所以特意梳理了下相关知识，希望加深对它的理解。

**如果你觉得本文对你有所帮助，欢迎猛戳** :star: [Github(梳理前端知识体系全集)](https://github.com/suchenrain/FrontEnd-Roadmap)

<!-- more -->

![HTML思维导图](https://user-gold-cdn.xitu.io/2019/12/30/16f5668ab01a2b21?w=1521&h=1059&f=jpeg&s=327765)

## 是什么

`HTML`（HyperText Markup Language）超文本标记语言。顾名思义，它是一门语言，用来标记文档结构的语言。就像你写 word 一样，有各种格式和大纲，`HTML`描述了网页文档的结构，标记各种区块。

## 版本

如果你很早以前就接触过 html,那你肯定知道下面的写法：

```html
<!-- HTML4.01 -->
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

<!-- XHTML -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
```

上面分别是 `HTML4` 和 `XHTML` 的声明部分，其中的`DTD`规定了可用的元素和属性，这样浏览器才能正确地渲染网页。`HTML4/4.01(SGML)`时代，语法较为随意，比如标签可以不闭合/大写/属性可为空等，所以各大浏览器会有语法容错机制，自动补全标签闭合等。到了后来，大家觉得这并不是浏览器该做的事情，所以有更为严格的`XHTML（xml）`：必须小写/闭合/属性带引号等等。但是`XHTML`愈加严格繁琐的语法让人不耐烦了，所以 HTML4 的下一个版本也即`HTML5`横空出世，轻松的语法，更多语义化的元素以及表单增强等等。

```html
<!-- HTML 5 声明 -->
<!DOCTYPE html>
```

注：`HTML5`是主流和未来，所以下文内容均是以 `HTML5` 为参考。

## 元素

`HTML` 文档由各种元素和属性组成，描述了网页的结构。

### 常见元素

`HTML`文档元素从上至下包括：

- `doctype`:文档声明
- `head`部分：包含页面设定，标题，引用资源等
  - `meta`
  - `title`
  - `style`
  - `link`
  - `script`
  - `base`
- `body`部分：网页呈现出来的部分
  - `div`/`section`/`article`/`aside`/`header`/`main`/`footer`
  - `p`
  - `span`/`em`/`strong`/`i`
  - `table`/`thead`/`tbody`/`th`/`tr`/`td`
  - `a`
  - `form`/`input`/`select`/`button`/`textarea`

### 元素分类

#### 按照默认样式分类

- 块级 `block`: 独占一行或多行,可以设置宽高及对齐等属性
- 行内 `inline`：不占独立区域，靠自身内容支撑结构，和相邻元素和睦相处，宽高无效，但`水平方向`可以设置`padding`和`margin`
- 内联块级 `inline-block`：和其它`inline`元素同行显示，同时也可以设置宽高/margin/padding（`水平`和`垂直`）

| block                                                                   | inline                                     | inline-block                            |
| ----------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------- |
| 独占一行，自上而下的排列                                                | 自左向右排序，宽度不够的时候换行           | 和其他 inline 元素同行显示              |
| 可设置宽度，默认是 auto（margin+border+padding+content=父级元素的宽度） | 设定具体的宽度是不起作用的，由文字内容决定 | 可以设置宽度，未指定时靠内容撑开        |
| 可设置高度，默认是 0，靠内容撑开                                        | 不生效                                     | 可以设置高度，未指定时靠内容撑开        |
| padding/margin 两个方向均可改变元素位置                                 | 水平方向 padding/margin 可改变元素位置     | padding/margin 两个方向均可改变元素位置 |

#### 按照元素类别

HTML5 中的每个元素都可以归为零个或多个类别，这些类别将具有相似特征的元素分组在一起。[w3c](https://html.spec.whatwg.org/multipage/dom.html#kinds-of-content)中使用的主要类别如下:

- Metadata content（元数据元素）是可以被用于说明其他内容的表现或行为，或在当前文档和其他文档之间建立联系的元素。
- Flow content（流元素）是在应用程序和文档的主体部分中使用的大部分元素。
- Sectioning content（区块型元素）是用于定义标题及页脚范围的元素。
- Heading content（标题型元素）定义一个区块/章节的标题。
- Phrasing content（语句型元素）用于标记段落级文本的元素。
- Embedded content（嵌入型元素）引用或插入到文档中其他资源的元素。
- Interactive content（交互型元素）专门用于与用户交互的元素。

![元素类别](https://user-gold-cdn.xitu.io/2019/12/30/16f5668a8489f5a9?w=813&h=318&f=png&s=44114)

### 元素的嵌套

你可能听说过以下常见的元素的规则：

```html
<!-- 块级元素可以包含内联元素 -->
<div><span></span></div>
<!-- 块级元素可以包含某些块级元素 -->
<section><div></div></section> <!--正确-->
<p><div></div></p> <!--错误-->
<!-- form/a 不能再嵌套自身 -->
<a><a></a></a>
<!-- 内联元素一般不能嵌套块级元素 -->
<body><a><div></div></a><body> <!--HTML4中不合法（但浏览器支持）/但HTML5中是合法的-->
```

其中关于 HTML4 的嵌套规则可以参考[这里](http://jkorpela.fi/html/nesting.html), 而 HTML5 中对元素重新做了分类，嵌套关系根据元素的`content model`进行合法确定。比如上面的`a>div`在 HTML5 中就是合法的。参考 HTML5 中的`a`[定义](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element),它的内容模型定义为`transparent`(透明),透明的意思就是在计算合法性的时候，会忽略`a`本身，嵌套关系需要根据`a`的父标签来决定。请看下面嵌套：

```html
<!--第一种嵌套-->
<div>
  <a>
    <div></div>
  </a>
</div>

<!--第二种嵌套-->
<p>
  <a>
    <div></div>
  </a>
</p>
```

第一种是合法嵌套，因为相当于`div`嵌套`div`，而第二种则不合法，因为相当于`p`嵌套`div`,浏览器会进行猜测解析，不妨在浏览器测试一下哦。

## 语义化

先来看两段 html 代码:

```html
<!--使用万能div-->
<div class="header"></div>
<div class="left"></div>
<div class="container">
  <div class="content"></div>
</div>
<div class="footer"></div>

<!--不使用div-->
<header></header>
<nav></nav>
<main>
  <article></article>
  <aside></aside>
</main>
<footer></footer>
```

对于上面两种写法，第二种就是 HTML 语义化。可能有人觉得这两种写法没什么太大区别呀，结构都很清晰，但是如果脱了 css 这层外衣，你觉得哪种写法更容易理解呢？**所谓 HTML 语义化，就是用最恰当的元素标签标记内容结构。**

为什么需要语义化呢？

- 在没有 CSS 样式的条件下，也能很好地呈现出内容结构、代码结构；
- 语义化 HTML 会使 HTML 结构变的清晰，有利于维护代码和添加样式；
- 方便其他设备解析（如屏幕阅读器、盲人阅读器、移动设备）以意义的方式来渲染网页；
- 提升搜索引擎优化(SEO)的效果。和搜索引擎建立良好沟通，有助于爬虫抓取更多的有效信息：爬虫依赖于标签来确定上下文和各个关键字的权重；
- 便于团队开发和维护，语义化更具可读性，是下一步吧网页的重要动向，遵循 W3C 标准的团队都遵循这个标准，可以减少差异化。
- 通常语义化 HTML 会使代码变的更少，使页面加载更快。

那怎么写语义化的 HTML 呢？

- 尽可能少的使用无语义的万能标签`div`和`span`；
- 在语义不明显时，既可以使用`div`或者`p`时，尽量用`p`, 因为`p`在默认情况下有上下间距，对兼容特殊终端有利；
- 不要使用纯样式标签，如：`b`、`font`、`u`等，改用`css`设置。
- 需要强调的文本，可以包含在`strong`或者`em`标签中（浏览器预设样式，能用 CSS 指定就不用他们），`strong`默认样式是加粗（不要用 b），`em`是斜体（不用 i）；
- 使用表格时，标题要用`caption`，表头用`thead`，主体部分用`tbody`包围，尾部用`tfoot`包围。表头和一般单元格要区分开，表头用`th`，单元格用`td`；
- 表单域要用`fieldset`标签包起来，并用`legend`标签说明表单的用途；
- 每个`input`标签对应的说明文本都需要使用`label`标签，并且通过为`input`设置`id`属性，在`lable`标签中设置`for=someld`来让说明文本和相对应的`input`关联起来。

## 浏览器默认样式

现代浏览器对于 HTML 元素都提供了了默认的样式，比如 body 默认有一定的 padding,下拉框/按钮等都有默认的外观。然而，这些默认的样式某些情况下会带来问题，比如我们想要定制下拉框的外观，那就需要花费精力去处理默认样式，提高了定制成本。

解决的方向大概有两个：

- 干掉默认样式：覆盖重置（css reset）
- 统一默认样式：修改统一

`css reset`的话，可以在网络上找到一些简单的代码或者简单的通过以下来重置样式：

```css
html * {
  margin: 0;
  padding: 0 ...;
}
```

又或者通过统一的样式来处理，比如[normalize.css](http://necolas.github.io/normalize.css/)
