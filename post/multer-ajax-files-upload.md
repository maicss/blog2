# 使用express和multer实现文件异步上传

tags: express node multer ajax

date: 2017-02-02

[toc]

最近在倒腾手写Blog，第一次。随便逛的时候，老是会看到大神手撸Blog，而且大部分还都是在大学里完成的，压力山大。

一直有一个想法，就是自己也能手撸一个。这样没多大意义，可能也不健壮，SEO也不好，界面也不好看。但是最起码能前后端自己走一遍，而且还能作为自己之后所有想玩的新技术什么的实验场地。

一直有一个想法，就是自己也能手撸一个。这样没多大意义，可能也不健壮，SEO也不好，界面也不好看。但是最起码能前后端自己走一遍，而且还能作为自己之后所有想玩的新技术什么的实验场地。

模仿腾讯的说说，自己也做了一个，这个功能对我来说也是满需要的。说说肯定要支持上传图片的功能啦。为了这个功能也折腾了好久，发现前端还是有很多自己不知道的东西。好难过☹️。

<!--more-->

## 使用到的东西

- [FileReader](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader)
- [FormData API](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/FormData)
- [Canvas](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)

嗯，就这么多。

## 开始


