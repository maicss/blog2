const request = require('request-promise')
const _request = require('request').defaults({encoding: null})
const fs = require('fs')

/**
 * 爬取图片信息、过滤尺寸，下载图片、返回下载成功的图片信息列表
 * */

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
    _request(url, (err, res, body) => {
      if (err) return reject(err)
      fs.writeFile(path, body, e => {
        if (e) return reject(e)
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
      url: p.image_url[0],
      type: 'temp',
    })).filter(image => image.width >= image.height && image.width > 1500)
    let downloadRes = await Promise.all(images.map(img => downLoadFile(img.url, tempDir + img.id + '.' + img.format)))
    return downloadRes.map((r, i) => {
      if (r === 'done') {
        return images[i]
      } else {
        return undefined
      }
    }).filter(image => image.id)
  } catch (e) {
    return e
  }
}
