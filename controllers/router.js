const router = require('express').Router()
const Blog = require('../models/blogModel')

router.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

router.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  const posted = await blog.save()
  response.status(201).json(posted)
})

module.exports = router