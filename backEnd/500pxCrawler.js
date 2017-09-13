const request = require('request')
const fs = require('fs')
let csrfToken = 'jbKRKCSc5Y/FVWi9QVzQzSNLLuZH3Kn1LrWMi45aKLYHB/UdhaGGgi+tsIRUSg6LJ5zAc3xRZbVE/chFdTutDQ=='
const likedDir = '../frontEnd/img/index/liked/'
const tempDir = '../frontEnd/img/index/temp/'

const hpx1 = 'BAh7C0kiD3Nlc3Npb25faWQGOgZFVEkiJWQ2OTViYzVhZDhjOGNlNzNjZjNkZjhlMjEyOWIyYjE1BjsAVEkiCWhvc3QGOwBGIg41MDBweC5jb21JIhl3YXJkZW4udXNlci51c2VyLmtleQY7AFRbB1sGaQQHMTUBSSIiJDJhJDEwJEUvTExQWjBUN2g1TTR3Sm5XMm1XZ2UGOwBUSSIQX2NzcmZfdG9rZW4GOwBGSSIxaXJWa05hRTlZdzNxK05nNUZSYmVSZ1RYN3BVN2pjeEFha2hFenZ0aGhicz0GOwBGSSIYc3VwZXJfc2VjcmV0X3BpeDNscwY7AEZGSSIRcHJldmlvdXNfdXJsBjsARkkiDS9lZGl0b3JzBjsAVA%3D%3D--bfe4d50c92632915c19b42af178d428d9a7b5e9e'

const crawlerOptions = {
  method: 'GET',
  url: 'https://api.500px.com/v1/photos',
  headers: {
    'cache-control': 'no-cache',
    'Cookie': '_hpx1=' + hpx1,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3213.3 Safari/537.36',
    'x-csrf-token': csrfToken,
    'referer': 'https://500px.com/editors',
    Origin: 'https://500px.com',
    Host: 'api.500px.com',
  },
  qs: {
    rpp: '50',
    'image_size[]': '2048',
    formats: 'jpeg,lytro',
    feature: 'editors',
    page: '1',
  }
}

request(crawlerOptions, function (err, res) {
  if (err) {
    return console.error(err)
  } else {
    const data = JSON.parse(res.body)
    const images = data.photos.map(p => ({
      name: p.name,
      author: p.user.username,
      width: p.width,
      height: p.height,
      id: p.id,
      format: p.format,
      url: p.image_url[0]
    }))

    while (images.length) {
      let image = images.pop()
      let r = request.get(image.url)
      r.on('response', function (resp) {
        if (resp.statusCode === 200) {
          r.pipe(fs.createWriteStream(tempDir + image.id + '.' + image.format))
        } else {
          images.push(image)
        }
      })
    }
  }
})
