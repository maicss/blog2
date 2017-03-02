# Blog

> 手写Blog咯

## todo
 - [ ] 实现一个timeline形式的说说的东西。用React和mongodb。
    - [x] 实现文字版
    - [x] 实现图片版
    - [x] 数据库操作后的数据统一返回结果`{opResStr: success, results: []}`, `opResStr: success, error, fault`
    - [x] 从网页端的增删改查
    - [x] 日志数据库
    - [x] 说说的summary自动更新
    - [x] 说说的Markdown解析
    - [x] 关键字权限控制
    - [x] 从心知天气的API获取城市的天气信息，然后存储到数据库，网页传入地理位置，然后加入天气信息。
    - [x] 修改界面到semantic-ui
    - [ ] 修改页面结构到react
    - [ ] mongoose(选作)
    - [ ] mongodb中文检索
    - [ ] webpack(选作)
    - [x] 图片的存储和显示
    - [x] 图片的压缩上传
    - [ ] 图片的压缩显示(也就是存两份图片，选作)
    - [x] 去jQuery化(semantic居然也是基于jQuery的，我输了)
    - [ ] 用react重构
    - [ ] 先把Disqus的评论框加载跟ququ弄的一样之后，做一个简单的评论框试试。
    - [ ] ~~用co库把所有的callback干掉！！！！~~等node8出来用原生等async吧
    - [ ] 添加一个日历，标记处来每个月的活动状况，用颜色表示，鼠标移入的时候显示详情
    - [x] 用js实现git的管理。如果有新增加的MD文件，渲染文件，存数据库。
    

 - [ ] 实现blog页面
    - [ ] 用Google drive的API同步网盘文件试试
    - [ ] 一个字符串的Unicode编码
    - [x] 用marked解析MD文件
    - [ ] marked 不支持标签解析
    - [ ] markdown添加tag解析，添加时间解析，添加more，添加TOC。前面三个自己写，后面用库或者参考别人的库写一份。
    - [ ] 从网盘定时同步MD文件
 - [ ] 实现用户账户控制
    - [x] 先保证HTTPS传输
    - [ ] 用到cookie和session。
    - [ ] 使用个人颁发证书的时候，Mac系统提示要输入用户名和密码才能使用key store都key，问题是每个资源都输入用户密码，一个页面成千上百个，刷新一下不就怀孕了，这不扯淡嘛，是为打开的方式不对？
 - [ ] 移动端的可访问性
 - [x] `document.cookie`获取到的一直是空字符串。这个搞定了，是因为我再设置cookie的时候，添加了httpOnly属性，js是读取不到的。
 - [ ] 精简入口文件，达到每次pull之后不重启即可更新网站。
    


## 问题

- request库是可以直接传`.pfx`文件的，没注意看，绕了一大圈，浪费了两天时间。但是也发现了两个问题，已经提issue了，不知道是我写错了，还是真BUG。
- 在公司一个后端的指导下，把自己的服务器发给自己的某个接口，当时感觉，**我X，好X**。后来发现，这就是实现了一个简单的proxy。但是算是一个思路吧，自己之前就是没想到。
- [ ] 如果是公共的网页，就直接放行，私人的网页，就需要验证双向证书。

## glossary

1, FQDN: A fully qualified domain name (FQDN) is the complete domain name for a specific computer, or host, on the Internet. The FQDN consists of two parts: the hostname and the domain name. For example, an FQDN for a hypothetical mail server might be `mymail.somecollege.edu`. The hostname is `mymail`, and the host is located within the domain `somecollege.edu`. `.edu` is the top-level domain (TLD).

2, Internet service provider (ISP)

3, `.crt` and `.cer` are the same format, just different filename extensions.

