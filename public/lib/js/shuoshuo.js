$('.ui.checkbox').checkbox();
let timeMark = 0;
let weatherInfo = {};
let filter = 'all';

let renderContent = function (res) {
    let st = '';
    if (!res.length) {
        return `<p>还没有说说呢，写一条呗～～</p>`
    }
    res.forEach(function (v, i) {
        let im = '';
        v.images.forEach(function (iv) {
            im += `<img src="${iv}">`
        });
        st += `<div class="item">
                    <div class="content">
                        <h3 class="header"><time>${v.dateStr}</time></h3>
                        <div class="description">
                            <div>${v.content}</div>
                            <p><i class="icon location arrow"></i>${v.weather.location || v.location}: <img class="aligned image mini spaced ui" src="../assert/weather-icon/${v.weather.code[0]}.png"> ~ <img class="aligned image mini spaced ui" src="../assert/weather-icon/${v.weather.code[1]}.png"> ${v.weather.temperature[0]}&#8451; ~ ${v.weather.temperature[1]}&#8451; </p>
                                <div class="images ui small">${im}</div>

                        </div>
                        ${v.isPublic ? '' : '<div class="extra"><div class="ui label red">Private</div> </div>'}
                    </div>
                </div>`;
        if (i === res.length - 1) {
            timeMark = v.date;
        }
    });
    return st;
};

let getSummary = function () {
    let summary = document.querySelector('#summary');
    summary.innerHTML = '';
    fetch('/getSummary', {method: "GET"}).then(function (d) {
        if (d.ok) {
            d.json().then(function (s) {
                let data = s[0].summary;
                Object.keys(data).sort((a, b) => a < b).forEach(v => {
                    let a = document.createElement('a');
//                        a.onclick = loadList(arg);
                    a.dataset.year = v;
                    a.classList = 'teal item';
                    if (v === filter) {
                        a.classList.add('active');
                    }
                    a.innerHTML = `${v} <div class="ui teal label">${data[v]}</div>`;
                    summary.appendChild(a);
                });
            })
        }
    }, function (e) {
        console.log(e)
    })
};

let getInitList = function () {
    timeMark = 0;
    $.ajax({
        url: '/getShuoshuoList',
        method: 'GET',
        data: {limit: 20, filter, timeMark}
    }).done(function (res) {
        let template = renderContent(res);
        if (res.length < 20) {
            $('#loadMore').hide();
        } else {
            $('#loadMore').show();
        }
        $('#shuoshuo-ul').html(template);
        getSummary();
    }).fail(function (jqxhr) {
        $('#shuoshuo-ul').html(`<p>${jqxhr.status}: ${jqxhr.responseText}</p>`)
    });
};

let getWeather = function () {
    $.ajax({
        method: 'GET',
        url: '/getWeather'
    }).done(function (d) {
        weatherInfo = d;
        $('#weather').html(`<div class="ui info message"><i class="icon location arrow"></i>${d.location}: <img class="aligned image mini spaced ui" src="../assert/weather-icon/${d.code_day}.png"> ~ <img class="aligned image mini spaced ui" src="../assert/weather-icon/${d.code_night}.png">${d.code_day === d.code_night ? d.text_day : d.text_day + ' 转 ' + d.text_night} ${d.low}&#8451; ~ ${d.high}&#8451; <small>timestamp: ${moment(d.queryTime).format('YYYY-MM-DD HH:mm:ss')}</small></div>`);
    }).fail(function (e, m, n) {
        console.log(e);
        console.log(m);
        console.log(n);
//            let err = JSON.parse(e.responseText);
//            $('#weather').html(`<div class="ui error message"><p>err: ${err.name}:</p><p>message: ${err.message}</p></div>`);
    });
};

let loadList = function (mark) {
    $.ajax({
        url: '/getShuoshuoList',
        method: 'GET',
        data: {
            filter,
            timeMark
        }
    }).done(function (res) {
        if (!res.length) {
            alert('就这么多啦～～');
            $('#loadMore').hide();
        } else {
            if (res.length < 10) {
                $('#loadMore').hide();
            } else {
                $('#loadMore').show();
            }
            let template = renderContent(res);
            if (mark === 'more') {
                $('#shuoshuo-ul').append(template);
            } else {
                $('#shuoshuo-ul').html(template);
            }
        }

    }).fail(function (xhr) {
        $('#shuoshuo-ul').append(`<p>${xhr.status}: ${xhr.responseText}</p>`);
    })
};

let postShuoshuo = function () {
    if ($('#s_content').val().trim()) {
        if (moment().format('YYYY-MM-DD') !== weatherInfo.date) {
            getWeather();
        }
        let s = {
            content: $('#s_content').val(),
            weather: {
                temperature: [weatherInfo.low, weatherInfo.high],
                code: [weatherInfo.code_day, weatherInfo.code_night],
                location: weatherInfo.location
            }
        };
        imgFormData.append('obj', JSON.stringify(s));

        $.ajax({
            url: '/postShuoshuo',
            method: 'POST',
            processData: false,
            contentType: false,
            data: imgFormData
        }).done(function (d) {
            imgFormData = new FormData();
            if (d.result.ok === 1 && d.result.n === 1) {
                alert('post success.');
                $('#frame').html('');
                $('#s_content').val('');
                filter = 'all';
                getInitList();
            } else {
                console.log(d)
            }
        }).fail(function (e) {
            imgFormData = new FormData();
            $('#shuoshuoOpMsg').html(e.responseText).parent('div').removeClass('hidden');
        })
    }
};

let _login = function (user, callback) {
    if (user.username && user.password) {

        $.ajax({
            url: '/login',
            method: 'post',
            data: user,
        }).then(function (d) {
            callback(d)
        }, function (e) {
            callback(e)
        })
    }
};

$('#s_poster').click(function () {
    postShuoshuo();
});


$(function () {
    getInitList();
    getWeather();
    document.addEventListener('keyup', function (e) {
        if (e.ctrlKey && e.which === 13) {
            postShuoshuo();
        }
    });
    $('#summary').click(function (e) {
        let targetA = '';
        if (e.target.localName === 'a') {
            targetA = e.target;
        } else if (e.target.localName === 'span') {
            targetA = e.target.parentElement;
        }
        targetA.classList.add('active');
        let as = this.children;
        for (let i = 0; i < as.length; i++) {
            if (as[i].localName === 'a') {
                if (as[i] !== targetA) {
                    as[i].classList.remove('active');
                }
            }
        }

        filter = targetA.dataset.year;
        timeMark = 0;
        loadList();
    });
    if (document.cookie.indexOf('login=bingo') > -1) {
        $('#logout').show();
        $('#login').hide();
        $('#shuoshuoArea').show();
    }

});


$('#login').click(function () {
    $('.ui.error.message').hide();
    $('.ui.modal.login').modal('show');

    $('#submitLogin').click(function () {
        $(this).addClass('loading');
        let user = {
            username: $('#username').val().trim(),
            password: $('#password').val().trim(),
            rememberMe: $('#rememberMe').prop('checked')
        };
        _login(user, function (res) {
            if (res === 'succeed') {
                $(this).removeClass('loading');
                $('.ui.modal.login').modal('hide');
                $('#login').hide();
                $('#shuoshuoArea').show();
                $('#shuoshuoOpMsg').html('').parent('div').hide();
                $('#logout').show();
            } else {
                $('#submitLogin').removeClass('loading');

//                    $('.ui.modal.login').modal('hide');
                $('.ui.error.message').html('Invalid User or Password.').show();
                console.log(res)
            }
        });
    });
});

$('#logout').click(function () {

    $('.ui.modal.logout').modal('show');

    $('.logout .positive').click(function () {
        $.post('/logout', function (d) {
            if (d === 'succeed') {
                $('#login').show();
                $('#logout').hide();
                $('#shuoshuoArea').hide();
            } else {
                alert('logout filed.')
            }
        });
    })

});

