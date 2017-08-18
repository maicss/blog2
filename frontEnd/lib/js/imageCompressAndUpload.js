let readableSize = function (size) {
    return size / 1024 > 1024 ? (~~(10 * size / 1024 / 1024)) / 10 + "MB" : ~~(size / 1024) + "KB";
};
let progress = document.querySelector('#progress');
let imgFormData = new FormData();
$('#photo').change(function (e) {

    [].forEach.call(e.target.files, function (file) {
        let cardDiv = document.createElement('div');
        let imgDiv = document.createElement('canvas');
        cardDiv.classList.add('card');
        imgDiv.classList.add('image');
        let imgFrame = document.querySelector('#frame');
        let img = new Image();
        cardDiv.appendChild(imgDiv);
        imgFrame.appendChild(cardDiv);
        let reader = new FileReader();
        reader.onloadend = function () {
            img.src = this.result;
            img.onload = function () {
                imgFormData.append('photo', compressImg(img, file.type, imgDiv, cardDiv), file.name);
//                    let xhr = new XMLHttpRequest(), percent = 0, loop = null;
//
//                    xhr.open("POST", "/file");
//
//                    xhr.onreadystatechange = function () {
//                        if (xhr.readyState === 4) {
//                            if (xhr.status === 200) {
//                                let d = JSON.parse(xhr.responseText);
//                                console.info(d);
//                                document.querySelector('#after').innerHTML = '图片压缩后的大小(从服务器获取到的数据)：' + readableSize(d[0].size);
//                            } else {
//                                console.error(xhr.responseText)
//                            }
//                        }
//                    };
//                    xhr.upload.addEventListener('progress', function(e) {
//                        if (loop) return;
//                        percent = ~~(100 * e.loaded / e.total);
//                        progress.value = percent;
//                        console.log(percent);
//                    }, false);
//                    xhr.send(imgFormData);
            };
        };
        reader.readAsDataURL(file);
    });
});

let compressImg = function (img, type, imgContainer, card) {
    /**
     * compress base64 img data to blob
     * @param img: instanceof Image
     * @param type: mimetype of img
     * @returns: img Blob data
     * */
        // size limit
    const maxsize = 10 * 1024;
    const maxWidth = 1000;
    let imgBase64 = img.src;
    let contentDiv = document.createElement('div');
    let contentHeaderDiv = document.createElement('div');
    contentDiv.classList.add('content');
    contentHeaderDiv.classList.add('header');

    contentDiv.appendChild(contentHeaderDiv);
    card.appendChild(contentDiv);
    if (imgBase64.length > maxsize) {

        let canvas = imgContainer;
        let ctx = canvas.getContext('2d');

        let initSize = img.src.length;
        let width = img.width;
        let height = img.height;
        console.log('img width, height: ', width, height);
        $(imgContainer).css('height', $(card).width() * height / width);
        let ratio = width / maxWidth;
        if (ratio > 1) {
            width /= ratio;
            height /= ratio;
        }
        canvas.width = width;
        canvas.height = height;
        console.log('canvas width, height: ', width, height);
        // 如果是jpeg 就添加底色为白色，因为jpeg默认会把透明部分转为黑色, 而默认的toDataURL会把图片转为PNG格式
        if (type === 'image/jpeg') {
            ctx.fillStyle = "#fff";
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 修改图片大小
        ctx.drawImage(img, 0, 0, width, height);
        // 修改图片质量, 只支持jpeg和webp
        imgBase64 = canvas.toDataURL(type);
        // $(imgContainer).css({"background-image": "url(" + imgBase64 + ")", 'background-size': 'cover'});
        contentHeaderDiv.innerHTML = readableSize(initSize) + ' / ' + readableSize(imgBase64.length);

        console.log('压缩前：' + initSize);
        console.log('压缩后：' + imgBase64.length);

        console.log('压缩率：' + ~~(100 * (initSize - imgBase64.length) / initSize) + "%");
        // canvas.width = canvas.height = 0;
    } else {
        contentHeaderDiv.innerHTML = readableSize(img.src.length) + ' / ' + readableSize(img.src.length);
    }

    let text = window.atob(imgBase64.split(",")[1]);
    let buffer = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
        buffer[i] = text.charCodeAt(i);
    }
    return new Blob([buffer], {type});
};