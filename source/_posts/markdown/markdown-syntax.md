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

# Headers(标题){heading-id}

使用`#`来标记标题级别，语法如下：

```markdown
# 这是一级标题<h1>
## 这是二级标题<h2>
###### 这是六级标题<h6>
```

效果：
{% sfb pass%}
# 这是一级标题<h1>
## 这是二级标题<h2>
###### 这是六级标题<h6>
{% endsfb %}

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

# <hr>分割线

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
[3]: https://suchenrain.github.io "聚牛团队"

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