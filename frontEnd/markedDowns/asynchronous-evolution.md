# javascript异步进化史

tags: javascript 异步

date: 2017-03-16 13:34

<abstract>
闲谈Javascript的异步进化史。
<abstract>
什么是异步，为啥异步就不说了。

这里用nodejs的fs模块做演示。

要实现的目标：读一个文件夹下的文件。参数是一个路径。

这里假设既有文件目录结构是这样的：

```javascript
/*
 aa
   - test.js
 bb
   - a.md => this is file1
   - b.md => this is file2
   - c.md => this is file3
*/
```

<!--more-->


以下代码都是在`test.js`里面写的，每次运行`node test.js`之后的结果都应该是`this is file1\nthis is file2\nthis is file3`。

[toc]
每个解决方案都有原生的方法示例和基于这个方案的比较流行的库的示例。

## 一代目：callback

> 为了更加完善的演示，下面的代码都带有错误处理，所以看起来很啰嗦，但是这样能显示出每个方法的异同。

### 同步

> 这个是我们的终极目标，也就是写同步的代码，但是异步执行。

``` javascript
const fs = require('fs');
const path = '../bb';

try {
    let files = fs.readdirSync(path);
    try {
        for (let file of files) {
            console.log(fs.readFileSync(path + file).toString())
        }
    } catch (e) {
        console.log('read file error: ', e);
    }
} catch (e) {
    console.log('read dir error: ', e);
}
```

### Callback

```javascript
const fs = require('fs');
const path = '../bb';

fs.readdir(path, function (e, files) {
    if (e) {
        console.log('read dir error: ', e);
    } else {
        for (let file of files) {
            fs.readFile(path + file, function (e, content) {
                if (e) {
                    console.log('read file error: ', e);
                } else {
                    console.log(content.toString())
                }
            })
        }
    }
});
```

这个方案的既有库的示例就是`jQuery`了。但是它是`Commonjs`规范下实现的产物，而ES6的`Promise`就是肯定了既定的`Commonjs`规范，所以`jQuery`的写法就是下面的原生`Promise`的写法。


## 二代目：Promise

### 原生Promise手写
```javascript
// 为了方便阅读，定义了两个函数。也可以尝试一个函数写下来……
let readDir = function(path) {
    return new Promise(function (resolve, reject) {
        fs.readdir(path, function (e, files) {
            e ? reject(e) : resolve(files)
        })
    });
};

let readFile = function (file) {
    return new Promise(function (resolve, reject) {
        fs.readFile(file, function (e, content) {
            e ? reject(e) : resolve(content.toString())
        })
    });
};

readDir(path).then(files => {
    for (let file of files) {
        readFile(path + file).then(str => console.log(str), e => console.log('read file error: ', e))
    }
}, e => {
    console.log('read dir error: ', e)
});
```
### 使用Promise库bluebird

> 这个比较厉害，建议就是替代自带的全局Promise

```javascript
const fs = require('fs');
const path = '../bb/';

global.Promise = require('bluebird');

let readFile = Promise.promisify(fs.readFile);
let readDir = Promise.promisify(fs.readdir);

readDir(path).then(files => {
    for (let file of files) {
        readFile(path + file).then(content => {
            console.log(content.toString())
        }).catch(e => {
            console.log(e)
        });
    }
}).catch(e => {
    console.log(e)
});

```



## 三代目：Generator

### 原生Generator手写

```javascript
const fs = require('fs');
const path = '../bb/';


let readDir = function (path) {
    fs.readdir(path, (e, files) => {
        if (e) {
            handle.throw('read dir error: ', e)
        } else {
            handle.next(files)
        }
    })
};

let readFile = function* (files) {
    for (let file of files) {
        let content = yield fs.readFile(path + file, (e, content) => {
            if (e) {
                handle.throw('read file error: ', e)
            } else {
                handle.next(content)
            }
        });
        l(content.toString());
    }
};

let main = function* () {
    let files = yield readDir(path);
    yield * readFile(files);
};

let handle = main();
handle.next();
```
这里还可以看出，generator函数也有自己的错误处理方式，注意是generator的，不是javascript的那个命令式的`throw Error`。

按说，这样已经不错了，最后只需要用同步的方式yield两个表达式就行了。之后我们只需要些好函数之后，把最后两句包装起来，起个好听的名字，就完事了。

而且yield同步异步的都可以搞定。

但是这总有个尾巴next，而且内部的handle必须暴露在外面，而且里面的包装写起来比较麻烦。

于是有人说，我要一个能自动执行的generator，于是就有了一个自动执行的generator……

来来来，看看一步步写出个能自动执行的generator是啥样的：

> 为了说明原理，只用一个异步函数作为示例
> 这里每块代码运行的结果都是 `[a.md, b.md, c.md]`，如果不是，不是你从copy错了就是我写错了。

 - 1，先再写一遍上面readDir，下面的函数都是改造这个。

```javascript
const fs = require('fs');
let path = '../bb/';

let readDir = function *() {
    let files = yield fs.readdir(path, (e, files) => {
        if (e) {
            aa.throw(e)
        } else {
            aa.next(files)
        }
    });

    console.log(files)
};

let aa = (readDir)();

aa.next();
```
- 2，第一次改造。目标：能运行就行。

```
const fs = require('fs');
let path = '../bb/';

let double = function(gen) {
    let iter = gen(function (err, data) {
        if (err) {
            iter.throw(err);
        }
        return iter.next(data);
    });
    iter.next();
}

let gen = function*(cb) {
    let files = yield fs.readdir(path, cb);
    for (let file of files) {
        let content = yield fs.readFile(path + file, cb);
        console.log(content.toString());
    }
}

double(gen);
```
到这里，已经算是完成了。

但是那个cb实在是扎眼，作为使用者被要求传一个啥也不干的字符串很是恶心有木有。下面就再次改造把cb干掉。

- 3，第二次改造。目标：只需要输入一个参数。

```
const fs = require('fs');
let path = '../bb/';

// 这就是currying，先声明一个只需要一个参数的函数替代原来的函数
let readDir = function (path) {
    return function (cb) {
        fs.readdir(path, cb)
    }
};

let gen = function *() {
    let files = yield readDir(path);
    console.log(files);
};

// 你没看错，就是叫co。这个就是非Promise版本的co
let co = function (generator) {
    return function () {
        let gen = generator();

        function next(err, result) {
            if (err) {
                return {error: err}
            }
            let step = gen.next(result);
            if (!step.done) {
                step.value(next);
            } else {
                return {result: step.value}
            }
        }

        next();
    }()
    // 注意这里的自执行函数
};

co(gen);

```

- 4，终极改造。目标：弄出来一个Promise自动执行的版本

```
const fs = require('fs');
let path = '../bb/';

// 但是到现在为止，我还是想不明白，上面的代码已经解决了同步代码解决异步的需求。为啥还要Promise
let readDir  = function (path) {
    return new Promise((res, rej) => {
        fs.readdir(path, function (e, data) {
            e ? rej(e) : res(data)
        });
    })
};

let gen = function * () {
    let files = yield readDir(path);
    console.log(files);
};

// 这里就是co了。只是没有那么健全
let co = function (gen) {
    return new Promise((res, rej) => {
        let g = gen();
        function next(result) {
            let ret = g.next(result);
            if (ret.done) {
                return res(ret.result);
            }

            if (!ret.value instanceof Promise) {
                throw Error('generator is not a Promise')
            }

            ret.value.then(next).catch(rej);
        }
        next()
    })
};

co(gen);
```

### 使用Generator库co

```javascript
const fs = require('fs');
const co = require('co');

let path = '../bb/';
let readDir  = function (path) {
    return new Promise((res, rej) => {
        fs.readdir(path, function (e, data) {
            e ? rej(e) : res(data)
        });
    })
};

let gen = function * () {
    let files = yield readDir(path);
    console.log(files);
};

co(gen)
```

## 终极火影：async/await

这里直接上代码，因为这个就是去掉*的generator。下面的代码很直观：

```javascript

const fs = require('fs');
const co = require('co');
const path = '../bb/';

let readFile = function (fileName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(fileName, function(error, data) {
            if (error) reject(error);
            resolve(data);
        });
    });
};

// generator 版本
let gen = function* () {
    let f1 = yield readFile(path);
    console.log(f1);
};

// async/await 版本
let asyncReadFile = async function () {
    let f1 = await readFile(path);
    console.log(f1);
};

co(gen);
asyncReadFile();
```

基于这个实现的有很多，这个我就没研究过了。而且`bluebird`和`co`也都支持这个，也有单独的`async/await`库。


## 参考

- 阮一峰老师的[ECMAScript 6 入门](http://es6.ruanyifeng.com/)
- [cnode社区](https://cnodejs.org/)的[这篇文章](https://cnodejs.org/topic/53474cd19e21582e740117df)
- [co库](https://github.com/tj/co)
- [bluebird库](http://bluebirdjs.com/docs/api/)
