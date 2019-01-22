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
請輸入對話訊息，如: 文字、貼圖或GIF
    
或輸入 *取消* 來結束此對話`)
    req.session.state = { type: 0, data: []}
  } else if (/\/removeall/i.test(text)) {
    await request.sendMessage(chatId,
      `您好 *${req.body.message.from.first_name} ${req.body.message.from.last_name}*, 確定要全部刪除嗎?`,
      JSON.stringify({
        inline_keyboard: [
          [{ text: '確認', callback_data: 'yes' }],
          [{ text: '取消', callback_data: 'no' }],
        ],
      }))
    req.session.state = { type: 2, data: []}
  } else if (/\/remove/i.test(text)) {
    await request.sendMessage(chatId,
      `您好 *${req.body.message.from.first_name} ${req.body.message.from.last_name}*,
請輸入要刪除的對話訊息，如: 文字、貼圖或GIF
    
或輸入 *取消* 來結束此對話`)
    req.session.state = { type: 1, data: []}
  }
}

const ifSessionState = async (req) => {
  const chatId = req.body.message.chat.id
  const text = req.body.message.text
  const sticker = req.body.message.sticker
  const animation = req.body.message.animation

  if (text !== undefined && /[取消|cancel|exit]/i.test(text)) {
    await request.sendMessage(chatId, `您好 *${req.body.message.from.first_name} ${req.body.message.from.last_name}*, 您已取消此次對話`)

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

  if (req.session.state.type == 0 && req.session.state.data.length == 1) {
    await request.sendMessage(chatId, `您好 *${req.body.message.from.first_name} ${req.body.message.from.last_name}*, 已收到您的${resText}訊息
請輸入您希望我回應甚麼，如: 文字、貼圖或GIF

或輸入 *取消* 來結束此對話`)
  } else if (req.session.state.type == 0 && req.session.state.data.length == 2) {
    await request.sendMessage(chatId, `您好 *${req.body.message.from.first_name} ${req.body.message.from.last_name}*, 對話新增完成`)

    const msg = await Conversation.findOne({ where: {
      chatId,
      qType: req.session.state.data[0].type, qMsg: req.session.state.data[0].msg }})

    if (msg) {
      await Conversation.update({
        aType: req.session.state.data[1].type, aMsg: req.session.state.data[1].msg,
      }, { where: {
        chatId,
        qType: req.session.state.data[0].type, qMsg: req.session.state.data[0].msg,
      }})
    } else {
      await Conversation.create({
        chatId,
        qType: req.session.state.data[0].type, qMsg: req.session.state.data[0].msg,
        aType: req.session.state.data[1].type, aMsg: req.session.state.data[1].msg,
      })
    }

    delete req.session.state
  } else if (req.session.state.type == 1 && req.session.state.data.length == 1) {
    await Conversation.destroy({ where: {
      chatId, qType: req.session.state.data[0].type, qMsg: req.session.state.data[0].msg
    }})
    await request.sendMessage(chatId, `您好 *${req.body.message.from.first_name} ${req.body.message.from.last_name}*, 指定對話刪除完成`)

    delete req.session.state
  }
}

const ifCallbackQuery = async (req) => {
  const chatId = req.body.callback_query.message.chat.id
  const messageId = req.body.callback_query.message.message_id

  if (!req.session.state) return

  if (req.session.state.type == 2 && req.body.callback_query.data == 'yes') {
    await Conversation.destroy({ where: { chatId }})
    await request.editMessageReplyMarkup(chatId, messageId)
    await request.sendMessage(chatId,
      `您好 *${req.body.callback_query.from.first_name} ${req.body.callback_query.from.last_name}*, 刪光光囉`)

    delete req.session.state
  } if (req.session.state.type == 2 && req.body.callback_query.data == 'no') {
    await request.editMessageReplyMarkup(chatId, messageId)
    await request.sendMessage(chatId, `您好 *${req.body.callback_query.from.first_name} ${req.body.callback_query.from.last_name}*, 您已取消此次對話`)

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
      if (req.body.callback_query) {
        await ifCallbackQuery(req)
      } else if (req.body.message.text && req.body.message.entities) {
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