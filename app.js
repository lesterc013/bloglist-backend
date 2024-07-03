const express = require('express')
const app = express()

const cors = require('cors')
const mongoose = require('mongoose')
const logger = require('./util/logger')
const config = require('./util/config')
const middleware = require('./util/middleware')
const blogRouter = require('./controllers/blogRouter')
const userRouter = require('./controllers/userRouter')
const loginRouter = require('./controllers/loginRouter')

mongoose.set('strictQuery', false)

mongoose.connect(config.MONGODB_URI)
  .then(() => logger.info('Connected to', config.MONGODB_URI))
  .catch(error => logger.error('Error: ', error.message))

app.use(cors())
app.use(express.json())
// Call getToken middleware here
app.use(middleware.getToken)

// Because of the above middleware having next() at the end of their definitions, we then reach these router middlewares
app.use('/api/blogs', blogRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app