# Puppeteer Demo

date: 2017-10-30 19:14

tags: 测试 Puppeteer

<abstract>
最近工作中修改底层的错误处理功能，而且项目都是特别零散的，各有不同，就需要修改完成之后，要点遍看看有没有跟预期一样。
全部手动点击，选一个错的条件试下拉选框里的值。点了几个页面之后把自己点SB了，想到了之前想用来写爬虫的Puppetter。
<abstract>

## 项目介绍

是Chrome官方出的，为Node创建的一个库。基于DevTools protocol。

官方的介绍在[这里](https://developers.google.com/web/updates/2017/04/headless-chrome), 项目的[GitHub](https://github.com/GoogleChrome/puppeteer)和[在线使用地址](https://try-puppeteer.appspot.com/)

官方的介绍里面，可以得到几个游泳的信息：

- 本地的Chromium系浏览器都可以使用headless模式运行，只是现在还不太完善等等
- Puppeteer是为了Node更好的使用headless chrome创建的一个库
- Node应用测试的时候，也可以使用Chromium系的浏览器，只要配置好端口就行。默认端口是9222。
- Puppeteer默认会下载蓝色的Chrome浏览器（也就是Dev版本），但是如果本地有Chromium系的浏览器，可以通过设置环境变量的方式使用本地浏览器运行相关项目。

**个人经验**：

因为我为了把自己使用的浏览器和公司使用的浏览器进行隔离，就安装了chrome正式版（自己用）和chrome canary（公司用）。因为Dev版本和正式版会使用同一个核心，所以不能同时启动两个（在默认安装环境下，这个其实可以通过安装路径什么的修改的，我没试）。倒是canary和正式版可以同时打开，我就使用了这两个。

原来我也试过使用这俩的环境变量安装Puppeteer，但是后来试了一次放弃了，因为这样会让我和正在看的网页弄混淆，而且公司外网网速也不错，半分钟就安装好了，也就没设置。

使用Chrome调试Node应用我也试过了，也蛮不错，在没有Jetbrains家的IDE的时候可以用用，还是会比VSCode来的爽快一点。方式：`node --inspect script.js`。默认端口9222，这个时候你本地运行的所有Chromium系浏览器的Dev tools 的左上角都会显示一个Node正六边形的绿色标志。点击一下就知道怎么用了。当然也可以指定端口。这里就不细说了。

第一次知道这个东西，是因为每次chrome更新之后，打开Dev tools时，会提示更新的内容，我都会点进去大概的看一遍，有新奇的玩意也会试试。

## 项目使用

> 注意，这个项目变化很快，API一个版本一变都很正常，使用的时候要注意。本文使用的是`0.13.0`

项目使用是比较简单的，因为之后两个动作：select选择一个值，点击搜索按钮，然后看页面渲染的错误信息是不是自己想要的。

代码如下：

```javascript

const puppeteer = require('puppeteer')

// 账号密码
const user = {
  email: 'xxx',
  pwd: 'xxx'
}

// 假数据
const CODE = 'aaa'

// 准备好需要交互的元素的选择器，这里可以无脑的打开浏览器的元素查看器，然后找到对应元素，右键 Copy --> Copy selector就完事了。
// 登录页面的三个交互按钮
const EMAIL_SELECTOR = '#securityCarousel > div > div.item.active > form > div:nth-child(3) > input'
const PWD_SELECTOR = '#password-field'
const SUBMIT_SELECTOR = '#securityCarousel > div > div.item.active > form > div:nth-child(6) > input'

// 测试页面的四个交互按钮
const SELECT_SELECTOR = 'body > div:nth-child(2) > form > div > div:nth-child(2) > select'
const HOTELCODE_SELECTOR = 'body > div:nth-child(2) > form > div > div:nth-child(3) > input'
const SEARCHBTN_SELECTOR = 'body > div:nth-child(2) > form > div > div.col-md-2.form-group.form-group-submit.inline-form-heiCtrl > button'
const SEARCH_RESULT_SELECTOR = 'body > div:nth-child(3) > div.dx-progress > div:nth-child(2) > div'

// 打开一个示例
puppeteer.launch({
  // 使用有界面的模式，在认为写的脚本没有问题的时候注释掉这个，效率更高
  headless: false
}).then(async browser => {
  try {
    // 打开一个标签页
    const page = await browser.newPage()
    // 设置可视界面的大小
    page.setViewport({
      width: 1366,
      height: 768
    })
    // 注册一个网络失败的监听器，这就是一个log
    page.on('requestfailed', (req) => {
      console.log(req.url + ' ' + req.failure().errorText)
    })
    // 跳转到指定页面
    await page.goto('http://localhost:9100/dmx/internal/nuke_api/ari_daily.html')
    console.log('waitForSelector done')
    await page.waitForNavigation({waitUntil: 'domcontentloaded'})
    // 登录操作
    await page.type(EMAIL_SELECTOR, user.email, {delay: 10})
    await page.type(PWD_SELECTOR, user.pwd, {delay: 10})
    await page.click(SUBMIT_SELECTOR)
    console.log('click login btn')
    await page.waitForNavigation({waitUntil: 'domcontentloaded'})
    console.log('page loaded')
    // 获取全部的select选项
    await page.waitForSelector(SELECT_SELECTOR + ' > option:nth-child(3)')
    const options = await page.$$(SELECT_SELECTOR + ' > option')
    console.log('options length: ', options.length)
    // label和value不是一个值，这个下面会说
    const accountValue = []
    const accountLabel = []
    for (let option of options) {
      const handle = await option.getProperty('value')
      const labelHandle = await option.getProperty('label')
      accountValue.push(await handle.jsonValue())
      accountLabel.push(await labelHandle.jsonValue())
    }
    console.log(`get ${accountValue.length} accounts, start fill hotel code`)
    // 循环选择select的option选项
    for (let accountIndex = 0; accountIndex < accountValue.length; accountIndex++) {
      console.log(`select ${accountLabel[accountIndex]}`)
      await page.select(SELECT_SELECTOR, accountValue[accountIndex])
      // 填入假的code，因为url参数会记住，只需要填一次就行
      if (!accountIndex) await page.type(HOTELCODE_SELECTOR, CODE, {delay: 50})
      console.log('click search button')
      // 点击搜索按钮
      await page.click(SEARCHBTN_SELECTOR)
      await page.waitForNavigation({waitUntil: 'networkidle0'})
      await page.waitForSelector(SEARCH_RESULT_SELECTOR)
      console.log('get search result')
      // 得到预期的错误提示
      const resultMessageBox = await page.$(SEARCH_RESULT_SELECTOR)
      const _result_message_handle = await resultMessageBox.getProperty('innerText')
      console.log(await _result_message_handle.jsonValue())
      // 分隔符
      console.log('=='.repeat(60))
    }
  } catch (e) {
    console.error(e)
  }

})

```

使用账号密码是因为我们前端使用的是后端的Session控制回话时长，而且时间很短，一个小时，到期后会redirect到登录页面。所以还不如每次直接登录来的爽快。

中间有两个小坑。

一个是angular 1.x的select的value是`object:2`这样的，开始没注意到，用selectIndex去修改了之后，select选项是变化了，但是表单提交的数据还是没变

另外一个是Puppeteer的API 文档是`0.13.0`但是这是一个alpha版本，没发布到npm，我对着这个文档写了之后报错，然后看看本地的源码，跟文档不符合，然后想提一个issue，然后引入源码链接的时候，发现线上的是好的，然后删除`node_modules`文件夹重来，还是报错，然后看看版本，还是`0.12.0`，之后才发现是没有发布这个alpha版本……

其他的还好，只是不理解为什么每个选择器选择之后不是一个DOM对象，而是一个处理过的`JSHandle`对象。

