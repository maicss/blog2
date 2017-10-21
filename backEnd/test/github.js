const request = require('supertest')
require('should-http')
const app = require('../../server')

describe('路由 =>【github】测试套件：', function () {
  it('github钩子测试', function (done) {
    request(app.listen())
      .post('/githubHook')
      // .set('cookie', 'uid=1506766620306')
      .expect(200, (err, res) => {
        should.not.exist(err)
        res.text.should.be.a.String()
        done()
      })
  })
})