# Blog

## 本地测试
- [x] 自签名证书
- [x] 添加HTTPS
- [x] 本地请求忽略自签名证书限制
- [x] 搞定本地HTTP向HTTPS的请求
- [x] 搭建一个需要单向证书认证的服务器，测试证书请求
- [x] 搭建一个需要双向证书认证的服务器，测试证书请求
- [x] 跳过CA检查
- [x] 转换JSK文件为PKCS12文件
- [x] 本地测试完之后，按照前端的接口实现一遍值的传递，搞定达到能用的状态。
- [x] 删除公司相关数据。
- [ ] 证书base64编解码
- [ ] 添加proxy，试用一下


## 线上功能
- [x] 申请证书
- [x] 域名国外DNS解析
- [x] 搭建线上HTTPS服务器
- [ ] 添加IP限制和请求限制
- [ ] 添加Markdown解析器
- [ ] 添加统计
- [ ] 定时去GitHub更新文件，解析新的MD文件，部署网页。

## todo
 - [ ] 实现一个timeline形式的说说的东西。用React和mongodb。
    - [x] 实现文字版
    - [x] 实现图片版
    - [x] 数据库操作后的数据统一返回结果`{opResStr: success, results: []}`, `opResStr: success, error, fault`
    - [x] 从网页端的增删改查
    - [ ] 日志数据库
    - [ ] 说说的summary自动更新
    - [ ] 说说的Markdown解析
    - [x] 关键字权限控制
    - [x] 每天定时从心知天气的API获取几个城市的天气信息，然后存储到数据库，网页传入地理位置，然后加入天气信息。
    - [ ] 修改界面到semantic-ui
    - [ ] 修改页面结构到react
    - [ ] mongoose(选作)
    - [ ] webpack(选作)
    - [x] 图片的存储和显示
    - [ ] 图片的压缩上传
    - [ ] 图片的压缩显示(也就是存两份图片，选作)
    - [ ] 去jQuery化
    - [ ] 用react重构
 - [ ] 实现blog页面
    - [ ] 用marked解析MD文件
    - [ ] 从网盘定时同步MD文件


## 问题

- request库是可以直接传`.pfx`文件的，没注意看，绕了一大圈，浪费了两天时间。但是也发现了两个问题，已经提issue了，不知道是我写错了，还是真BUG。
- 在公司一个后端的指导下，把自己的服务器发给自己的某个接口，当时感觉，**我X，好X**。后来发现，这就是实现了一个简单的proxy。但是算是一个思路吧，自己之前就是没想到。
- [ ] 如果是公共的网页，就直接放行，私人的网页，就需要验证双向证书。

## glossary

1, FQDN: A fully qualified domain name (FQDN) is the complete domain name for a specific computer, or host, on the Internet. The FQDN consists of two parts: the hostname and the domain name. For example, an FQDN for a hypothetical mail server might be `mymail.somecollege.edu`. The hostname is `mymail`, and the host is located within the domain `somecollege.edu`. `.edu` is the top-level domain (TLD).

2, Internet service provider (ISP)

3, `.crt` and `.cer` are the same format, just different filename extensions.

