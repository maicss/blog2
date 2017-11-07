# CURL 笔记

tags: HTTP curl

date: 2017-04-03 13:04

<abstract>
curl在日常使用中，我主要用在两个地方：一是下载文件，这个还包括了之后的安装脚本之类的；另外一个就是测试网络。

感觉用起来不错，但是原来看的都是零零碎碎的，这次总结一下。
<abstract>

<!--more-->

[toc]

## 下载文件

``` bash
# 指定文件名
curl -o filename someURL 
# 使用默认的文件名
curl -O someURL
# 断点续传
curl -C -o someURL
```

## 网络测试

```bash
# 直接访问(也即获得这个页面的源码)
curl someURL
# 只显示头部信息
# 其实这个就是-X HEAD方法，但是这个更安全一些，因为有的服务器不支持HEAD方法
curl -I someURL
# 显示头部信息和页面源码
curl -i someURL
# 显示连接信息
curl -v someURL
# 显示连接详细信息
curl --trace someURL
# 重定向
curl -L someURL

# get访问和get提交表单直接使用即可，默认就是get
# 指定HTTP方法
curl -X POST/PUT someURL
# POST有参数的时候，可以直接加上参数，就默认使用的是POST
curl -d/--data 'a=1&b=2' -d @file someURL
# encode 参数
curl --data-urlencode "名称=小明" someURL
# 表单提交
curl -F/-form name1=value1 -form name2=value2 someURL
# referer
curl --referer url someURL
# user agent
curl -A/--user-agent "Mozilla/5.0 xxxx" someURL
# 访问时加上cookie
curl --cookie "name=aaa" someURL
# 保存服务器返回的cookie
curl -c cookieFile someURL
# 从文件中读取cookie然后访问
curl -b cookieFile someURL
# 添加访问header
curl -H/--header "Content-Type: application/json" someURL
# HTTP认证
curl -u name:password someURL
# 访问时带上HTTP证书
curl --cert mycert:mypassword --cert-type PEM --key mykey --key-type PEM someURL
#访问时忽略证书
curl -k someURL
#添加代理
curl -x/--proxy proxyURL someURL
```

## 和wget的区别

> 这些是curl的作者说的，算是相当有权威性。我英语很烂的，一边有道一边翻译的，估计翻译的很差劲，有啥问题直接在下面评论即可，也可以给我发邮件。

### 相同点
- 都是CLI工具，都能从FTP, HTTP和HTTPS下载东西
- 都支持HTTP POST请求
- 都支持HTTP cookies
- 都是非UI应用，能像使用脚本一样使用
- 都是开源免费的软件
- 都是90年代开始的项目
- 都支持[metalink](http://www.metalinker.org/)（一种记录了BT服务器地址和所需镜像的XML文件）
### wget
- Wget只能使用命令行，没有相关的库。
- 能递归下载！这是和curl一个很大的区别（用这个能爬站）。
- 较为年长。开始于1995年，而curl开始于1996（逗逼作者）。
- 证书为GPL。wget完全遵循GPL V3标准，而curl是MIT。
- 是一个GNU软件。Wget是GNU工程的一部分，FSF拥有所有权，而curl项目是完全独立的，不丛属任何机构或者组织，所有权归Daniel所有。
- 下载东西的时候，Wget不需要使用任何参数，而curl要使用-o或者-O才可以（逗逼）。
- 在TSL上，Wget只支持GnuTLS和OpenSSL。
- 在代理认证上，Wget只支持Basic auth。
- Wget不支持SOCKS。
- 支持断点续传。curl没有这点（但是最近添加了还是怎么了，上面的-C就是断点续传的）。
- Wget默认开启了很多属性，如cookies, redirect-following, time stamping from the remote resource等等，在cur里这些都需要手动开启。
- wget命令能只用一个左手就全部键入（逗逼，而且二指禅的我还做不到这点）！
### curl

- 是一个库。curl构建于libcurl，这是一个跨平台有稳定的API的库。这是因为创作这个软件的出发点就不一样。所以这个工具不只是一个命令行工具，所以使用起来也有一丁点的麻烦。
- pipes。curl能像unix的cat命令那样显示，直接向stdout输出，从stdout读取数据。是"everything is a pipe"理念的践行者。wget更像是cp命令的行为。
- Single shot（这个咋翻译(╯°□°）╯︵ ┻━┻）。 curl就是用来做最基本的数据传输，（译注：不会事先为你想好要做什么，可定制的程度比较大，上手难度也就比较大）只传输用户指定的数据，不会递归的下载资源，不会带有任何用户没有指定的逻辑。
- 支持更多协议。curl支持FTP, FTPS, Gopher, HTTP, HTTPS, SCP, SFTP, TFTP, TELNET, DICT, LDAP, LDAPS, FILE, POP3, IMAP, SMB/CIFS, SMTP, RTMP and RTSP。而Wget只支持HTTP, HTTPS and FTP.
- 支持更多平台。curl的出发点就是跨平台，所以支持的平台比wget要多，比如：OS/400, TPF和其他更不常见的unix平台。
- 对SSL的支持更加完善。curl可以使用11种不同的SSL库进行构建（11！作者就是这样写的，意思就是让子弹飞的9种方法搞死他，9种！！），而且支持更多对协议细节的定制。
- HTTP认证。支持更多的认证方式，特别是HTTP proxy。如: Basic, Digest, NTLM and Negotiate。
- SOCKS。支持更多的socks协议。
- 双向性。curl提供了上传和发送的能力，而wget只提供了简单的HTTP POST支持
- HTTP multipart/form-data。这个是模仿浏览器向服务器上传东西用的。
- curl支持gzip压缩，Content-Encoding，自动压缩数据。
- curl offers and performs decompression of Transfer-Encoded HTTP, wget doesn't
- curl支持HTTP/2。这是个双全工而且效率很高的协议（作者使用的是Happy Eyeballs这个词，好诡异）。
- 支持更多的开发者定制。而且这个是可以讨论的。我给出了三个（更新的）渠道：（支持）邮件列表，经常提交，经常释放新版本。任何关注这两个项目的人，都能看得出来，curl的项目更加与时俱进，而且这已经持续了10多年，你可以从openhub（的代码）上看得出来。


## 总结

从上面看来，日常使用wget已经够了，毕竟家里只要有一个双头中号的螺丝刀就能满足大部分需求了，谁也不会都买一个完整的造价近200块的一个工具箱。简单，方便，满足大部分需求就已经很不错了。

curl入门稍高一点点，但是学会了就更加得心应手，更能满足处女座定制的需求。

至于我，我肯定选curl啊，为啥？因为有逼格啊。


而且：
(chrome)[https://maicss.com/img/blog/1510047203024-chrome-curl.png]
(firefox)[https://maicss.com/img/blog/1510047203024-firefox-curl.png]
(chrome)[https://maicss.com/img/blog/1510047203024-safari-curl.png]
