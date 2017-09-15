const request = require('request-promise')
const _request = require('request').defaults({encoding: null})
const fs = require('fs')
const {logger} = require('./utils')

let csrfToken = 'jbKRKCSc5Y/FVWi9QVzQzSNLLuZH3Kn1LrWMi45aKLYHB/UdhaGGgi+tsIRUSg6LJ5zAc3xRZbVE/chFdTutDQ=='
const tempDir = '../frontEnd/img/index/temp/'
const hpx1 = 'BAh7C0kiD3Nlc3Npb25faWQGOgZFVEkiJWQ2OTViYzVhZDhjOGNlNzNjZjNkZjhlMjEyOWIyYjE1BjsAVEkiCWhvc3QGOw' + 'BGIg41MDBweC5jb21JIhl3YXJkZW4udXNlci51c2VyLmtleQY7AFRbB1sGaQQHMTUBSSIiJDJhJDEwJEUvTExQWjBUN2g1TTR3Sm5XMm1XZ2U' + 'GOwBUSSIQX2NzcmZfdG9rZW4GOwBGSSIxaXJWa05hRTlZdzNxK05nNUZSYmVSZ1RYN3BVN2pjeEFha2hFenZ0aGhicz0GOwBGSSIYc3VwZXJfc2' +
  'VjcmV0X3BpeDNscwY7AEZGSSIRcHJldmlvdXNfdXJsBjsARkkiDS9lZGl0b3JzBjsAVA%3D%3D--bfe4d50c92632915c19b42af178d428d9a7b5e9e'

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

const downLoadFile = (url, path) => {
  return new Promise((resolve, reject) => {
    _request.get(url, function (err, res, body) {
      if (err) reject(err)
      fs.writeFile(path, body, function (e) {
        if (e) reject(e)
        resolve('done')
      })
    })
  })
}

module.exports = async () => {
  try {
    const body = await request(crawlerOptions)
    const data = JSON.parse(body)
    const images = data.photos.map(p => ({
      name: p.name,
      author: p.user.username,
      width: p.width,
      height: p.height,
      id: p.id,
      format: p.image_format,
      url: p.image_url[0]
    })).filter(image => image.width >= image.height && image.width > 1500)
    // todo images 存数据库
    return await Promise.all([images.map(img => downLoadFile(img.url, tempDir + img.id + '.' + img.format))])
  } catch (e) {
    return e
  }
}


const aa = async () => {
  try {
    const body = await request(crawlerOptions)
    const data = JSON.parse(body)
    const images = data.photos.map(p => ({
      name: p.name,
      author: p.user.username,
      width: p.width,
      height: p.height,
      id: p.id,
      format: p.image_format,
      url: p.image_url[0]
    })).filter(image => image.width >= image.height && image.width > 1500)
    // todo images 存数据库
    Promise.all([images.map(img => downLoadFile(img.url, tempDir + img.id + '.' + img.format))]).then(d => {
      console.log('promise all: ', d)
    })
  } catch (e) {
    return e
  }
}

// aa().then(d => {
//   console.log('crawler: ')
//   console.log(d)
// }).catch(e => console.error(e))
