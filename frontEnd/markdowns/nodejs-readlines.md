# Nodejs实现Python的readlines
tags: node 
date: 2017-12-11 12:29
<abstract>
使用Nodejs实现Python的readlines方法, 每次读取一行文本内容.
<abstract>
## 需求
这样的好处:

- 节省内存
- 有时候也不需要处理全部文件

Python里的readline:

- 使用方式: `for line in fs.readLines()`然后就可以直接打印每一行文件的内容了. 这里`readLines()`返回的就是一个`Generator`
- 跟Node对比可以得出, 这可以使用Node的`Generator` + `for...of`实现形式上的语法

## 思路

- 因为`for...of`不能在`Promise`上使用, 所以只能使用同步的文件读取接口
- Node的 File System里可以组合`fs.openSync`和`fs.readSync`加上每次移动读取位置实现分段读取文件
- 然后在读取文件的内容里, 根据`LF`和`CR`作为分界点分割和拼接Buffer并yield出去就行了
- 代价依赖每次读取文件设定好的chunkSize. 如果chunkSize过小, 就需要读取多次, 过大, 就出现一次读取, 可以分很多行, 如果文件本来就很小, 就相当于读完一个文件, 手动根据换行符回车符分割内容并返回了. 另外, 不知道Python源码里面咋写的, 这种读取一部分文件, 然后根据回车换行符进行分割拼接的做法, 跟Python的有啥区别, 如果Python里也是这样实现的, 那就完美了
- 也可以使用`createReadStream`实现

## 代码

```JavaScript
function * readLines (filePath) {
  const LF = 10
  const CR = 13
  // 返回值是 `File descriptor`
  const fd = fs.openSync(filePath, 'r')
  let buffer = new Buffer(0)
  // 这个chunkSize就有点大了
  const chunkSize = 512
  while (true) {
    const chunk = new Buffer(chunkSize)
    const bytesRead = fs.readSync(fd, chunk, 0, chunkSize)
    buffer = Buffer.concat([buffer, chunk])
    let startIndex = 0
    // 这里是找本次读取文件内容里有没有包含换行回车等, 然后拼接
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === LF || (buffer[i] === CR && buffer[i + 1] === LF)) {
        yield buffer.slice(startIndex, i).toString()
        if (buffer[i] === LF) {
          startIndex = i + 1
        } else {
          startIndex = i + 2
          i++
        }
      }
    }
    // 最后一次(?)
    if (startIndex > 0) {
      buffer = buffer.slice(startIndex)
    }
    // 如果chunkSize大于文件内容
    if (bytesRead < chunkSize) {
      if (buffer.length > chunkSize - bytesRead) {
        yield  buffer.toString()
      }
      return undefined
    }
  }
}
// 使用
for (let line of readLines('aa.txt')) {
  console.log(line)
}
```

## 参考
[阿里大神黑猫的知乎回答](https://www.zhihu.com/question/68505554/answer/273425924)


