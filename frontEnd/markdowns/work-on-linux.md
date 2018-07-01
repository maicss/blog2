# Work On Linux

tags: ubuntu

date: 2018-07-01 13:23

<abstract>
在小公司的干活的人，绝大部分的都不会给配备Mac作为开发工具的。但是在Windows开发不像操作原理都懂的大神那样，什么都会配置，什么都懂，实在是hold不住。只能考虑Linux，但是又因为办公的原因，比如办公软件，聊天软件，娱乐等都不是很爽。最近终于找到了一个不错的方法，写下来记录一下。
<abstract>

<!--more-->

[toc]

## 先说说其他的方法

### 使用deepin

deepin做的漂亮，用着也不错。界面漂亮，常用软件也都有了，用wine弄的微信，qq，丁丁什么的都有，而且是一键安装。

大神们遇到的底层问题我还都没遇到过。最近没用是因为不知道什么原因，公司给配的台式机装不上🤪，一直卡在格式化硬盘之后的安装上，我急着用就没去找为啥，用不了我也很无奈。

### 使用ubuntu

ubuntu现在也不错了，自带了中文输入法，基本的驱动也能自带了。基本上开机能用。比着deepin少了本地化的软件。

个人觉得，ubuntu的terminal比deepin自己开发的雷神终端好看点...

最近我选择的是这个方案。但是微信必须用网页版的，网页版保存图片真的很扯淡。还有一个周输入法一直崩溃，不能选字，只能使用第一个字，而且输入法比着搜狗等，算是很脑残的了，没办法用。只好带着Mac去顶替一下，最后重装系统搞定，但是这成本太高了...

### Windows+ubuntu

这里不是双系统。是使用Windows的hyper-v或者WSL弄的ubuntu，建议使用hyper-v，不会产生额外文件。删除也方便，也是完整的操作系统，不会受bashOnWindows开发进度的影响。

之前试过在Windows上用Webstorm的远程编辑，但是远程编辑实际上要配置一个文件服务器，比如FTP/SFTP（可能需要配置密码）。然后把文件下载到本地（需要指定本地一个文件夹），每次修改之后同步到ubuntu，然后运行，这样很不爽，而且webpack2之后不让认为把本地端口暴露到局域网是不安全的，默认不能在局域网看到，也就是说hot-reload在Windows上是不能看到效果的，还要去hack webpack。

## 改进的方法

### 使用xServer

先装一下大佬，解释一下原理（其实我也不懂）：

ubuntu的窗口服务是一个完整的B/S服务，所以显示可以不跟系统绑定。那我们装一个有Xwindow的Linux的发行版，比如desktop版的Ubuntu。然后在Windows上开一个客户端，把server端的界面拿过来显示就好了。

需要的东西：

- [XShell](https://www.netsarang.com/products/xsh_overview.html)【这个也可以使用PUTTY代替】
- [Xming](https://sourceforge.net/projects/xming)

设置步骤：

1, sshd_config `X11Forwrding yes`
 
2, XLauncher. 这个是安装xming之后出现的。择Mutiple windows，然后一路next，就完成了基本的配置了。

3，XShell [连接] => [SSH] => [隧道] X11转移选择X DISPLAY，地址是你鼠标放右下角的XLauncher上的·DISPLAY NUMBER·

完成之后，你只能在Windows的右下角里看到一个Xming的图标，什么也没有。

这个时候你XShell里连上Ubuntu，输入`firefox`就能看到神奇的事情发生了。在Windows桌面上，又一个窗口显示了Ubuntu里安装的firefox。

不过这需要每开一个应用程序都需要连接一个ssh...目前不知道怎么解决。

到这一步，教程就算完成了。剩下的就是搜你想要打开的应用程序的命令行开启方式了。


