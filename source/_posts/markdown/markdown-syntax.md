---
title: markdown语法汇总
date: 2018-05-09 18:23:34
categories:
  - markdown
tags:
  - markdown
  - syntax
abbrlink: 15918
---
markdown相关语法的总结

{% sfb warn%}
注意：这里介绍的只是通用的markdown语法，一些平台特有的语法的比如GFM(GitHub Flavored Markdown)的`@`等将不涉及。
{% endsfb %}

# Headers(标题)

使用`#`来标记标题级别，语法如下：

```markdown
# 这是一级标题
## 这是二级标题
### 这是三级标题
#### 这是四级标题
##### 这是五级标题
###### 这是六级标题
```

<!--more-->
效果：
{% sfb pass%}

# 这是一级标题

## 这是二级标题

### 这是三级标题

#### 这是四级标题

##### 这是五级标题

###### 这是六级标题

{% endsfb %}

# Strikethrough(删除线)

就像这样`~~like this~~`或者`<del>直接使用html</del>`html(不推荐)

~~i hate you~~ um...i like you actually

# Emphasis(强调)

```markdown
*文字斜体*
_也是文字斜体_

**文字粗体**
__也是文字粗体__

_你**可以**组合它们_
```

效果：
*文字斜体*
_也是文字斜体_

**文字粗体**
__也是文字粗体__

_你**可以**组合它们_

# <hr\>分割线

```markdown
***
---
---- 三个以上短线
___  三个下划线
```

效果：

***
---

----
___

# 超链接

```markdown
[连接名称](address , alt)
[我是链接名](https://suchenrain.github.io, "我是标题")
[<i class="fa fa-refresh"></i> 点我刷新](/sonfilename/)

另一种超链接写法：[链接名][链接代号]
[here][3]
然后在别的地方定义 3 这个详细链接信息
[3]: https://suchenrain.github.io "suchenrain"

直接展示链接的写法：<https://suchenrain.github.io>
```

[我是链接名](https://suchenrain.github.io, "我是标题")
[<i class="fa fa-refresh"></i>点我刷新](/sonfilename/)

[here][3]
<https://suchenrain.github.io>

[3]: https://suchenrain.github.io "suchenrain"

# 键盘键

```
<kbd>Ctrl+[</kbd> and <kbd>Ctrl+]</kbd>
```

键盘键
<kbd>Ctrl+[</kbd> and <kbd>Ctrl+]</kbd>

# 代码块

语法如下

```markdown
`var example=true` //内联样式

//换行并缩进4格

....if(isAwesome){
      return true
    }

//使用3个反引号,忽略括号
(```)
if (isAwesome){
  return true
}
(```)

//指定代码高亮语言
(```javascript)
if (isAwesome){
  return true
}
(```)
```

效果：

`var example=true` //内联样式

//换行并缩进4格

    if(isAwesome){
      return true
    }

//使用3个反引号

```
if (isAwesome){
  return true
}
```

//指定代码高亮语言

```javascript
if (isAwesome){
  return true
}
```

# Lists(列表)

## 无序列表(Unordered)

使用 -/*/+ 加一个空格
```markdown
//层次使用一个Tab或者两个空格缩进
* Item 1
* Item 2
  * Item 2a
  * Item 2b

- Item 1
- Item 2
  - Item 2a
  - Item 2b

+ Item 1
+ Item 2
  + Item 2a
  + Item 2b
```

效果：

* Item 1
* Item 2
  * Item 2a
  * Item 2b

- Item 1
- Item 2
  - Item 2a
  - Item 2b

+ Item 1
+ Item 2
  + Item 2a
  + Item 2b

## 有序列表(Ordered)

使用 数字 加一个英文句点+一个空格，即：
`数字+.+空格` 数字可以不用有序，会自动排序

```markdown
1.Item 1
1.Item 2
1.Item 3
   1.Item 3a
   1.Item 3b
```

1. Item 1
1. Item 2
1. Item 3
   1. Item 3a
   1. Item 3b

# 图片(Image)

```markdown
![Alt text](src "Optional title")
```

![Alt text](https://suchenrain-1255943826.file.myqcloud.com/Post/1_V3Kfghg_jIV0ubxmAnCXBA.jpeg '副标题')

# 段落(Paragraph)

以一个空行开始，以一个空行结束，中间的就是一个段落。

```markdown
-----假装我是空行------
我是一段话。
我真的是一段话。
-----假装我是空行------

```

效果：

我是一段话。
我真的是一段话。

# 块引用(Blockquotes)

```markdown
>给引用的文本开始位置都加一个 '>'，
>便可组成一个块引用。在块引用中，可以结合
>其他markdown元素一块使用，比如列表。
>**强调**
也可以只在第一行加大于号，其他位置不加。
>
>- 块引用里使用列表，需要和上面的内容隔开一个空行
>- 记得加空格哦。
```
效果(以下效果仅供参考...因为我修改了样式)：
>给引用的文本开始位置都加一个 '>'，
>便可组成一个块引用。在块引用中，可以结合
>其他markdown元素一块使用，比如列表。
>**强调**
也可以只在第一行加大于号，其他位置不加。
>
>* 块引用里使用列表，需要和上面的内容隔开一个空行
>* 记得加空格哦。

# Task Lists(任务清单)

```markdown
- [x]  [links](), **formatting**, and <del>tags</del> supported
- [x] list syntax required (any unordered or ordered list supported)
- [x] this is a complete item
- [ ] this is an incomplete item
```

效果：

- [x]  [links](), **formatting**, and <del>tags</del> supported
- [x] list syntax required (any unordered or ordered list supported)
- [x] this is a complete item
- [ ] this is an incomplete item

# Table(表格)

You can create tables by assembling a list of words and dividing them with hyphens <kbd>-</kbd> (for the first row), and then separating each column with a pipe <kbd>|</kbd>:

```markdown
example 1:

First Header | Second Header
------------ | -------------
Content from cell 1 | Content from cell 2
Content in the first column | Content in the second column

example 2:

Item     | Value
-------- | ---
Computer | $1600
Phone    | $12
Pipe     | $1
```

效果：
example 1

First Header | Second Header
------------ | -------------
Content from cell 1 | Content from cell 2
Content in the first column | Content in the second column

example 2

Item     | Value
-------- | ---
Computer | $1600
Phone    | $12
Pipe     | $1


# 忽略markdown语法

使用`\`来忽略markdown语法

```markdown
\`\`\`
Let's rename \*our-new-project\* to \*our-old-project\*.
```

\`\`\`
Let's rename \*our-new-project\* to \*our-old-project\*.

{% sfb info %}
参考文献：
[1].  [掌握这几种 Markdown 语法你就够了](https://laravel-china.org/topics/621/you-will-be-able-to-master-these-markdown-grammars)
[2].  [Mastering Markdown](https://guides.github.com/features/mastering-markdown/)
{% endsfb %}