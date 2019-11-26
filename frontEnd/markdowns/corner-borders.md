# css 实现div外部四角边框

> 设计稿里一个div有自己的边框，四个角还有装饰的边框。

## 目标：
  - 实现四个角的装饰
  - 四个角的边框粗细可调
  - 内部div的边框不受外部的影响
  - 四个角距离内部div的距离可控
  - 角的数量可控，可以是四个角，可以是两个角

 [参考方案](https://codepen.io/heyvian/pen/xEovGd)

 ## 最终代码

 ``` html

<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <style>

    * {
      box-sizing: border-box;
    }

    .images__img-wrapper {
      position: relative;
      display: inline-block;
      width: auto;
      z-index: 1;
      border: 2px solid #475eee;
    }

    .images__img-wrapper::before,
    .images__img-wrapper::after {
      content: '';
      position: absolute;
      background: #fff;
    }

    .images__img-wrapper::before {
      width: calc(100% + 20px);
      height: calc(100% - 20px);
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1;
    }

    .images__img-wrapper::after {
      height: calc(100% + 20px);
      width: calc(100% - 20px);
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
    }

    .images__img-wrapper img {
      position: relative;
      display: block;
      margin: 0;
      padding: 0;
      z-index: 5;
    }

  </style>
</head>
<body>
<div class="content-wrapper">
  <div class="images__img-wrapper">
    <div style="width: 300px; height: 500px; border: 1px solid red; z-index: 2; position:relative;"></div>
  </div>

  <div class="images__img-wrapper">
    <div style="width: 300px; height: 500px; border: 1px solid red; z-index: 2; position:relative;"></div>
  </div>
</div>
</body>
</html>

 ```

 ~~没有启动blog服务器，图床功能也没了，啥时候想起来再弄好了~~

