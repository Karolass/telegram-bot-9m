const request = require('../helper/request')

const ifAnimation = async (chatId, animation) => {
  if (animation.file_id == 'CgADBQADRgADAlHRVLbNrMgH9W3BAg') {
    await request.sendAnimation(chatId, 'CgADBQADJwADzYlYVgXgfKW3QDpfAg')
  } else if (animation.file_id == 'CgADBQADJwADzYlYVgXgfKW3QDpfAg') {
    await request.sendAnimation(chatId, 'CgADBQADRgADAlHRVLbNrMgH9W3BAg')
  }
}

const ifText = async (chatId, text) => {
  if (/哇靠/i.test(text)) {
    await request.sendSticker(chatId, 'CAADBQAD8wEAAhZUFRVhJIk8t8-mWgI')
  } else if (/傻眼/i.test(text)) {
    await request.sendSticker(chatId, 'CAADBQADCAIAAhZUFRUNgHEHih2ysQI')
  } else if (/喬瑟夫/i.test(text)) {
    await request.sendAnimation(chatId, 'CgADBQADRwAD6gQQVfERILdPn8_zAg')
  } else if (/不是吧/i.test(text)) {
    await request.sendSticker(chatId, 'CAADBQAD9AEAAhZUFRUgCTdacKLTkQI')
  } else if (/求包養/i.test(text)) {
    await request.sendSticker(chatId, 'CAADBQAD_AEAAhZUFRV0woJ6SekjNQI')
  } else if (/有病/i.test(text)) {
    await request.sendSticker(chatId, 'CAADBQAD-wEAAhZUFRVE_IjYqIcvQAI')
  } else if (/興奮/i.test(text)) {
    await request.sendSticker(chatId, 'CAADBQADCgIAAhZUFRV_Hv6tJvdJUQI')
  } else if (/QQ/i.test(text)) {
    await request.sendSticker(chatId, 'CAADBQADBwIAAhZUFRVDo07nzoPQbgI')
  } else if (/甲甲/i.test(text)) {
    await request.sendSticker(chatId, 'CAADBQADBAIAAhZUFRXTMnOJyUjC3wI')
  } else if (/屌/i.test(text)) {
    await request.sendSticker(chatId, 'CAADBQADDQIAAhZUFRUN4_JgD3TfewI')
  }
}

const ifCommand = async (chatId, text) => {
  if (/\/random/i.test(text)) {
    const stickers = await request.getStickerSet('cherryGang')
    if (stickers.length == 0) return
    const index = Math.floor(Math.random() * stickers.length)
    await request.sendSticker(chatId, stickers[index].file_id)
  }
}

module.exports = {
  webhook: async (req, res) => {
    try {
      console.log(JSON.stringify(req.body))
      if (req.body.edited_message) return res.send()

      const chatId = req.body.message.chat.id

      if (req.body.message.animation) {
        await ifAnimation(chatId, req.body.message.animation)
      } else if (req.body.message.text && !req.body.message.entities) {
        await ifText(chatId, req.body.message.text.trim())
      } else if (req.body.message.text && req.body.message.entities) {
        await ifCommand(chatId, req.body.message.text.trim())
      }

      return res.send()
    } catch (err) {
      console.error(err)
      return res.status(500).send(err.error)
    }
  },
}