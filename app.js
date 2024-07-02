const express = require('express')
const app = express()

const cors = require('cors')
const mongoose = require('mongoose')
const logger = require('./util/logger')
const config = require('./util/config')
const blogRouter = require('./controllers/blogRouter')

mongoose.set('strictQuery', false)

mongoose.connect(config.MONGODB_URI)
  .then(() => logger.info('Connected to', config.MONGODB_URI))
  .catch(error => logger.error('Error: ', error.message))

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogRouter)

module.exports = app