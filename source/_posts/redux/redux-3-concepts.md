---
title: 'Redux三大概念（Action、Reducer和Store）'
categories:
  - Redux
tags:
  - redux
  - flux

date: 2019-07-04 12:46:05
updated: 2019-07-04 13:26:04
license: nd
---

本文源码地址：[GitHub 传送门][3]

## Action

什么是`Action`? Action 是把数据从应用（这里之所以不叫 view 是因为这些数据有可能是服务器响应，用户输入或其它非 view 的数据 ）传到 `store` 的有效载荷（payload）。它是 `store` 数据的唯一来源。一般来说你会通过 store.dispatch() 将 `action` 传到 `store`。
来看几个例子：

```json
{ type: 'ADD_TODO', text: 'Go to swimming pool' }
{ type: 'TOGGLE_TODO', index: 1 }
{ type: 'SET_VISIBILITY_FILTER', filter: 'SHOW_ALL' }
```

它其实就是一个普通 `JavaScript` 对象，用来描述发生了什么。按照约定，action 内必须使用一个字符串类型的 `type` 字段来表示将要执行的动作。多数情况下，type 会被定义成字符串常量。当应用规模越来越大时，建议使用单独的模块或文件来存放 actions。

```js
import { ADD_TODO, REMOVE_TODO } from '../actionTypes';
```

除了 `type` 字段外，action 对象的结构完全由你自己决定。参照 [Flux 标准 Action][0] 获取关于如何构造 action 的建议。

{%note danger%}
**注意**：应该尽量减少在 action 中传递的数据
{%endnote%}

### Action 创建函数

**`Action 创建函数`** 就是生成 action 的方法。“action” 和 “action 创建函数” 这两个概念很容易混在一起，使用时最好注意区分。

在 Redux 中 action 创建函数只是简单的返回一个 action 对象，然后通过 store 的`dispatch()`方法发起一次 dispatch 过程。

```js
function addTodo(text) {
  return {
    type: ADD_TODO,
    text
  };
}
// dispatch
store.dispatch(addTodo('some text'));
```

而在 [传统的 Flux][1] 实现中，当调用 action 创建函数时，一般会触发一个 dispatch，像这样：

```js
function addTodoWithDispatch(text) {
  const action = {
    type: ADD_TODO,
    text
  };
  dispatch(action);
}
```

## Reducer

[0]: https://github.com/redux-utilities/flux-standard-action
[1]: http://facebook.github.io/flux
[3]: https://github.com/suchenrain/redux-wheel/tree/master/threeConcepts
