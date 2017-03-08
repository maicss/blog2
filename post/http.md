# http 链接

tags: http nodejs

date: 2017-03-06

[toc]

node http随手记。

<!--more-->

## 重用TCP链接

为了重用TCP链接，http模块包含了一个默认的客户端代理对象http.globalAgent.

默认情况下，通过ClientRequest对象对同一个服务端发起的HTTP请求最多可以创建5个链接，后续的请求需要等待某个请求完成服务后才能f发出。它的实质是一个链接池。

Agent对象的sockets和requests属性分别表示当前链接池中正在使用的链接数和处于等待状态对链接数，在业务中监视这两个值有助于发现业务发繁忙程度。

webSocket和HTTP一样，都是基于TCP实现的。但是WebSocket能够实现在只建立一个TCP链接的情况下实现双向通信。相对HTTP有更小的报头。但是在现代浏览器中，WebSocket链接的建立是用HTTP握手实现的。