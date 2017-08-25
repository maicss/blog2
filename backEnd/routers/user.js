/**
 * Created by maic on 12/02/2017.
 */
const getUser = require('../databaseOperation').getUser
const {buildDatabaseRes} = require('../utils')

const login = function (req, res) {
  let user = req.body
  getUser(user.username).then(function (d) {
    // 这个好扯啊，没有用户、查询的字段没有都返回一个空数组，而不是报错
    // 所以这里的status判断是没意义的
    if (d.result.length && d.result[0].password === user.password) {
      if (req.body.rememberMe === true) {
        // cookie encrypt
        // let salt = 'naive';
        // let str = [d.results[0].username, d.results[0].password, d.results[0].createTime].join(salt);
        // let uid = crypto.createHmac('sha256', str).digest('hex').toString();
        // uid = '03d586e45633a254db46bdbb62b4e97abe1f074786eb50ddbe9dba009f2e1f82';
        let maxAge = 10 * 24 * 60 * 60 * 1000 // 10d
        res.cookie('uid', d.result[0].createTime, {maxAge, httpOnly: true})
        res.cookie('login', 'bingo', {maxAge})
      } else {
        res.cookie('uid', d.result[0].createTime, {httpOnly: true})
        res.cookie('login', 'bingo')
      }
      res.status(200).end()
    } else {
      res.status(401).send({error: 'Invalid username or password'})
    }
  }).catch(e => buildDatabaseRes(e, 'error', 'login error in user module.'))
}

const logout = function (req, res) {
  res.clearCookie('uid')
  res.clearCookie('login')
  res.status(200).end()
}
module.exports = {
  login,
  logout
}
