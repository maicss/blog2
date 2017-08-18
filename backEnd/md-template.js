module.exports = function (marked, fileName, postLink) {
    return `<!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                <title>${fileName}</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.13/semantic.min.css">
                <link rel="stylesheet" href="../lib/highlight-github.css">
                <link rel="stylesheet" href="../lib/markdown.css">
                <style>
                    #toc_container {
                        position: fixed;
                        top: 10px;
                        width: 250px;
                        right: 10px;
                        word-break: break-word;
                    }
                </style>
            </head>
            <body class="ui main text container">
                <a href="/post">返回文章首页</a>
                <a href="${postLink}#disqus_thread">count</a>
                ${marked}
                <p><a href="../MD/${fileName}.md">查看本文Markdown版本</a></p>
                <div id="disqus_thread"></div>
                <script>
                
                /**
                *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
                *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables*/
                
                var disqus_config = function () {
                this.page.url = '${postLink}';  // Replace PAGE_URL with your page's canonical URL variable
                this.page.identifier = '${fileName}'; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
                };
                
                (function() { // DON'T EDIT BELOW THIS LINE
                var d = document, s = d.createElement('script');
                s.src = '//https-www-maicss-com.disqus.com/embed.js';
                s.setAttribute('data-timestamp', +new Date());
                (d.head || d.body).appendChild(s);
                })();
                </script>
                <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
                <script id="dsq-count-scr" src="//https-www-maicss-com.disqus.com/count.js" async></script>
                <script>
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

                ga('create', 'UA-70116787-3', 'auto');
                ga('send', 'pageview');

                </script>
            </body>
        </html>`;
};