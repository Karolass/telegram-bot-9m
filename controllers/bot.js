const request = require('../helper/request')
const Conversation = require('../models')

const ifAnimation = async (req) => {
  const chatId = req.body.message.chat.id
  const animationId = req.body.message.animation.file_id

  const data = await Conversation.findOne({ where: { chatId, qType: 2, qMsg: animationId }})

  if (data) {
    await sendByAType(chatId, data)
  }
}

const ifSticker = async (req) => {
  const chatId = req.body.message.chat.id
  const stickerId = req.body.message.sticker.file_id

  const data = await Conversation.findOne({ where: { chatId, qType: 1, qMsg: stickerId }})

  if (data) {
    await sendByAType(chatId, data)
  }
}

const ifText = async (req) => {
  const chatId = req.body.message.chat.id
  const text = req.body.message.text

  const data = await Conversation.findAll({ where: { chatId, qType: 0 }})

  for (const d of data) {
    const re = new RegExp(d.qMsg, 'i')
    if (re.test(text)) {
      await sendByAType(chatId, d)
    }
  }
}

const ifCommand = async (req) => {
  const chatId = req.body.message.chat.id
  const text = req.body.message.text

  if (/\/random/i.test(text)) {
    const stickers = await request.getStickerSet('cherryGang')
    if (stickers.length == 0) return
    const index = Math.floor(Math.random() * stickers.length)
    await request.sendSticker(chatId, stickers[index].file_id)
  } else if (/\/conversation/i.test(text)) {
    await request.sendMessage(chatId,
      `您好 *${req.body.message.from.first_name} ${req.body.message.from.last_name}*,
請輸入對話，如: 文字、貼圖或GIF
    
或輸入 *取消* 來結束此對話`)
    req.session.state = { type: 0, data: []}
  }
}

const ifSessionState = async (req) => {
  const chatId = req.body.message.chat.id
  const text = req.body.message.text
  const sticker = req.body.message.sticker
  const animation = req.body.message.animation

  if (text !== undefined && /[取消|cancel|exit]/i.test(text)) {
    await request.sendMessage(chatId, `您好 *${req.body.message.from.first_name} ${req.body.message.from.last_name}*, 您已取消此次新增對話`)

    delete req.session.state
    return
  }

  let resText
  if (text) {
    resText = '文字'
    req.session.state.data.push({ type: 0, msg: text })
  } else if (sticker) {
    resText = '貼圖'
    req.session.state.data.push({ type: 1, msg: sticker.file_id })
  } else if (animation) {
    resText = 'GIF'
    req.session.state.data.push({ type: 2, msg: animation.file_id })
  }

  if (req.session.state.data.length == 1) {
    await request.sendMessage(chatId, `您好 *${req.body.message.from.first_name} ${req.body.message.from.last_name}*, 已收到您的${resText}訊息
請輸入您希望我回應甚麼，如: 文字、貼圖或GIF

或輸入 *取消* 來結束此對話`)
  } else if (req.session.state.data.length == 2) {
    await request.sendMessage(chatId, `您好 *${req.body.message.from.first_name} ${req.body.message.from.last_name}*, 對話新增完成`)

    await Conversation.create({
      chatId,
      qType: req.session.state.data[0].type, qMsg: req.session.state.data[0].msg,
      aType: req.session.state.data[1].type, aMsg: req.session.state.data[1].msg,
    })

    delete req.session.state
  }
}

const sendByAType = async (chatId, data) => {
  switch (data.aType) {
    case 0:
      await request.sendMessage(chatId, data.aMsg)
      break
    case 1:
      await request.sendSticker(chatId, data.aMsg)
      break
    case 2:
      await request.sendAnimation(chatId, data.aMsg)
      break
  }
}

module.exports = {
  webhook: async (req, res) => {
    try {
      if (req.body.message.text && req.body.message.entities) {
        await ifCommand(req)
      } else if (req.session.state) {
        await ifSessionState(req)
      } else if (req.body.message.text) {
        await ifText(req)
      } else if (req.body.message.sticker) {
        await ifSticker(req)
      } else if (req.body.message.animation) {
        await ifAnimation(req)
      }

      return res.send()
    } catch (err) {
      console.error(err)
      return res.status(500).send(err.error)
    }
  },
}