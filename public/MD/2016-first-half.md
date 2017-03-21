# 博客统计报告（2016 上半年）

tags: blog-analysis

date: 2016-08-12 12:12


从 2008 年到现在，我写独立博客已经有八个年头了。这期间我的域名从一开始的 qgy18.com 换成了 imququ.com，博客程序也换过好几版。在这过去的八年里，我从未公开过本博客统计相关数据。

最近我在 v2ex 无意中提到本博客每天有三五千 PV 时，某位同学提出了疑问：

> 这样的网站平时也有三五千？？？流量来源哪里？（[via](http://v2ex.com/t/276973#r_3152734)）

<!--more-->

这几年，身边坚持写原创文章的人越来越少，其中一大部分还被微信公众号、知乎专栏、简书等平台给吸引过去，愿意经营独立博客的人更是少之又少。也难怪 v2ex 那位同学会有这样的疑问：在信息早已泛滥的今天，独立博客还有人看吗？

本文通过公布本博客在 ***2016-01-01*** 到 ***2016-05-25*** 这 145 天里的访问情况及流量来源，对前面的问题做一个正面回应。

### 会话数与浏览量

我的博客通过自己实现 JavaScript 统计代码 + 服务端转发的方式使用 Google 统计。相比直接使用 Google 统计代码，对统计代码逻辑进行了大幅精简并本地化之后，对页面性能的影响可以降到最低。而在服务端通过 Node.js 将统计请求异步转发给 Google Analytics API，可以解决 Google 统计在国内访问不畅的顽疾。最后，相比[将统计逻辑完全挪到后端](https://darknode.in/network/nginx-google-analytics/)，本方案可以有效过滤那些来自不支持 JS 的爬虫、扫描工具等非正常流量。

过去的 145 天里，本博客的基本访问情况如下图：

<img alt="blog-stat-session-and-pv" src="https://st.imququ.com/static/uploads/2016/05/blog-stat-session-and-pv.png" width="900" />
 
这期间，本博客一共迎来了 120,020 位用户，他们一共产生了 198,390 次会话以及 464,219 次浏览。平均每天 828 位用户、1,368 次会话以及 3,202 次浏览。

这张图表有几个有意思的地方：

* 也许是假期大家普遍都会出去玩，假期流量比平时低很多。这也使得上面这张图表的波谷跟国家法定节假日非常吻合（例如二月份的春节、四月份的清明节、五月份的劳动节及平时周末）；
* 图表中一些比较小的波峰一般是当天发表了新文章。那个异常突起的波峰是因为当天有人在 v2ex 发了[这样一个帖子](http://v2ex.com/t/276646)，引发了大量好奇用户的来访。但是这部分意外流量并没有带来多少真正的用户 —— 流量马上就跌回去了；

### 地理位置与语言

毫无疑问，本博客主要流量都来自于中国大陆，占到 81.29%；排名第二的台湾只占到 5%，跟美国差不多：

<img alt="blog-stat-country" src="https://st.imququ.com/static/uploads/2016/05/blog-stat-country.png" width="568" />

而从浏览器语言上看，简体中文占到 77.29%，也就是说并不是国内用户都会使用中文系统（我的 OSX 一直是英文版）；英文占到了 16.84%：

<img alt="blog-stat-language" src="https://st.imququ.com/static/uploads/2016/05/blog-stat-language.png" width="568" />

本站针对浏览器语言为英文的用户做了一些特别策略，例如：1）~~加载 Google 翻译工具~~已去掉；2）Disqus 使用英文界面。

### 操作系统与浏览器

首先来看操作系统概况，本博客主要流量还是来自于桌面端，占到 88.92%；来自移动端的流量有 9.99%；而平板只有 1.09%。

我的文章经常包含大量代码和外链，通过桌面浏览器访问能获得最好的体验；移动端的优势是方便，可以随时随地阅读；而随着手机屏幕越来越大，平板被逐渐边缘化：

<img alt="blog-stat-platform" src="https://st.imququ.com/static/uploads/2016/05/blog-stat-platform.png" width="720" />

从具体的操作系统统计中可以看出，做为一个技术类博客，来自 Windows 的流量已经只有一半多点，Mac OS 占到了 30.57%，其余份额基本被 Android、iOS 和 Linux 所瓜分。

我从 2011 年开始使用 Mac OS，个人认为就程序开发这一行而言，一台装好各种好用软件的 Mac 电脑，绝对可以大幅提升开发效率。

<img alt="blog-stat-os" src="https://st.imququ.com/static/uploads/2016/05/blog-stat-os.png" width="720" />

浏览器方面，由于本博客完全面向程序员，来自 IE 的份额不足 2%，这意味着我可以尽情尝试各种新技术：

<img alt="blog-stat-browser" src="https://st.imququ.com/static/uploads/2016/05/blog-stat-browser.png" width="720" />

### 流量来源

本博客流量来源主要有搜索引擎、第三方网站引荐、直接访问三大块。完整统计如下：

<img alt="blog-stat-refer-group" src="https://st.imququ.com/static/uploads/2016/05/blog-stat-refer-group.png" width="720" />

Google 对原创博客非常友好，使用 HTTPS 并提高访问速度也有利于 Google 权重，所以本博客在 Google 的排名非常好，最终高达 37.22% 的流量均来自于 Google 搜索。而百度对原创博客就没有这么友好了，但基于它在国内庞大的市场份额，本博客也有 8.71% 的流量来自于百度：

<img alt="blog-stat-refer-site" src="https://st.imququ.com/static/uploads/2016/05/blog-stat-refer-site.png" width="720" />

### 成本和收入

改用 Let's Encrypt 证书之后，本博客的运营成本只有两部分：1）VPS：为了让本站在国内外都有不错的访问速度，本站同时部署在「阿里云 ECS - 青岛」、「Linode - Tokyo2」~~和「Vultr - Sydney」~~；2）域名：我的域名在 [namesilo](https://www.namesilo.com) 购买，续费需要 $8.99 每年。两项成本加起来大约在 ￥2000 每年，尚可接受。

本博客没有投放任何广告，但我前些时尝试在文章末尾加上了「[赞助本站](https://imququ.com/post/about.html#toc-2)」链接（注：已去掉）。截至到当前，我收到的现金赞助接近 ￥200，阿里云推荐码返利 ￥375，Linode 返利 $20。这个结果实际上已经超出了我的预期，也给了我很大的鼓励。

如果你认为我的文章对你有帮助，欢迎将本站推荐给你的小伙伴！

### 后记

在 2016 年已经过去的这五个月里，我一共写了 17 篇文章，如果保持这个更新频率，今年的总文章数会达到 43 篇，与去年的 54 篇有一定差距。但这并不是关键，我从来都不会刻意追求文章数量，我更关心每篇文章是否能给读者带来帮助。

从三年前买 Kindle 开始，我一直在坚持阅读各类书籍。最近，我又开始坚持做另外一件事：跑步。很多事情在刚开始时，并不能预料到它最终会给自己带来什么。我的观点是刚开始别想那么多，先坚持做下去。只要能长期投入，最终一定能从中找到乐趣和成就感。这也是我能坚持写博客的主要原因。

让人开心的是，就运营独立博客这件事而言，身边不少朋友仍在坚持。最后，推荐几个这样的博主，欢迎大家关注：

* [十年踪迹的博客](https://www.h5jun.com/)，前端业界知名人士月影大牛的博客，内容涵盖 JavaScript、算法、程序员成长等话题。行文流畅，深入浅出。每一篇都是干货，强烈推荐。
* [罗磊的独立博客](https://luolei.org)，博客主题广泛，技术、读书、运动、旅游都有。思想有深度，文字有力量，配图很舒服。
* [小胡子哥的个人网站](http://www.barretlee.com/entry/)，富有想法，精力充沛的小伙子。愿意折腾，乐于分享。

原文链接：[https://imququ.com/post/first-half-of-2016-blog-analytics.html](https://imququ.com/post/first-half-of-2016-blog-analytics.html)，[前往原文评论 »](https://imququ.com/post/first-half-of-2016-blog-analytics.html#comments)
