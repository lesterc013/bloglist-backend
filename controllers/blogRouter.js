const blogRouter = require('express').Router()
const Blog = require('../models/blogModel')

// GET all blogs
blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

// GET specific blogs based on id
blogRouter.get('/:id', async (request, response) => {
  const note = await Blog.findById(request.params.id).exec()
  if (note) {
    response.status(200).json(note)
  }
  else {
    response.status(404).end()
  }
})

// POST one blog
blogRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  try {
    const posted = await blog.save()
    response.status(201).json(posted)
  } catch (error) {
    response.status(400).json({
      error: error.message
    })
  }
})

// DELETE one blog
blogRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).json({
      success: 'content deleted'
    })
  } catch (error) {
    response.status(400).json({
      error: error.message
    })
  }
})

// PUT request to update a single blog
blogRouter.put('/:id', async (request, response) => {
  const body = request.body

  try {
    const update = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    }
    const returnedBlogDocument = await Blog.findByIdAndUpdate(request.params.id, update, { new: true })
    response.status(201).json(returnedBlogDocument)
  } catch (error) {
    response.status(400).json({
      error: error.message
    })
  }
})

module.exports = blogRouter