---
title: Hexo Next主题使用汇总（不定期更新）
categories:
  - Hexo
  - Next
tags:
  - Hexo
  - Next
  - 主题
abbrlink: 27331
date: 2018-05-09 18:23:34
license: nd
---
## 写在前面

记录在使用Next主题时遇到的一些点：
- [x] 关于多选项卡`Tabs`
<!--more-->
***
## Tabs

在看关于markdown的语法时，突然想到可能会用到的tabs。但是发现[GitHub Flavored Markdown](https://github.github.com/gfm/#task-list-items-extension)好像没有tabs相关的语法，不过因为在gitbook里有使用过tabs的markdown语法，所以去gitbook的在线编辑页面研究了一下。最终gitbook生成的相应源代码如下：
```
{% tabs %}
{% tab title="First Tab" %}
first
{% endtab %}
{% tab title="second" %}
second
{% endtab %}
{% endtabs %}
```
其中`tabs`和`tab`是gitbook内部支持的markdown拓展语法，所以很无奈在hexo中并不能直接使用。

很不甘心，所以想利用hexo的标签插件自定义类似的快速标签。在查看hexo及next源码时，发现Next其实内置了tabs标签，然而在官方文档里并没有提到。其使用方法如下：
```
{% tabs %}
<!-- tab first tab@heart -->
 first
<!-- endtab -->
<!-- tab  second tab-->
 second
<!-- endtab -->
{% endtabs %}
```
上面的代码效果：
{% tabs %}
<!-- tab first tab@heart -->
 this is first tab content
<!-- endtab -->
<!-- tab  second tab-->
 second content
<!-- endtab -->
{% endtabs %}
