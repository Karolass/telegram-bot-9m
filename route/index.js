const express = require('express')

const bot = require('../controllers/bot')

const route = {
  '/': [
    ['post', '/', bot.webhook],
  ],
}

// Memory Session
const MemorySession = {}
function sessionMiddleWare(req, res, next) {
  console.log(JSON.stringify(req.body))
  if (req.body.edited_message) return res.send()

  const chatId = req.body.message.chat.id
  const userId = req.body.message.from.id
  if (!MemorySession[chatId]) MemorySession[chatId] = {}
  if (!MemorySession[chatId][userId]) MemorySession[chatId][userId] = { user: req.body.message.from }

  req.session = MemorySession[chatId][userId]
  next()
}

function mainRoute(app, route, prefix) {
  for (const key in route) {
    const path = prefix ? `${prefix}/${key}` : `${key}`

    if (route[key].length === undefined) {
      mainRoute(app, route[key], path)
    } else {
      const array = route[key]
      const router = routeProcess(array)
      app.use(`/${path}`, router)
    }
  }
}

function routeProcess(array, prefix) {
  const router = express.Router()
  array.forEach(function(value) {
    const path = prefix ? `/${prefix}${value[1]}` : value[1]
    if (value.length > 3) {
      for (let i = 3; i < value.length; i++) {
        if (typeof value[i] === 'function') {
          router[value[0]](path, value[i])
        }
      }
    }
    if (typeof value[2] === 'function') {
      router[value[0]](path, value[2])
    }
  })

  return router
}

module.exports = function(app) {

  app.all('*', sessionMiddleWare)

  mainRoute(app, route)

  app.get('/', function(req, res) {
    res.render('index')
  })
}
