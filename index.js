const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const logger = require('./util/logger')
const config = require('./util/config')
const Blog = require('./models/blogModel')
const router = require('./controllers/router')

mongoose.connect(config.MONGODB_URI)
    .then(() => logger.info('Connected to', config.MONGODB_URI))
    .catch(error => logger.error('Error: ', error.message))

app.use(cors())
app.use(express.json())

app.use('/api/blogs', router)

const PORT = config.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})