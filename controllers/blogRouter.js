const blogRouter = require('express').Router()
const Blog = require('../models/blogModel')
const User = require('../models/userModel')
const middleware = require('../util/middleware')

// GET all blogs
blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

// GET specific blogs based on id
blogRouter.get('/:id', middleware.validateId, async (request, response) => {
  const note = await Blog.findById(request.params.id).exec()
  if (note) {
    response.status(200).json(note)
  } else {
    response.status(404).end()
  }
})

// POST one blog
// Since getToken has been moved to middlware, it has already altered request so that request obj has request.token inside it
blogRouter.post(
  '/',
  middleware.extractPayload,
  middleware.extractUsername,
  async (request, response) => {
    const body = request.body
    const payload = request.payload

    // Else, can now use the payload.id to search for this specific user
    const user = await User.findById(payload.id)

    const blog = new Blog({
      title: body.title,
      author: body.author || null,
      url: body.url,
      likes: body.likes,
      user: user._id,
    })

    try {
      const posted = await blog.save()
      // Update this instance of the user -- user.blogs with the id of the posted blog
      user.blogs = user.blogs.concat(posted._id)
      // Then call save to update it
      await user.save()
      response.status(201).json(posted)
    } catch (error) {
      response.status(400).json({
        error: error.message,
      })
    }
  }
)

// DELETE one blog
blogRouter.delete(
  '/:id',
  middleware.extractPayload,
  middleware.extractUsername,
  middleware.validateId,
  async (request, response, next) => {
    const payload = request.payload
    console.log('Payload', payload)

    // Find the blog based on the id from the path
    const blog = await Blog.findById(request.params.id).populate('user')
    const userIdFromBlog = blog.user.id
    // Check if both user ids are same
    if (payload.id === userIdFromBlog) {
      try {
        // To remove the blog information from the user first
        const user = await User.findById(payload.id).populate('blogs')
        user.blogs = user.blogs.filter(
          (blog) => blog._id.toString() !== request.params.id
        )
        // Then save this user to the db
        await user.save()
        await Blog.findByIdAndDelete(request.params.id)
        response.status(204).json({
          success: 'blog deleted',
        })
      } catch (error) {
        next(error)
      }
    } else {
      const error = new Error(
        'unauthorized user - blog was not added by this user'
      )
      error.name = 'UnauthorizedError'
      error.statusCode = 401
      next(error)
    }
  }
)

// PUT request to update a single blog
blogRouter.put('/:id', middleware.validateId, async (request, response) => {
  const body = request.body

  try {
    const update = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
    }
    const returnedBlogDocument = await Blog.findByIdAndUpdate(
      request.params.id,
      update,
      { new: true }
    )
    response.status(201).json(returnedBlogDocument)
  } catch (error) {
    response.status(400).json({
      error: error.message,
    })
  }
})

module.exports = blogRouter
