# 本博客 Nginx 配置之完整篇

最近有很多朋友邮件或者留言询问本博客服务端配置相关问题，基本都是关于 HTTPS 和 HTTP/2 的，其实我的 Nginx 配置在之前的文章中多次提到过，不过都比较分散。为了方便大家参考，本文贴出完整配置。

> 本文内容会随时调整和更新，请不要把本文内容全文转载到第三方平台，以免给他人造成困扰或误导。另外限于篇幅，本文不对配置做过多说明，如有疑问或不同意见，欢迎留言讨论。

<!--more-->

### 本文更新说明

* 2017.02.16：将 Nginx 更新到 [1.11.10](https://nginx.org/en/CHANGES)；
* 2017.02.06：将 OpenSSL 更新到 [1.0.2k](https://www.openssl.org/news/secadv/20170126.txt)；
* 2017.02.06：将 nginx-ct 升级为 [1.3.2](https://github.com/grahamedgecombe/nginx-ct/blob/master/CHANGELOG.markdown)；
* 2016.12.10：增加「日志自动切分」小节；
* 2016.10.29：将 Cloudflare 的 ChaCha20/Poly1305 和 [Dynamic TLS Records](https://blog.cloudflare.com/optimizing-tls-over-tcp-to-reduce-latency/)（[中文翻译](http://zcfy.cc/article/optimizing-tls-over-tcp-to-reduce-latency-501.html)）补丁更新到最新版；
* 2016.10.29：去掉了「选择二：HTTP/2 + SPDY」和 OpenSSL 1.1.0 相关内容；
* 2016.10.14：将「选择一：最新版 Nginx」中的 Nginx 更新到 [1.11.5](https://nginx.org/en/CHANGES)；
* 2016.09.27：将 OpenSSL 更新到 1.0.2j 和 1.1.0b，[Security Advisory](https://www.openssl.org/news/secadv/20160926.txt)；
* 2016.09.15：将「选择一：最新版 Nginx」中的 Nginx 更新到 [1.11.4](https://nginx.org/en/CHANGES)；
* 2016.08.27：增加使用 [OpenSSL 1.1.0](https://www.openssl.org/news/cl110.txt) 的相关内容； 
* 2016.08.26：增加使用 [Brotli](https://github.com/google/brotli) 压缩格式的相关内容； 
* 2016.08.20：将 nginx-ct 升级为支持多证书配置的 1.3.0。配置格式说明[见这里](https://github.com/grahamedgecombe/nginx-ct#configuration)；
* 2016.08.06：将「选择一：最新版 Nginx」中的 Nginx 更新到 [1.11.3](https://nginx.org/en/CHANGES)；
* 2016.07.06：将「选择一：最新版 Nginx」中的 Nginx 更新到 [1.11.2](https://nginx.org/en/CHANGES)；
* 2016.06.13：在「选择二：HTTP/2 + SPDY」中，加上了 Cloudflare 的 [Dynamic TLS Records](https://blog.cloudflare.com/optimizing-tls-over-tcp-to-reduce-latency/)（[中文翻译](http://zcfy.cc/article/optimizing-tls-over-tcp-to-reduce-latency-501.html)）补丁；
* 2016.06.01：将「选择一：最新版 Nginx」中的 Nginx 更新到 [1.11.1](https://nginx.org/en/CHANGES)；
* 2016.05.23：为了解决 `CVE-2016-2107` 安全风险（[详细介绍](https://blog.cloudflare.com/yet-another-padding-oracle-in-openssl-cbc-ciphersuites/)、[官方说明](https://www.openssl.org/news/secadv/20160503.txt)、[测试地址](https://filippo.io/CVE-2016-2107/)），将 OpenSSL 升级到 1.0.2h；<br />
* 2016.05.21：补充了「使用 Cloudflare 提供的、让 Nginx 同时支持 HTTP/2 + SPDY 的补丁」有关内容；<br />

### 安装依赖

我的 VPS 系统是 Ubuntu 16.04.1 LTS，如果你使用的是其它发行版，与包管理有关的命令请自行调整。

首先安装依赖库和编译要用到的工具：

```bash
sudo apt-get install build-essential libpcre3 libpcre3-dev zlib1g-dev unzip git
```

### 获取必要组件

#### nginx-ct

`nginx-ct` 模块用于启用 [Certificate Transparency](https://imququ.com/post/certificate-transparency.html) 功能。直接从 github 上获取源码：

```bash
wget -O nginx-ct.zip -c https://github.com/grahamedgecombe/nginx-ct/archive/v1.3.2.zip
unzip nginx-ct.zip
```

#### ngx_brotli

本站支持 Google 开发的 [Brotli](https://github.com/google/brotli) 压缩格式，它通过内置分析大量网页得出的字典，实现了更高的压缩比率，同时几乎不影响压缩 / 解压速度。

以下是让 Nginx 支持 Brotli 所需准备工作，这些工作是一次性的。首先安装 libbrotli：

```bash
sudo apt-get install autoconf libtool automake

git clone https://github.com/bagder/libbrotli
cd libbrotli

# 如果提示 error: C source seen but 'CC' is undefined，可以在 configure.ac 最后加上 AC_PROG_CC
./autogen.sh

./configure
make
sudo make install

cd  ../
```

默认 libbrotli 装在 `/usr/local/lib/libbrotlienc.so.1`，如果后续启动 Nginx 时提示找不到这个文件，那么可以把它软链到 `/lib` 或者 `/usr/lib` 目录。如果还有问题，请[参考这篇文章](https://wangqiliang.com/qi-yong-brotli-ya-suo-suan-fa-ti-gao-xing-neng/)查找解决方案。

接下来获取 [ngx_brotli](https://github.com/google/ngx_brotli) 源码：

```bash
git clone https://github.com/google/ngx_brotli.git
cd ngx_brotli

git submodule update --init

cd ../
```

#### Cloudflare 补丁

本站主要使用了 Cloudflare 的 ChaCha20/Poly1305 for OpenSSL 补丁，以及 Dynamic TLS Records for Nginx 补丁。先来获取补丁文件：

```bash
git clone https://github.com/cloudflare/sslconfig.git
```

#### OpenSSL

由于系统自带的 OpenSSL 库往往不够新，推荐在编译 Nginx 时指定 OpenSSL 源码目录，而不是使用系统自带的版本，这样更可控。

本站目前使用 OpenSSL 1.0.2k：

```bash
wget -O openssl.tar.gz -c https://github.com/openssl/openssl/archive/OpenSSL_1_0_2k.tar.gz
tar zxf openssl.tar.gz
mv openssl-OpenSSL_1_0_2k/ openssl
```

打上 ChaCha20/Poly1305 补丁：

```bash
cd openssl
patch -p1 < ../sslconfig/patches/openssl__chacha20_poly1305_draft_and_rfc_ossl102j.patch 

cd ../
```

### 编译并安装 Nginx

接着就可以获取 Nginx 源码，并打上 Dynamic TLS Records 补丁：

```bash
wget -c https://nginx.org/download/nginx-1.11.10.tar.gz
tar zxf nginx-1.11.10.tar.gz

cd nginx-1.11.10/
patch -p1 < ../sslconfig/patches/nginx__1.11.5_dynamic_tls_records.patch

cd ../
```

编译和安装：

```bash
cd nginx-1.11.10/
./configure --add-module=../ngx_brotli --add-module=../nginx-ct-1.3.2 --with-openssl=../openssl --with-http_v2_module --with-http_ssl_module --with-http_gzip_static_module

make
sudo make install
```

除了 `http_v2` 和 `http_ssl` 这两个 HTTP/2 必备模块之外，我还额外启用了 `http_gzip_static`，需要启用哪些模块需要根据自己实际情况来决定（注：从 Nginx 1.11.5 开始，`ipv6` 模块已经内置，故 `--with-ipv6` 配置项已被移除）。

以上步骤会把 Nginx 装到 `/usr/local/nginx/` 目录，如需更改路径可以在 configure 时指定。

### 管理脚本与自启动

为了方便管理 Nginx 服务，再创建一个管理脚本：

```bash
sudo vim /etc/init.d/nginx
```

输入以下内容：

```bash
#! /bin/sh

### BEGIN INIT INFO
# Provides:          nginx
# Required-Start:    $all
# Required-Stop:     $all
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: starts the nginx web server
# Description:       starts nginx using start-stop-daemon
### END INIT INFO

PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
DAEMON=/usr/local/nginx/sbin/nginx
NAME=nginx
DESC=nginx

test -x $DAEMON || exit 0

# Include nginx defaults if available
if [ -f /etc/default/nginx ] ; then
  . /etc/default/nginx
fi

set -e

. /lib/lsb/init-functions

case "$1" in
  start)
    echo -n "Starting $DESC: "
    start-stop-daemon --start --quiet --pidfile /usr/local/nginx/logs/$NAME.pid \
        --exec $DAEMON -- $DAEMON_OPTS || true
    echo "$NAME."
    ;;
  stop)
    echo -n "Stopping $DESC: "
    start-stop-daemon --stop --quiet --pidfile /usr/local/nginx/logs/$NAME.pid \
        --exec $DAEMON || true
    echo "$NAME."
    ;;
  restart|force-reload)
    echo -n "Restarting $DESC: "
    start-stop-daemon --stop --quiet --pidfile \
        /usr/local/nginx/logs/$NAME.pid --exec $DAEMON || true
    sleep 1
    start-stop-daemon --start --quiet --pidfile \
        /usr/local/nginx/logs/$NAME.pid --exec $DAEMON -- $DAEMON_OPTS || true
    echo "$NAME."
    ;;
  reload)
    echo -n "Reloading $DESC configuration: "
    start-stop-daemon --stop --signal HUP --quiet --pidfile /usr/local/nginx/logs/$NAME.pid \
        --exec $DAEMON || true
    echo "$NAME."
    ;;
  status)
    status_of_proc -p /usr/local/nginx/logs/$NAME.pid "$DAEMON" nginx && exit 0 || exit $?
    ;;
  *)
    N=/etc/init.d/$NAME
    echo "Usage: $N {start|stop|restart|reload|force-reload|status}" >&2
    exit 1
    ;;
esac

exit 0
```

增加执行权限：

```bash
sudo chmod a+x /etc/init.d/nginx
```

现在管理 Nginx 只需使用以下命令即可：

```bash
sudo service nginx start|stop|restart|reload
```

如果要开机自动启动 Nginx，请执行以下命令：

```bash
sudo update-rc.d -f nginx defaults
```

### Nginx 全局配置

到此为止，Nginx 已经安装完毕。再来修改一下它的全局配置，打开 `/usr/local/nginx/conf/nginx.conf`，新增或修改以下内容：

```nginx
http {
    include            mime.types;
    default_type       application/octet-stream;

    charset            UTF-8;

    sendfile           on;
    tcp_nopush         on;
    tcp_nodelay        on;

    keepalive_timeout  60;

    #... ...#

    gzip               on;
    gzip_vary          on;

    gzip_comp_level    6;
    gzip_buffers       16 8k;

    gzip_min_length    1000;
    gzip_proxied       any;
    gzip_disable       "msie6";

    gzip_http_version  1.0;

    gzip_types         text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript image/svg+xml;

    # 如果编译时添加了 ngx_brotli 模块，需要增加 brotli 相关配置
    brotli             on;
    brotli_comp_level  6;
    brotli_types       text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript image/svg+xml;

    #... ...#

    include            /home/jerry/www/nginx_conf/*.conf;
}
```

最后的 `include` 用来加载我个人目录下的配置文件，这样今后创建和修改站点配置就不需要再使用 sudo 权限了。

要让网站支持浏览器通过 HTTP/2 访问必须先部署 HTTPS，要部署 HTTPS 必须先有合法的证书。本博客目前在用 RapidSSL 单域名证书，在 [NameCheap](https://www.namecheap.com/security/ssl-certificates/rapidssl/rapidssl.aspx) 购买。另外，我还申请了 [Let's Encrypt](http://www.letsencrypt.org/) 的免费证书备用。一般情况下，个人使用 Let's Encrypt 的免费证书就足够了，还可以节省一笔开销。

要申请 Let's Encrypt 证书，推荐使用 [Neilpang/acme.sh](https://github.com/Neilpang/acme.sh) 这个小巧无依赖的命令行工具，或者参考我的这篇文章：[Let's Encrypt，免费好用的 HTTPS 证书](https://imququ.com/post/letsencrypt-certificate.html)。

注：Let's Encrypt 已于 2016 年 3 月 26 日修复 Windows XP 下的兼容问题，本站也第一时间切换到 Let's Encrypt 证书。

### WEB 站点配置

以下是本博客站点完整配置：

```nginx
server {
    listen               443 ssl http2 fastopen=3 reuseport;

    # 如果你使用了 Cloudflare 的 HTTP/2 + SPDY 补丁，记得加上 spdy
    # listen               443 ssl http2 spdy fastopen=3 reuseport;

    server_name          www.imququ.com imququ.com;
    server_tokens        off;

    include              /home/jerry/www/nginx_conf/ip.blacklist;

    # https://imququ.com/post/certificate-transparency.html#toc-2
    ssl_ct               on;
    ssl_ct_static_scts   /home/jerry/www/scts;

    # 中间证书 + 站点证书
    ssl_certificate      /home/jerry/www/ssl/chained.pem;

    # 创建 CSR 文件时用的密钥
    ssl_certificate_key  /home/jerry/www/ssl/domain.key;

    # openssl dhparam -out dhparams.pem 2048
    # https://weakdh.org/sysadmin.html
    ssl_dhparam          /home/jerry/www/ssl/dhparams.pem;

    # https://github.com/cloudflare/sslconfig/blob/master/conf
    ssl_ciphers                EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;

    # 如果启用了 RSA + ECDSA 双证书，Cipher Suite 可以参考以下配置：
    # ssl_ciphers              EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+ECDSA+AES128:EECDH+aRSA+AES128:RSA+AES128:EECDH+ECDSA+AES256:EECDH+aRSA+AES256:RSA+AES256:EECDH+ECDSA+3DES:EECDH+aRSA+3DES:RSA+3DES:!MD5;

    ssl_prefer_server_ciphers  on;

    ssl_protocols              TLSv1 TLSv1.1 TLSv1.2;

    ssl_session_cache          shared:SSL:50m;
    ssl_session_timeout        1d;

    ssl_session_tickets        on;

    # openssl rand 48 > session_ticket.key
    # 单机部署可以不指定 ssl_session_ticket_key
    ssl_session_ticket_key     /home/jerry/www/ssl/session_ticket.key;

    ssl_stapling               on;
    ssl_stapling_verify        on;

    # 根证书 + 中间证书
    # https://imququ.com/post/why-can-not-turn-on-ocsp-stapling.html
    ssl_trusted_certificate    /home/jerry/www/ssl/full_chained.pem;

    resolver                   114.114.114.114 valid=300s;
    resolver_timeout           10s;

    access_log                 /home/jerry/www/nginx_log/imququ_com.log;

    if ($request_method !~ ^(GET|HEAD|POST|OPTIONS)$ ) {
        return           444;
    }

    if ($host != 'imququ.com' ) {
        rewrite          ^/(.*)$  https://imququ.com/$1 permanent;
    }

    location ~* (robots\.txt|favicon\.ico|crossdomain\.xml|google4c90d18e696bdcf8\.html|BingSiteAuth\.xml)$ {
        root             /home/jerry/www/imququ.com/www/static;
        expires          1d;
    }

    location ^~ /static/uploads/ {
        root             /home/jerry/www/imququ.com/www;
        add_header       Access-Control-Allow-Origin *;

        set              $expires_time max;

        valid_referers   blocked none server_names *.qgy18.com *.inoreader.com feedly.com *.feedly.com www.udpwork.com theoldreader.com digg.com *.feiworks.com *.newszeit.com r.mail.qq.com yuedu.163.com *.w3ctech.com;
        if ($invalid_referer) {
            set          $expires_time -1;
            return       403;
        }

        expires          $expires_time;
    }

    location ^~ /static/ {
        root             /home/jerry/www/imququ.com/www;
        add_header       Access-Control-Allow-Origin *;      
        expires          max;
    }

    location ^~ /admin/ {
        proxy_http_version       1.1;

        add_header               Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";

        # DENY 将完全不允许页面被嵌套，可能会导致一些异常。如果遇到这样的问题，建议改成 SAMEORIGIN
        # https://imququ.com/post/web-security-and-response-header.html#toc-1
        add_header               X-Frame-Options DENY;

        add_header               X-Content-Type-Options nosniff;

        proxy_set_header         X-Via            QingDao.Aliyun;
        proxy_set_header         Connection       "";
        proxy_set_header         Host             imququ.com;
        proxy_set_header         X-Real_IP        $remote_addr;
        proxy_set_header         X-Forwarded-For  $proxy_add_x_forwarded_for;

        proxy_pass               http://127.0.0.1:9095;
    }
    
    location / {
        proxy_http_version       1.1;

        add_header               Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
        add_header               X-Frame-Options deny;
        add_header               X-Content-Type-Options nosniff;
        add_header               Content-Security-Policy "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob: https:; img-src data: https: http://ip.qgy18.com; style-src 'unsafe-inline' https:; child-src https:; connect-src 'self' https://translate.googleapis.com; frame-src https://disqus.com https://www.slideshare.net";
        add_header               Public-Key-Pins 'pin-sha256="YLh1dUR9y6Kja30RrAn7JKnbQG/uEtLMkBgFF2Fuihg="; pin-sha256="aef6IF2UF6jNEwA2pNmP7kpgT6NFSdt7Tqf5HzaIGWI="; max-age=2592000; includeSubDomains';
        add_header               Cache-Control no-cache;

        proxy_ignore_headers     Set-Cookie;

        proxy_hide_header        Vary;
        proxy_hide_header        X-Powered-By;

        proxy_set_header         X-Via            QingDao.Aliyun;
        proxy_set_header         Connection       "";
        proxy_set_header         Host             imququ.com;
        proxy_set_header         X-Real_IP        $remote_addr;
        proxy_set_header         X-Forwarded-For  $proxy_add_x_forwarded_for;

        proxy_pass               http://127.0.0.1:9095;
    }
}

server {
    server_name       www.imququ.com imququ.com;
    server_tokens     off;

    access_log        /dev/null;

    if ($request_method !~ ^(GET|HEAD|POST)$ ) {
        return        444;
    }

    location ^~ /.well-known/acme-challenge/ {
        alias         /home/jerry/www/challenges/;
        try_files     $uri =404;
    }

    location / {
        rewrite       ^/(.*)$ https://imququ.com/$1 permanent;
    }
}
```

以上配置中的一些关键点分散在我之前的这些文章中：

* [本博客 Nginx 配置之性能篇](https://imququ.com/post/my-nginx-conf-for-wpo.html)；
* [本博客 Nginx 配置之安全篇](https://imququ.com/post/my-nginx-conf-for-security.html)；
* [TLS 握手优化详解](https://imququ.com/post/optimize-tls-handshake.html)；
* [关于启用 HTTPS 的一些经验分享（一）](https://imququ.com/post/sth-about-switch-to-https.html)；
* [关于启用 HTTPS 的一些经验分享（二）](https://imququ.com/post/sth-about-switch-to-https-2.html)；
* [Certificate Transparency 那些事](https://imququ.com/post/certificate-transparency.html)；
* [HTTP Public Key Pinning 介绍](https://imququ.com/post/http-public-key-pinning.html)；
* [从无法开启 OCSP Stapling 说起](https://imququ.com/post/why-can-not-turn-on-ocsp-stapling.html)；

### 日志自动切分

上一节中，我在 Nginx 的站点配置中通过 `access_log` 指定了访问日志的存放位置。Nginx 启动后，会持续往这个文件写入访问日志。如果网站访问量很大，最好能按照指定大小或者时间间隔切分日志，便于后期管理和排查问题。

虽然本站访问量不大，但我也使用了 `logrotate` 工具对访问日志进行了按天切分。 

大多数 Linux 发行版都内置了 `logrotate`，只需新建一个配置文件即可，例如：

```bash
sudo vim /etc/logrotate.d/nginx

/home/jerry/www/nginx_log/*.log {
	su root root
	daily
	rotate 5
	missingok
	notifempty
	sharedscripts
	dateext
	postrotate
	    if [ -f /usr/local/nginx/logs/nginx.pid ]; then
	        kill -USR1 `cat /usr/local/nginx/logs/nginx.pid`
	    fi
	endscript
}
```

配置中具体指令的含义可以查看[手册](http://www.linuxcommand.org/man_pages/logrotate8.html)。配置好之后，可以手动执行一下，看是否正常：

```bash
sudo /usr/sbin/logrotate -f /etc/logrotate.d/nginx
```

如果一切无误，后续 Nginx 的访问日志就会自动按天切分，并以年月日做为文件后缀，一目了然。

在我的 Ubuntu 16.04.1 LTS 上，`/etc/logrotate.d/` 目录中的日志切分任务会由 `/etc/cron.daily/logrotate` 来确保每天执行一次。查看 `/etc/crontab` 会发现 `cron.daily` 任务会在每天 6:25 执行，这就是 logrotate 每天切分日志的时机。

如果想要让日志正好在零点被切分，可以修改 `cron.daily` 的执行时机，也可以把自己的 logrotate 配置文件放在 `/etc/logrotate.d/` 之外，再手动配置 crontab 规则。

### 安全测试和评分

一切妥当后，推荐使用以下两个在线服务来检测站点 HTTPS 配置：

**1）Qualys SSL Labs's SSL Server Test**

测试地址：[https://www.ssllabs.com/ssltest/index.html](https://www.ssllabs.com/ssltest/index.html)，以下是本博客测试结果截图：

<img alt="ssllabs test of imququ.com" src="https://st.imququ.com/static/uploads/2016/03/ssllabs_test_of_imququ_com.png" width="798" itemprop="image" /><a href="https://ssllabs.com/ssltest/analyze.html?d=imququ.com">查看完整测试结果 »</a>

注：如果选择使用 Cloudflare 的 HTTP/2 + SPDY 修改版，记得在站点配置中加上 `spdy`，这样才能增加对 SPDY 协议的支持。如果配置正确，在这个工具的 NPN 信息中可以看到类似这样的结果：`Yes  h2 spdy/3.1 http/1.1`。

**2）HTTP Security Report**

测试地址：[https://httpsecurityreport.com/](https://httpsecurityreport.com/)，以下是本博客测试结果截图：

<img alt="http security report of imququ.com" src="https://st.imququ.com/static/uploads/2016/03/http_security_report_of_imququ_com.png" width="776" itemprop="image" /><a href="https://httpsecurityreport.com/?report=imququ.com">查看完整测试结果 »</a>

原文链接：[https://imququ.com/post/my-nginx-conf.html](https://imququ.com/post/my-nginx-conf.html)，[前往原文评论 »](https://imququ.com/post/my-nginx-conf.html#comments)