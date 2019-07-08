---
title: Redux三大基础概念（Action、Reducer和Store）
categories:
  - Redux
tags:
  - redux
  - flux
license: nd
abbrlink: 45864
date: 2019-07-04 12:46:05
updated: 2019-07-04 13:26:04
---

本文源码地址：[GitHub 传送门][3]

## Action

什么是`Action`? Action 是把数据从应用（这里之所以不叫 view 是因为这些数据有可能是服务器响应，用户输入或其它非 view 的数据 ）传到 `store` 的有效载荷（payload）。它是 `store` 数据的唯一来源。一般来说你会通过 store.dispatch() 将 `action` 传到 `store`。
来看几个例子：

<!-- more -->

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

让我们来看一下[Reducer][4]的签名：

```typescript
type Reducer<S, A> = (state: S, action: A) => S;
```

`Reducer`: `n.[助剂] 还原剂`。还记得化学实验课上用的各种试剂吗？它们通过各种反应生成不同的产物。类似的，上面提到的`Action`只是描述了 _有事情发生_ 这一事实，而没有描述如何发生，应用将如何更新 state。`Reducer`正是为此，它描述了事情将如何发生，它本质上是一个`纯函数`，接受旧的 state 和 action，并根据 action 的 type 对旧的 state 加以处理，返回一个新的 state。（**注意**：reducer 不会修改 state,而是返回一个新的对象，保持纯净）

### State 结构

在 Redux 中，所有的的 state 都被保存在一个单一的对象中。建议在写代码前先想一下这个对象的结构。如何才能以最简的形式把应用的 state 用对象描述出来？

以 todo 应用为例，需要保存两种不同的数据：

- 当前选中的任务过滤条件；
- 完整的任务列表。

通常，这个 state 树还需要存放其它一些数据，以及一些 UI 相关的 state。这样做没问题，但尽量把这些数据与 UI 相关的 state 分开。

```typescript
{
  visibilityFilter: 'SHOW_ALL',
  todos: [
    {
      text: 'Consider using Redux',
      completed: true,
    },
    {
      text: 'Keep all state in a single tree',
      completed: false
    }
  ]
}
```

{%note info%}
**处理 Reducer 关系时的注意事项**
开发复杂的应用时，不可避免会有一些数据相互引用。建议你尽可能地把 state 范式化，不存在嵌套。把所有数据放到一个对象里，每个数据以 ID 为主键，不同实体或列表间通过 ID 相互引用数据。把应用的 state 想像成数据库。这种方法在 [normalizr](https://github.com/paularmstrong/normalizr) 文档里有详细阐述。例如，实际开发中，在 state 里同时存放 todosById: { id -> todo } 和 todos: array<id> 是比较好的方式，本文中为了保持示例简单没有这样处理。
{%endnote%}

### Action 处理

确定了 state 对象的结构，就可以开始开发 reducer。reducer 就是一个纯函数，接收旧的 state 和 action，返回新的 state。

```typescript
(previousState, action) => newState;
```

之所以将这样的函数称之为 reducer，是因为这种函数与被传入 `Array.prototype.reduce(reducer, ?initialValue)` 里的回调函数属于相同的类型。保持 reducer 纯净非常重要。**`永远不要`**在 reducer 里做这些操作：

- 修改传入参数；
- 执行有副作用的操作，如 API 请求和路由跳转；
- 调用非纯函数，如 Date.now() 或 Math.random()。

在[React 官方文档里][5]有介绍如何执行有副作用的操作。现在只需要谨记 reducer 一定要保持纯净。`只要传入参数相同，返回计算得到的下一个 state 就一定相同。没有特殊情况、没有副作用，没有 API 请求、没有变量修改，单纯执行计算。`

明白了这些之后，就可以开始编写 reducer，并让它来处理之前定义过的 action。

我们将以指定 state 的初始状态作为开始。Redux 首次执行时，state 为 undefined，此时我们可借机设置并返回应用的初始 state。

```typescript
function todoApp(state = initialState, action) {
  // 这里暂不处理任何 action，
  // 仅返回传入的 state。
  return state;
}
```

现在可以处理 SET_VISIBILITY_FILTER。需要做的只是改变 state 中的 visibilityFilter。

```typescript
function todoApp(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return Object.assign({}, state, {
        visibilityFilter: action.filter
      });
    default:
      return state;
  }
}
```

注意:

- **不要修改 state**。 使用 Object.assign() 新建了一个副本。不能这样使用 Object.assign(state, { visibilityFilter: action.filter })，因为它会改变第一个参数的值。你必须把第一个参数设置为空对象。

- **在 default 情况下返回旧的 state**。遇到未知的 action 时，一定要返回旧的 state。

### 处理多个 Action

还有两个 action 需要处理。就像我们处理 `SET_VISIBILITY_FILTER` 一样，我们引入 `ADD_TODO` 和 `TOGGLE_TODO` 两个 actions 并且扩展我们的 reducer 去处理 `ADD_TODO`.

```typescript
import {
  ADD_TODO,
  TOGGLE_TODO,
  SET_VISIBILITY_FILTER,
  VisibilityFilters
} from './actions'

...

function todoApp(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return Object.assign({}, state, {
        visibilityFilter: action.filter
      })
    case ADD_TODO:
      return Object.assign({}, state, {
        todos: [
          ...state.todos,
          {
            text: action.text,
            completed: false
          }
        ]
      })
    default:
      return state
  }
}
```

如上，不直接修改 `state` 中的字段，而是返回新对象。新的 `todos` 对象就相当于旧的 `todos` 在末尾加上新建的 todo。而这个新的 todo 又是基于 action 中的数据创建的。

`最后，TOGGLE_TODO` 的实现也很好理解：

```typescript
case TOGGLE_TODO:
  return Object.assign({}, state, {
    todos: state.todos.map((todo, index) => {
      if (index === action.index) {
        return Object.assign({}, todo, {
          completed: !todo.completed
        })
      }
      return todo
    })
  })
```

我们需要修改数组中指定的数据项而又不希望导致`突变`, 因此我们的做法是在创建一个新的数组后, 将那些无需修改的项原封不动移入, 接着对需修改的项用新生成的对象替换。(译者注：Javascript 中的对象存储时均是由值和指向值的引用两个部分构成。此处`突变`指直接修改引用所指向的值, 而引用本身保持不变。) 如果经常需要这类的操作，可以选择使用帮助类 [React-addons-update][6]，[updeep][7]，或者使用原生支持深度更新的库 [Immutable][8]。最后，时刻谨记永远不要在克隆 state 前修改它。

### 拆分 Reducer

这里的 `todos` 和 `visibilityFilter` 的更新看起来是相互独立的。有时 state 中的字段是相互依赖的，需要认真考虑，但在这个案例中我们可以把 todos 更新的业务逻辑拆分到一个单独的函数里：

```typescript
function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ];
    case TOGGLE_TODO:
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: !todo.completed
          });
        }
        return todo;
      });
    default:
      return state;
  }
}

function todoApp(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return Object.assign({}, state, {
        visibilityFilter: action.filter
      });
    case ADD_TODO:
      return Object.assign({}, state, {
        todos: todos(state.todos, action)
      });
    case TOGGLE_TODO:
      return Object.assign({}, state, {
        todos: todos(state.todos, action)
      });
    default:
      return state;
  }
}
```

注意 `todos` 依旧接收 `state`，但它变成了一个数组！现在 `todoApp` 只把需要更新的一部分 state 传给 `todos` 函数，`todos` 函数自己确定如何更新这部分数据。这就是所谓的 `reducer 合成，它是开发 Redux 应用最基础的模式。`

下面深入探讨一下如何做 reducer 合成。能否抽出一个 reducer 来专门管理 visibilityFilter？当然可以：

首先引用, 让我们使用 ES6 对象结构 去声明 SHOW_ALL:

```javascript
const { SHOW_ALL } = VisibilityFilters;
```

接下来：

```javascript
function visibilityFilter(state = SHOW_ALL, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return action.filter;
    default:
      return state;
  }
}
```

现在我们可以开发一个函数来做为主 reducer，它调用多个子 reducer 分别处理 state 中的一部分数据，然后再把这些数据合成一个大的单一对象。主 reducer 并不需要设置初始化时完整的 state。初始时，如果传入 undefined, 子 reducer 将负责返回它们的默认值。

```typescript
function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ];
    case TOGGLE_TODO:
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: !todo.completed
          });
        }
        return todo;
      });
    default:
      return state;
  }
}

function visibilityFilter(state = SHOW_ALL, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return action.filter;
    default:
      return state;
  }
}

function todoApp(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action)
  };
}
```

**注意每个 reducer 只负责管理全局 state 中它负责的一部分。每个 reducer 的 state 参数都不同，分别对应它管理的那部分 state 数据。**

现在看起来好多了！随着应用的膨胀，我们还可以将拆分后的 reducer 放到不同的文件中, 以保持其独立性并用于专门处理不同的数据域。

最后，Redux 提供了 [combineReducers()][9] 工具类来做上面 `todoApp` 做的事情，这样就能消灭一些样板代码了。有了它，可以这样重构 todoApp：

```typescript
import { combineReducers } from 'redux';

const todoApp = combineReducers({
  visibilityFilter,
  todos
});

export default todoApp;
```

注意上面的写法和下面完全等价：

```typescript
export default function todoApp(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action)
  };
}
```

你也可以给它们设置不同的 key，或者调用不同的函数。下面两种合成 reducer 方法完全等价：

```typescript
const reducer = combineReducers({
  a: doSomethingWithA,
  b: processB,
  c: c
});
```

```typescript
function reducer(state = {}, action) {
  return {
    a: doSomethingWithA(state.a, action),
    b: processB(state.b, action),
    c: c(state.c, action)
  };
}
```

[`combineReducers()`][9] 所做的只是生成一个函数，这个函数来调用你的一系列 reducer，每个 reducer **根据它们的 key 来筛选出 state 中的一部分数据并处理**，然后这个生成的函数再将所有 reducer 的结果合并成一个大的对象。**没有任何魔法**。正如其他 reducers，如果 combineReducers() 中包含的所有 reducers 都没有更改 state，那么也就不会创建一个新的对象。

{%note warning%}
**ES6 用户使用注意**
`combineReducers` 接收一个对象，可以把所有顶级的 reducer 放到一个独立的文件中，通过 `export` 暴露出每个 reducer 函数，然后使用 `import * as reducers` 得到一个以它们名字作为 key 的 object：

_`import { combineReducers } from 'redux';`_
_`import \* as reducers from './reducers';`_
_`const todoApp = combineReducers(reducers);`_

由于 `import *` 还是比较新的语法，为了避免困惑，我们不会在本文档中使用它。但在一些社区示例中你可能会遇到它们。
{%endnote%}

## Store

前面我们知道了[action][10]用来描述`发生了什么`，和使用[reducers][4]来根据 action 更新 state.

**`Store`** 就是把它们联系到一起的对象。Store 有以下职责：

- 维持应用的 state；
- 提供 getState() 方法获取 state；
- 提供 dispatch(action) 方法更新 state；
- 通过 subscribe(listener) 注册监听器;
- 通过 subscribe(listener) 返回的函数注销监听器。

再次强调一下 **`Redux 应用只有一个单一的 store`**。当需要拆分数据处理逻辑时，你应该使用 reducer 组合 而不是创建多个 store。

根据已有的 reducer 来创建 store 是非常容易的。在前一个章节中，我们使用 `combineReducers()` 将多个 reducer 合并成为一个。现在我们将其导入，并传递 `createStore()`。

```javascript
import { createStore } from 'redux';
import todoApp from './reducers';
let store = createStore(todoApp);
```

`createStore()` 的第二个参数是可选的, 用于设置 state 初始状态。这对开发[同构应用][11]时非常有用，服务器端 redux 应用的 state 结构可以与客户端保持一致, 那么客户端可以将从网络接收到的服务端 state 直接用于本地数据初始化。

```javascript
let store = createStore(todoApp, window.STATE_FROM_SERVER);
```

### 发起 Actions

现在我们已经创建好了 store ，让我们来验证一下！

```javascript
import {
  addTodo,
  toggleTodo,
  setVisibilityFilter,
  VisibilityFilters
} from './actions';

// 打印初始状态
console.log(store.getState());

// 每次 state 更新时，打印日志
// 注意 subscribe() 返回一个函数用来注销监听器
const unsubscribe = store.subscribe(() => console.log(store.getState()));

// 发起一系列 action
store.dispatch(addTodo('Learn about actions'));
store.dispatch(addTodo('Learn about reducers'));
store.dispatch(addTodo('Learn about store'));
store.dispatch(toggleTodo(0));
store.dispatch(toggleTodo(1));
store.dispatch(setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED));

// 停止监听 state 更新
unsubscribe();
```

**Output**:

```bash
$ node .\dist\index.js

{ visibilityFilter: 'SHOW_ALL', todos: [] }
{ visibilityFilter: 'SHOW_ALL',
  todos: [ { text: 'Learn about actions', completed: false } ] }
{ visibilityFilter: 'SHOW_ALL',
  todos:
   [ { text: 'Learn about actions', completed: false },
     { text: 'Learn about reducers', completed: false } ] }
{ visibilityFilter: 'SHOW_ALL',
  todos:
   [ { text: 'Learn about actions', completed: false },
     { text: 'Learn about reducers', completed: false },
     { text: 'Learn about store', completed: false } ] }
{ visibilityFilter: 'SHOW_ALL',
  todos:
   [ { text: 'Learn about actions', completed: true },
     { text: 'Learn about reducers', completed: false },
     { text: 'Learn about store', completed: false } ] }
{ visibilityFilter: 'SHOW_ALL',
  todos:
   [ { text: 'Learn about actions', completed: true },
     { text: 'Learn about reducers', completed: true },
     { text: 'Learn about store', completed: false } ] }
{ visibilityFilter: 'SHOW_COMPLETED',
  todos:
   [ { text: 'Learn about actions', completed: true },
     { text: 'Learn about reducers', completed: true },
     { text: 'Learn about store', completed: false } ] }
```

[0]: https://github.com/redux-utilities/flux-standard-action
[1]: http://facebook.github.io/flux
[3]: https://github.com/suchenrain/redux-wheel/tree/master/threeConcepts
[4]: /posts/1659/#Reducer
[5]: https://www.redux.org.cn/docs/advanced/
[6]: https://facebook.github.io/react/docs/update.html
[7]: https://github.com/substantial/updeep
[8]: http://facebook.github.io/immutable-js/
[9]: https://www.redux.org.cn/docs/api/combineReducers.html
[10]: https://www.redux.org.cn/docs/basics/Actions.html
[11]: https://zhuanlan.zhihu.com/p/43774895
