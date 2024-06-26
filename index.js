const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const logger = require('./util/logger')
const config = require('./util/config')
const Blog = require('./models/blog')

// const mongoUrl = 'mongodb+srv://lesterc013:217211@cluster0.cyovdst.mongodb.net/blogApp?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(config.MONGODB_URI)
    .then(() => logger.info('Connected to', config.MONGODB_URI))
    .catch(error => logger.error('Error: ', error.message))

app.use(cors())
app.use(express.json())

app.get('/api/blogs', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

app.post('/api/blogs', async (request, response) => {
  const blog = new Blog(request.body)
  const posted = await blog.save()
  response.status(201).json(posted)
})

const PORT = config.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})