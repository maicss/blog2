const request = require('request-promise')
const fs = require('fs')
const {logger} = require('./utils')

let csrfToken = 'jbKRKCSc5Y/FVWi9QVzQzSNLLuZH3Kn1LrWMi45aKLYHB/UdhaGGgi+tsIRUSg6LJ5zAc3xRZbVE/chFdTutDQ=='
const tempDir = './frontEnd/img/index/temp/'
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

const writeStream = async (path) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path);
    file.end();
    file.on("end", () => resolve); // not sure why you want to pass a boolean
    file.on("error", reject); // don't forget this!
  });
}

module.exports = async () => {
  try {
    const body = await request(crawlerOptions)
    const data = JSON.parse(body)
    logger.info('get image data success: ', data)
    const images = data.photos.map(p => ({
      name: p.name,
      author: p.user.username,
      width: p.width,
      height: p.height,
      id: p.id,
      format: p.image_format,
      url: p.image_url[0]
    }))
    for (let i=0; i<images.length; i++) {
      let r = await request(images[i].url)
      logger.info('get image success: ', images[i].id + '.' + images[i].format)
      // todo  ERROR: r.pipe is not a function
      await r.pipe(fs.createWriteStream(tempDir + images[i].id + '.' + images[i].format))
    }
    return true
  } catch (e) {
    return e
  }
}
