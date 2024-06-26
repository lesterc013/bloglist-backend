const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const logger = require('./util/logger')
const Blog = require('./models/blog')

const mongoUrl = 'mongodb+srv://lesterc013:217211@cluster0.cyovdst.mongodb.net/blogApp?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(mongoUrl)
    .then(() => logger.info('Connected to', mongoUrl))
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

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})