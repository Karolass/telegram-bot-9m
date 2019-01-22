const { sequelize } = require('./models')

console.log('***** Creating/Altering Table *****')
sequelize
  .sync({ alter: true })
  .then(async() => {
    console.log('***** Creating/Altering Table Success *****')

    process.exit()
  })
  .catch((error) => {
    console.error('***** Creating/Altering Table With Error *****')
    console.error(error)
    process.exit()
  })