const request = require('../helper/request')

const ifAnimation = async (chatId, animation) => {
  if (animation.file_id == 'CgADBQADRgADAlHRVLbNrMgH9W3BAg') {
    await request.sendAnimation(chatId)
  }
}

const ifText = async (chatId, text) => {
  switch (text) {
    case '哇靠':
      await request.sendSticker(chatId, 'CAADBQAD8wEAAhZUFRVhJIk8t8-mWgI')
      break;
  }
}

module.exports = {
  webhook: async(req, res) => {
    try {
      console.log(req.body)
      const chatId = req.body.message.chat.id

      if (req.body.message.animation) {
        await ifAnimation(chatId, req.body.message.animation)
      } else if (req.body.message.text) {
        await ifText(chatId, req.body.message.text)
      }

      return res.send()
    } catch (err) {
      return res.status(500).send(err.error)
    }
  },
}