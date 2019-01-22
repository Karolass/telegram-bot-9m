const Sequelize = require('sequelize')

const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: 'db.sqlite'
})

// type 0: text, 1: sticker, 2: animation
const conversation = {
  chatId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },

  qType: { type: Sequelize.INTEGER(1), allowNull: false, defaultValue: 0 },
  qMsg: { type: Sequelize.STRING, allowNull: false },
  aType: { type: Sequelize.INTEGER(1), allowNull: false, defaultValue: 0 },
  aMsg: { type: Sequelize.STRING, allowNull: false },
}

const options = {
  indexes: [
    {
      fields: ['chatId']
    }
  ]
}

const Conversation = sequelize.define('conversation', conversation, options)

module.exports = Conversation