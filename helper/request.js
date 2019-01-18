const rp = require('request-promise')

const url = `https://api.telegram.org/bot${process.env.TG_TOKEN}`

module.exports = {
  sendAnimation: async function(chatId, animationId) {
    try {
      const uri = `${url}/sendAnimation?chat_id=${chatId}&animation=${animationId}`
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
