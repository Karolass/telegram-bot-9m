const rp = require('request-promise')

const url = `https://api.telegram.org/bot${process.env.TG_TOKEN}`

module.exports = {
  sendMessage: async function(chatId, text, reply_markup, parse_mode = 'Markdown') {
    try {
      const uri = `${url}/sendMessage`
      const body = { chat_id: chatId, text, parse_mode, reply_markup }
      await rp({ method: 'POST', uri, body, json: true })

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },
  editMessageReplyMarkup: async function(chatId, messageId) {
    try {
      const uri = `${url}/editMessageReplyMarkup`
      const body = { chat_id: chatId, message_id: messageId }
      await rp({ method: 'POST', uri, body, json: true })

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },
  sendAnimation: async function(chatId, animationId) {
    try {
      const uri = `${url}/sendAnimation?chat_id=${chatId}&animation=${animationId}`
      await rp({ uri })

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },
  sendSticker: async function(chatId, stickerId) {
    try {
      const uri = `${url}/sendSticker?chat_id=${chatId}&sticker=${stickerId}`
      await rp({ uri })

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },
  getStickerSet: async function(name) {
    try {
      const uri = `${url}/getStickerSet?name=${name}`
      const response = await rp({ uri, json: true })

      if (response.ok) {
        return response.result.stickers
      }

      return []
    } catch (error) {
      console.error(error)
      return []
    }
  },
}
