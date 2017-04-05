module.exports = function (marked, fileName, postLink) {
    return `<!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                <title>${fileName}</title>
                <link rel="stylesheet" href="../lib/semantic/dist/semantic.min.css">
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
            </body>
        </html>`;
};