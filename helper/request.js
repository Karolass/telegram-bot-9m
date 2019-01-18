const config = require('../config/config.json')
const rp = require('request-promise')

const url = `https://api.telegram.org/bot${config.tg_token}`

module.exports = {
  sendAnimation: async function(chatId) {
    try {
      const uri = `${url}/sendAnimation?chat_id=${chatId}&animation=CgADBQADJwADzYlYVgXgfKW3QDpfAg`
      await rp({
        uri
      })

      return true
    } catch (error) {
      console.error(err.error)
      return false
    }
  },
  sendSticker: async function(chatId, stickerId) {
    try {
      const uri = `${url}/sendSticker?chat_id=${chatId}&sticker=${stickerId}`
      await rp({
        uri
      })

      return true
    } catch (error) {
      console.error(err.error)
      return false
    }
  },
}
