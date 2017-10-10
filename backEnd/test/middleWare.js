const request = require('supertest')
require('should-http')

const app = require('../../server')

const uid = 1490173421950

describe('中间件 => identificationCheck测试套件', function () {
  it('带UID的post请求', function (done) {
    request(app.listen())
      .post('/logout')
      .set('Cookie', `uid=${uid}`)
      .expect(200, done)
  })
  it('不带UID的post请求', function (done) {
    request(app.listen())
      .post('/logout')
      .expect(401, done)
  })
  it('带错的UID的post请求', function (done) {
    request(app.listen())
      .post('/logout')
      .set('Cookie', `uid=${uid+1}`)
      .expect(401, done)
  })
  it('不带UID的get请求和post login的请求', function (done) {
    request(app.listen())
      .get('/indexImage')
      .expect(200, done)
  })
  it('带UID的get请求和post login的请求', function (done) {
    request(app.listen())
      .get('/indexImage')
      .set('Cookie', `uid=${uid}`)
      .expect(200, done)
  })
})