# sleep的那点事

tags: async-abort
date: 2018-02-05 17:40

<abstract>
关于异步取消或者终止
<abstract>

最近被问到的一个问题

> 写一个sleep

这个很简单, 用Promise:

```javascript
const sleep = ms => new Promise((res, rej) => {setTimeout(res, ms)})
```

然后:
> 写一个能cancel的sleep

当时我懵逼了. 一时间想不出来, 回来写出来了, 但是发现主要是受测试case的影响...

```javascript
const sleep = {
  timer: null,
  promise: null,
  start: ms => {
    this.promise = new Promise ( (res, rej) => {
      this.timer = setTimeout(rej, ms)
    })
    return this.promise
  },
  cancel: _ => {
    clearTimeout(this.timer)
    return Promise.reject(this.promise)
  }
}
```

这个是写好了, 看测试代码:

```javascript

console.time('used')
sleep.start(5000).then(d => console.timeEnd('used'))
sleep.cancel().catch(e => console.timeEnd('used'))
```
但是不能使用这个测试:

```
(async _ => {
  try {
    console.time('used')
    await sleep.start(5000)
    sleep.cancel()
    console.timeEnd('used')
  } catch (e) {
    console.error(e)
  }
})()
```
但是当时我考虑的就是使用这段代码来测试, 因为第一个问题写的测试就是用`async`写的, 严重影响到了这个的测试case, 当时也在想`await`好像不能取消的吧, 难道是我没看到相关的东西?

然后我去搜了一下, 发现了[这个](https://github.com/tc39/ecmascript-asyncawait/issues/27)

二楼的tc39成员说的大概意思是: await算是一个子进程, 只能用事件的方式终止. 目前没有好的办法做这个. 而且bterlson(这个项目的拥有者, 应该是委员会的成员)说了一句, 大家都实现的时候, 我们就加上, 现在没有一个实现, 就先别bb了(好像是这个意思? 翻译错了别打我), 这也太保守了, 保守到讨论都被close掉...



