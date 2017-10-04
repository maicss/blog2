# Change log
## 一般
- [x] 搞懂了简易版的HTTPS认证机制，弄出来了一个双向认证和单向认证的服务器
- [x] 用[acme.sh](https://github.com/Neilpang/acme.sh)申请网站HTTPS证书
- [x] 使用Fetch API
- [x] 看看XMLHttpRequest 2更新了什么，并使用`progress`做了图片上传进度
- [x] 修改协议为HTTP2。
- [ ] nodejs HTTP2为标准模块的时候使用原生的重写。
- [ ] webpack配置
- [ ] sass、postcss使用
- [ ] 再做一个使用vuex的小东西
- [ ] 试试websocket

## 说说
- [x] 添加图片功能
- [x] 添加天气功能
- [x] 添加总结模块，并提供过滤
- [x] 添加说说内容的markdown解析
- [x] 添加说说权限功能
- [x] 前端Vue重构
- [x] 添加说说的再编辑功能
- [x] 添加说说的删除功能

## 博客

- [x] 扫描指定本地文件夹，使用markdown解析，并存储到数据库
- [x] 根据[marked](https://github.com/chjj/marked)定制自己的markdown解析，添加`toc`等功能。并发布到[npm](https://www.npmjs.com/package/maic-marked)
- [x] 添加评论功能[gitment](https://github.com/imsun/gitment).


## 首页
- [x] 写了一个[500px](https://500px.com)的定时爬虫，每天爬取编辑精选图片存储到本地和数据库
- [x] 实现前端背景图的展示
- [x] 实现前端的喜欢和不喜欢功能 [后端删除数据库信息并移动文件到指定文件夹]

## 图床
> markdown文章会用到，v2ex之类的网站也会用到
- [x] 批量上传图片
- [x] 预览图片
- [x] 上传前自动图片压缩分辨率，最高分辨率为1000
- [x] 上传完毕后，直接点击按钮，复制当前图片链接


## 后端

- [x] 使用`express`作为后端web框架，实现了文件上传和cookie控制
- [x] 使用`mongodb`为数据库，手写了ORM的部分
- [x]  使用async重写后端
- [x]  使用`mongoose`重写ORM部分
- [x]  使用`koa 2`重写后端框架
- [x]  写了简易的图片上传中间件
- [ ]  重构API，尽量使用语义化的 HTTP Method，尽量实践RESTful API
- [ ]  弄一个完整的JSDoc
- [ ]  使用`supertest`, `mocha`, `should`写测试用例，覆盖率
- [ ]  使用Typescript重构
- [ ]  使用`helmet`添加了SCP、HSTS
- [ ]  使用OAuth
- [ ]  使用JWT
- [ ]  网站访问频率控制

## 其他

