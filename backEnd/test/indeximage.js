const request = require('supertest')
require('should-http')
const app = require('../../server')

describe('路由 => 【首页图片】测试套件', function () {
  it('数据库为空的时候，获取一张图片', function (done) {
    // 这个会自动爬取图片，所以一般情况下肯定会有的，只是超时要很久
    this.timeout(0)
    request(app.listen())
      .get('/indexImage')
      .expect(200, (err, res) => {
        should.not.exist(err)
        res.body.should.be.an.Object()
        res.body.path.should.be.a.String()
        res.body.type.should.be.a.String()
        res.body.url.should.be.a.String()
        res.body.format.should.be.a.String()
        res.body.author.should.be.a.String()
        res.body.name.should.be.a.String()
        res.body.id.should.be.a.Number()
        res.body.width.should.be.a.Number()
        res.body.height.should.be.a.Number()
        done()
      })
  })
})