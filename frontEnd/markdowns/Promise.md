# Promise

date: 2018-02-08 11:00
tags: Promise

<abstract>
关于Promise
<abstract>

问题: 

> 下面这个输出什么?

```javascript
new Promise ((res, rej) => {
    res('aa')
}).then(undefined)
.then(undefined)
.then(a => console.log(a))
```

先说正确答案: `aa`

当时我回答的是: 没有使用过这个用法, 我知道`then`的参数是`onFulfilled, onRejected`两个回调函数, 后面`then`的参数是前面`then`的返回值. Promise是一个规范, 规范的具体实现可能有区别, 如果规范处理了`undefined`, 那就可能打印的是`undefined`, 如果没有处理, 可能会报错.

挂了...

回来之后我尝试跑了一下, Node, Chrome, jQuery都是打印的`aa`, 但是如果前面的`resolve`修改成`reject`, Node, Chrome是报错, JQuery还是打印的`aa`.

MDN上有一句解释:

> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
> 
> If one or both arguments are omitted, or are provided non-functions, then then will be missing the handler(s), but will not generate any errors. If the Promise that then is called on adopts a state (fulfillment or rejection) for which then has no handler, a new Promise is created with no additional handlers, simply adopting the final state of the original Promise on which then was called.

但是我去ECMA上查相关的规范的时候, 发现并没有说具体的细节:

> https://tc39.github.io/ecma262/#sec-promise.prototype.then
![Promise-then](https://maicss.com/img/blog/1518059307166-promise.then.png)

唉...