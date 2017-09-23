/**
 * Created by maic on 12/02/2017.
 */
const {getUser} = require('../database')

const login = async (req, res) => {
  let user = req.body
  try{
    const dbUser = await getUser({username: user.username})
    if (dbUser.length && dbUser[0].password === user.password) {
      if (req.body.rememberMe === true) {
        // cookie encrypt
        // let salt = 'naive';
        // let str = [d.results[0].username, d.results[0].password, d.results[0].createTime].join(salt);
        // let uid = crypto.createHmac('sha256', str).digest('hex').toString();
        // uid = '03d586e45633a254db46bdbb62b4e97abe1f074786eb50ddbe9dba009f2e1f82';
        let maxAge = 10 * 24 * 60 * 60 * 1000 // 10d
        res.cookie('uid', dbUser[0].createTime, {maxAge, httpOnly: true})
        res.cookie('login', 'bingo', {maxAge})
      } else {
        res.cookie('uid', dbUser[0].createTime, {httpOnly: true})
        res.cookie('login', 'bingo')
      }
      res.status(200).end()
    } else {
      res.status(401).send({error: 'Invalid username or password'})
    }
  } catch (e) {
    if (e.message === 'Cannot find user') {
      res.status(401).send(e.message)
    } else {
      res.status(500).send(e.message)
    }
  }
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
