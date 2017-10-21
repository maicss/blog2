const request = require('supertest')
require('should-http')
const app = require('../../server')

const moments = {
  content: '<p>API测试moments</p>\n',
  weather: {
    date: '2017-10-02',
    text_day: '阵雨',
    code_day: '10',
    text_night: '阵雨',
    code_night: '10',
    high: '23',
    low: '19',
    location: '苏州'
  }
}

const uid = 1490173421950
const momentsDate = 0

describe('路由 =>【说说】测试套件：', function () {
  it('获取说说列表', function (done) {
    request(app.listen())
      .get('/moments/list?limit=10&page=1&filter=2017')
      .expect(200, function (err, res) {
        should.not.exist(err)
        res.body.should.be.an.Array()
        res.body[0].content.should.be.a.String()
        res.body[0].weather.should.be.an.Object()
        res.body[0].date.should.be.a.Number()
        res.body[0].dateStr.should.be.a.String()
        done()
      })
  })
  it('非法参数获取说说列表', function (done) {
    request(app.listen())
      .get('/moments/list')
      .expect(400, done)
  })
  it.skip('发表一个有图片的说说', function (done) {
    request(app.listen())
      .post('/moments')
      .set('cookie', `uid=${uid}`)
      .send(moments)
      .expect(200, function (err, res) {
        should.not.exist(err)
        res.body.should.be.an.Object()
        res.body.date.should.equals(moments.date)
        res.body.dateStr.should.equals(moments.dateStr)
        res.body.content.should.equals(moments.content)
        res.body.weather.should.deepEqual(moments.weather)
        done()
      })
  })
  it('发表一个没有图片的说说', function (done) {
    request(app.listen())
      .post('/moments')
      .set('cookie', `uid=${uid}`)
      .send(moments)
      .expect(200, function (err, res) {
        should.not.exist(err)
        res.body.should.be.an.Object()
        res.body.content.should.equals(moments.content)
        res.body.weather.should.deepEqual(moments.weather)
        done()
      })
  })
  it('更新一个说说', function (done) {
    request(app.listen())
      .put('/moments')
      .set('cookie', `uid=${uid}`)
      .send({content: '<p>测试使用说说 modify</p>\n', date: 1507606513299})
      .expect(200, (err, res) => {
        should.not.exist(err)
        res.body.content.should.equals('<p>测试使用说说 modify</p>\n')
        res.body.date.should.equals(1507606513299)
        done()
      })
  })
  it('更新一个不存在的说说', function (done) {
    request(app.listen())
      .put('/moments')
      .set('cookie', `uid=${uid}`)
      .send({content: '<p>API测试moments put one</p>\n', date: 1507606035189})
      .expect(204, done)
  })
  it('删除一个说说', function (done) {
    request(app.listen())
      .delete('/moments?date=1507606035187')
      .set('cookie', `uid=${uid}`)
      .expect(200, function (err, res) {
        should.not.exist(err)
        res.body.should.be.true()
        done()
      })
  })
  it('删除一个不存在的说说', function (done) {
    request(app.listen())
      .delete('/moments?date=1507606035187')
      .set('cookie', `uid=${uid}`)
      .expect(400, done)
  })
  it('获取说说总结', function (done) {
    request(app.listen())
      .get('/moments/summary')
      .expect(200, function (err, res) {
        should.not.exist(err)
        res.body.should.be.an.Object()
        res.body.content.should.be.an.Object()
        res.body.content.all.should.be.a.Number()
        done()
      })
  })
})