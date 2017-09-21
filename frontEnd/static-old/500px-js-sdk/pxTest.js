const px = require('./500px')

const sdk = '9613951a914ed12b825410a7807221a17b0cd653'

const p = new px()
p.init({sdk_key: sdk})
p.login()

p.on('authorization_obtained', function () {

  console.log('authorization_obtained')

  // Get my user id
  p.api('/users', function (response) {
    console.log(response)
    var me = response.data.user

    // Get my favorites
    p.api('/photos', {feature: 'user_favorites', user_id: me.id}, function (response) {
      console.log(response.data.photos)
    })
  })
})
