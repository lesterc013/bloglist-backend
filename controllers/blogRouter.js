const blogRouter = require('express').Router()
const Blog = require('../models/blogModel')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

// GET all blogs
blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
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

// // getToken function
// const getToken = request => {
//   const authorization = request.get('Authorization')
//   // Check if authorization truthy and whether starts with 'Bearer  i.e. token
//   if (authorization && authorization.startsWith('Bearer ')) {
//     // Then get the token out -- The value of Authorization is always 'Bearer <token>' hence the need to replace
//     return authorization.replace('Bearer ', '')
//   }
//   return null
// }

// POST one blog
// Since getToken has been moved to middlware, it has already altered request so that request obj has request.token inside it
blogRouter.post('/', async (request, response, next) => {
  const body = request.body

  let payload = null
  // Handle case that token is not even valid
  try {
    payload = jwt.verify(request.token, process.env.SECRET_KEY)
  } catch (error) {
    return next(error)
  }

  // Handle case that token can be decoded, but there is no id in the payload
  if (!payload.id) {
    const error = new Error('invalid token')
    error.statusCode = 401
    return next(error)
  }

  // Else, can now use the payload.id to search for this specific user
  const user = await User.findById(payload.id)

  const blog = new Blog({
    title: body.title,
    author: body.title || null,
    url: body.url,
    likes: body.likes,
    user: user._id
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
      error: error.message
    })
  }
})

// DELETE one blog
blogRouter.delete('/:id', async (request, response, next) => {
  let payload = null
  // Handle case that token is not even valid
  try {
    payload = jwt.verify(request.token, process.env.SECRET_KEY)
  } catch (error) {
    return next(error)
  }

  // Handle case that token can be decoded, but there is no id in the payload
  if (!payload.id) {
    const error = new Error('invalid token')
    error.statusCode = 401
    return next(error)
  }

  // Find the blog based on the id from the path
  const blog = await Blog.findById(request.params.id).populate('user')
  const userIdFromBlog = blog.user.id
  // Check if both user ids are same
  if (payload.id === userIdFromBlog) {
    try {
      const user = await User.findById(payload.id).populate('blogs')
      console.log('Current blogs', user.blogs)

      user.blogs = user.blogs.filter(blog => blog._id.toString() !== request.params.id)
      console.log('User blogs after', user.blogs)

      // Then save this user to the db
      await user.save()

      const updatedUser = await User.findById(payload.id).populate('blogs')
      console.log(updatedUser.blogs)

      await Blog.findByIdAndDelete(request.params.id)
      response.status(204).json({
        success: 'blog deleted'
      })
    } catch (error) {
      next(error)
    }
  }
  else {
    const error = new Error('unauthorized user - blog was not added by this user')
    error.name = 'UnauthorizedError'
    error.statusCode = 401
    next(error)
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