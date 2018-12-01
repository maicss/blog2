# FETCH API

date: 2018-08-14 15:11
tags: fetch

<abstract>
fetch 笔记
<abstract>

## 简介
目前请求主要有两种方式`XMLHTTPRequest`(下面简称`XHR`)和`fetch`。

1，`XHR`是`ECMAScript`规范；`fetch`是`whatwg`的标准，也就是HTML的标准。

> 关于HTML标准，还有一个叫`W3C`的组织。关于他俩，可以简单的认为：`W3C`的后台是IE，`whatwg`的后台是opera，chrome，firefox，safari。

2，`XHR`是基于事件的，比如`onload`；`fetch`是基于`Promise`的。虽然`XHR`也可以使用`Promise`封装，但是这里说的是原生的。

3，那些说`XHR`不能上传二进制的都是骗人的，现在`XHR`也升级了，到了`XHR2`，可是设置`responseType`了。那些说`fetch`不能携带cookie的，也是骗人的，只不过`XHR`是自带，`fetch`需要手动设置要不要携带cookie。

4，`XHR`可以监听上传进度(`onprogress`)，可以中止(abort)，这些`fetch`都不行。有这个需求的，请绕道，或者使用封装好的`XHR`，然后起名字叫`fetch`的[滑稽]，比如[GitHub的fetch](https://github.com/github/fetch)。也不支持timeout。这些都是XHR自带的。

5，注意点：fetch不会因为responseCode是4xx或者5xx就抛出错误，这个要自己处理。

6，在cors的时候，遇到404问题，fetch会报`fetch error`， 给出`Response for preflight does not have HTTP ok status.`，然后直接报错`TypeError: Failed to fetch`，也不能正常拿到返回信息。这个现在无解。

7，service work是fetch的重度使用者，而且fetch的API设计的比较人性化，虽然有上面的种种不足，但是大家还是喜欢这个API。

如果上面的都没问题，那就接着往下看。
## 基本语法

```javascript
fetch(url, options)
.then(res => console.log(res))
.catch(e => console.error(e))
```

url: 
```
一个url字符串，或者Request对象。
注意：URL里不能携带认证信息，如`fetch('https://aa:123@example.com')`，这样会报`TypeError`
```

options:
```javascript
{
    // 默认值 get， 
    "method": "GET",
    // GET和HEAD方法不能携带body
    "body": "",
    // Headers对象或者包含ByteString的对象
    "headers": {
        "Content-Type": ""
    },
    // cookies 等认证信息控制，
    //      same-origin: 在当前域名下携带认证信息
    //      "omit": 不携带认证信息
    //      include: 所有请求都携带认证信息
    "credentials": "same-origin",
    // 跨域控制
    //      cros
    //      no-cros
    //      same-origin
    //      cors-with-forced-preflight: 这是专门针对 xhr2 支持出来的 preflight，会事先多发一次请求给 server，检查该次请求的合法性
    "mode": "same-origin",
    // 缓存控制
    //      default
    //      no-store
    //      reload
    //      no-cache
    //      force-cache
    //      only-if-cached
    "cache": "default",
    // 重定向
    //      follow 自动重定向
    //      error 如果产生重定向，则抛出错误
    //      manual 手动处理重定向 chrome 47之后的默认值
    "redirect": "follow",
    // 引用的url
    //      no-referrer 
    //      client 自动，默认值
    //      URL 手动指定URL
    "referrer": "client",
    // 见下方的名词解释
    "referrerPolicy": "",
    // 见下方的名词解释
    "integrity": ""
}
```

body: body常常需要和headers的`Content-Type`结合起来使用

|内容类型|contentType类型|
|--|--|
|字符串| text/plain;charset=UTF-8|
|[URL参数](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)|application/x-www-form-urlencoded;charset=UTF-8|
|[表格数据/上传文件](https://developer.mozilla.org/en-US/docs/Web/API/FormData)|multipart/form-data|
|Blob|自动携带|
|ArrayBuffer/TypedArray/DataView|--|
|||

response 

 - status: 返回的状态码. 100~500+
 - statusText: 返回状态码代表的含义. 比如, 返回"ok".
 - ok: 用来检差 status 是否在200和299之间.
 - type: 表示请求是否跨域, 或是否出错. 取值为: 
    - basic 同域通信类别. 可以正常的访问 response 的 header(除了 Set-Cookie头).
    - cors 跨域通信类别. 一般只能访问以下的头: Cache-Control Content-Language Content-Type Expires Last-Modified Pragma
    - default
    - error 网络错误类别
    - opaque 无法理解类别. 当使用 no-cors 发送跨域请求时,会触发.


## 函数封装

```javascript
const request = (url, options) => {
    const _options = Object.assign({
      'method': 'GET',
      'credentials': 'same-origin',
      'mode': 'same-origin',
      'cache': 'default',
      'redirect': 'follow',
      'referrer': 'client',
      'headers': new Headers()
    }, options)
    _options.method = _options.method.toLocaleUpperCase().trim()
    const methodEnum = ['GET', 'OPTION', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH']
    if (!methodEnum.includes(_options.method)) {
      throw RangeError('Invalid Method: ' + _options.method)
    }
    if (_options.method === 'GET' || _options.method === 'HEAD') {
      // 删除不应该有body的请求
      if (_options.body) {
        console.warn(`${_options.method} should not has attribute BODY`)
        delete _options.body
      }
    } else if (_options.body instanceof FormData) {
      _options.headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8')
    } else {
      _options.body = JSON.stringify(_options.body)
      _options.headers.set('Content-Type', 'application/json;charset=UTF-8')
    }

    const parserBody = headers => {
      const contentTypeWithCharset = headers.get('Content-Type')
      let index = contentTypeWithCharset.indexOf(';')
      let contentType
      if (index > -1) {
        contentType = contentTypeWithCharset.substr(0, index)
        if (contentTypeWithCharset.indexOf('charset=UTF') < 0) {
          console.warn('response charset not utf8')
        }
      } else {
        contentType = contentTypeWithCharset
      }

      /**
       * content type 大致分五种
       * text/* image/* video/* audio/* application/*
       * 这里分三类处理，text，file，json
       * 还有一种是multipart，这个只在服务端使用
       * */
      if (contentType === 'application/json') {
        return 'json'
      } else if (contentType.startsWith('text/') || contentType.startsWith('application/')) {
        return 'text'
      } else {
        return 'file'
      }
    }

    let contentType

    const handleResponse = async response => {
      /**
       * todo response 还有arrayBuffer() 和 formData() 获取内容的两个方法
       * 另外还有clone() 方法
       * */
      contentType = parserBody(response.headers)
      if (response.ok) {
        if (contentType === 'json') {
          return response.json()
        } else if (contentType === 'text') {
          return response.text()
        } else {
          return response.blob()
        }
      } else {
        // handle error
        if (contentType === 'json') {
          response.entities = await response.json()
        } else if (contentType === 'text') {
          response.entities = await response.text()
        } else {
          // 一般情况下，如果出错，服务端是不会返回其他类型的内容的
          throw Error(contentType)
        }
        return Promise.reject(response)
      }
    }

    return (_options.method === 'HEAD' || _options.method === 'OPTION')
      ? fetch(url, _options)
      : fetch(url, _options)
            .then(response => handleResponse(response))
  }
```


## 测试

前提：`const baseUrl = https://httpbin.org`

```javascript
// get
request(baseUrl + '/')
// get json
request(baseUrl + '/get')
// get with param
request(baseUrl + '/get?aa=12&bb=22', {mode: 'cors'})
// post
request(baseUrl + '/post', {body: {aa: 11, bb: 22}, method: 'post', mode: 'cors'})
// patch
request(baseUrl + '/patch', {mode: 'cors', body: {aa: 22, bb: 12}, method: 'patch'})
// put a file by formData
const form = new FormData()
form.append('aa', '12')
document.querySelector('input').onchange = (e) => {
  form.append('file', e.target.files[0], e.target.files[0].name)
  console.log(e.target.files)
  request(baseUrl + '/put', {body: form, mode: 'cors', method: 'PUT'})
    .then(d => console.log('success:', d))
    .catch(e => console.error('error:', e))
}
// OPTION 这个 不用测，每次发请求的时候就能看到了
//delete
request(baseUrl + '/delete', {mode: 'cors', body: {aa: 11, bb: 22}, method: 'DELETE'})
```

## 名词解释

### referrerPolicy
背景

因为一般情况下，浏览器由一个页面跳转到另外一个页面的时候，会自动带上`referrer`字段，代表请求来源。但是这样可能会导致一些安全问题。比如请求URL里包含敏感信息的时候。这时候就出现了Referrer Policy。

 - No Referrer：任何情况下都不发送 Referrer 信息；
 - No Referrer When Downgrade：仅当发生协议降级（如 HTTPS 页面引入 HTTP 资源，从 HTTPS 页面跳到 HTTP 等）时不发送 Referrer 信息。这个规则是现在大部分浏览器默认所采用的；
 - Origin Only：发送只包含 host 部分的 Referrer。启用这个规则，无论是否发生协议降级，无论是本站链接还是站外链接，都会发送 Referrer 信息，但是只包含协议 + host 部分（不包含具体的路径及参数等信息）；
 - Origin When Cross-origin：仅在发生跨域访问时发送只包含 host 的 Referrer，同域下还是完整的。它与 Origin Only 的区别是多判断了是否 Cross-origin。需要注意的是协议、域名和端口都一致，才会被浏览器认为是同域；
 - Unsafe URL：无论是否发生协议降级，无论是本站链接还是站外链接，统统都发送 Referrer 信息。正如其名，这是最宽松而最不安全的策略；

### Subresource Integrity

简称SRI，子资源完整性。允许浏览器检查获得资源是不是安全的一种手段。用在网站引入外部资源，如CDN的时候的安全检查。

格式：

Base64编码的字符串。


内容：

由两部分组成：
 - 哈希算法，如sha256、sha384、sha512等
 - 文件哈希

举例：
```
sha384-oqVuAfXRKap7fdgcCY5uykM6+
```
原理：

原理就是把你想要加载的js/css等文件求一个hash，

方法：

```bash
cat FILENAME.js | openssl dgst -sha384 -binary | openssl enc -base64 -A
```
使用：
```
<script integrity="SRI"></script>
<link integrity/>
```

### HTTP Method

安全和幂等
> 方法的幂等（idempotent）：多次对服务端的API请求和只执行一次的结果一样。
> GET HEAD PUT DELETE OPTIONS是幂等的。POST不是。
> 方法的安全（safe）：方法会不会修改服务器的数据。因为有新的数据出现，就会导致服务端风险的存在。如果GET一个资源，服务端记录了这个日志，也产生了新的数据，但是这个跟HTTP Method没关系，这个GET也是安全的。
> GET HEAD OPTIONS 是安全的。安全的一定是幂等的。

PUT、POST和PATCH（RESTful）
> 这个定义我看的有点混，理解不透。Github APIv3是RESTFul的，里面有PATCH的使用

 - PUT：新建或替换，内容为请求体的全部内容。
 - POST：局部更新资源内容。这个有时候和PUT的功能一样，但是区别在URL上，PUT指定资源的真是URL，比如/article/1，而POST只负责提交资源，不负责URL，如/article
 - PATCH：局部更新。这个只需要返回局部更新的资源，或者204就好

