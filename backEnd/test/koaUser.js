const request = require('supertest')
require('should-http')
const app = require('../../server')
const trueUser = {
  username: 'test',
  password: 'test'
}
const fakerUser = {
  username: 'test1',
  password: 'test'
}
const uid = 1490173421950


describe('路由 => 【用户】测试套件', function () {
  it('正确的用户名和密码登录操作', function (done) {
    request(app.listen())
      .post('/login')
      .set('Accept', 'application/json')
      .send(trueUser)
      .expect('set-cookie', `uid=${uid}; path=/; secure; httponly,login=bingo; path=/; secure; httponly`)
      .expect(200, done)
  })
  it('正确的用户名密码和记住我登录操作', function (done) {
    request(app.listen())
      .post('/login')
      .set('Accept', 'application/json')
      .send({username: 'test', password: 'test', rememberMe: true})
      .expect('set-cookie', /uid=1490173421950; path=\/; expires=\w{3},\s\d\d\s\w{3}\s\d\d\d\d\s\d\d:\d\d:\d\d\sGMT; secure; httponly,login=bingo; path=\/; expires=\w{3},\s\d\d\s\w{3}\s\d\d\d\d\s\d\d:\d\d:\d\d\sGMT; secure; httponly/)
      .expect(200, done)
  })
  it('正确的用户，错误的密码的登录操作', function (done) {
    request(app.listen())
      .post('/login')
      .set('Accept', 'application/json')
      .send({username: 'test', password: '11'})
      .expect(401, done)
  })
  it('不存在的用户登录操作', function (done) {
    request(app.listen())
      .post('/login')
      .set('Accept', 'application/json')
      .send(fakerUser)
      .expect(401, done)
  })
  it('不合法的登录参数', function (done) {
    request(app.listen())
      .post('/login')
      .set('Accept', 'application/json')
      .send({})
      .expect(400, done)
  })
  it('没有用户信息的登出操作', function (done) {
    request(app.listen())
      .post('/logout')
      .expect(401, done)
  })
  it('有用户信息的登出操作', function (done) {
    request(app.listen())
      .post('/logout')
      .set('cookie', `uid=${uid}`)
      .expect('set-cookie', 'uid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; httponly,login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; httponly')
      .expect(200, done)
  })
})