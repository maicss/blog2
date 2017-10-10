const request = require('supertest')
require('should-http')
const app = require('../../server')

describe('路由 => 【天气】测试套件', function () {
  it('获取天气', function (done) {
    request(app.listen())
      .get('/weather')
      .expect(200, (err, res) => {
        should.not.exist(err)
        res.body.should.be.an.Object()
        res.body.results.should.be.an.Array()
        let w = res.body.results[0]
        w.location.should.be.an.Object()
        w.daily.should.be.an.Array()
        w.daily.should.have.length(3)
        done()
      })
  })
})