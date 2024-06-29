const router = require('express').Router()
const Blog = require('../models/blogModel')

// GET all notes
router.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

// GET specific note based on id
router.get('/:id', async (request, response) => {
  const note = await Blog.findById(request.params.id).exec()
  if (note) {
    response.status(200).json(note)
  }
  else {
    response.status(404).end()
  }
})

// POST one note
router.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  const posted = await blog.save()
  response.status(201).json(posted)
})

module.exports = router