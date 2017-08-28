# code snippet

> 都是些当时倍有feel，后来感觉是白痴水平都东西

<!--more-->

```javascript
let calc1 = function (t) {
    let diff = parseInt((+new Date() - t) / 1000);

    if (diff < 60) {
        return diff.toString() + '秒'
    } else if (diff < 60 * 60) {
        return parseInt(diff / 60).toString() + '分钟'
    } else if (diff < 24 * 60 * 60) {
        return parseInt(diff / 60 / 60).toString() + '小时'
    } else if (diff < 30 * 24 * 60 * 60) {
        return parseInt(diff / 60 / 60 / 24).toString() + '天'
    } else {
        return parseInt(diff / 60 / 60 / 24 / 30).toString() + '个月'
    }
};

let calc2 = function (t) {
    let scales = [60, 60, 24, 30, 12];
    let suffixes = ['秒', '分钟', '小时', '天', '个月', '年'];
    let diff = parseInt((+new Date() - t) / 1000);
    let scale = scales.shift();
    let index = 0;
    while (diff > scale) {
        index++;
        diff = parseInt(diff / scale);
        scale = scales.shift();
    }
    return diff.toString() + suffixes[index];
};
// seconds
console.log(calc1(new Date() * 1 - 15 * 1000));
console.log(calc2(new Date() * 1 - 15 * 1000));
// minutes
console.log(calc1(1491475486040) + '前');
console.log(calc2(1491475486040) + '前');
// days
console.log(calc1(1491177600000) + '前');
console.log(calc2(1491177600000) + '前');
// months
console.log(calc1(1483401600000) + '前');
console.log(calc2(1483401600000) + '前');
// years
console.log(calc1(1451779200000) + '前');
console.log(calc2(1451779200000) + '前');

```