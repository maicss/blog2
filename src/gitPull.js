/*
* 1，生成目录文件夹所有文件的hashMap
* 2，定时pull
* 3，pull完之后生成hashMap进行对比，如果不一致就更新或者添加文件hash，然后重新渲染静态文件
*
* */

const spawn = require('child_process').spawn;

let pull = spawn('git', ['pull'], {cwd: __dirname});

module.exports = function (callback) {
    pull.stdout.on('data', (data) => {
        let status = data.toString().split('\n');

        callback(status[0] === 'Already up-to-date.');

    });

    pull.stderr.on('data', (err) => {
        console.error(`stderr: ${err}`);
    });

    pull.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    pull.on('error', (code) => {
        callback(false);
        console.error(`child process exited with code ${code}`);
    });
}
;