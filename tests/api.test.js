// npm modules
// npm test -- tests/note_api.test.js
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')

// Same directory modules
const app = require('../app')
const Blog = require('../models/blogModel')
const helper = require('./test_helper')

// Wrap supertest around app so we can use supertest methods
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  // Create an array of Blog objects
  // Mapping .save() on all the Blog objects to create a new array of Promises
  // End goal is to use Promise.all() on an array of Promises
  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blogObj => blogObj.save())
  await Promise.all(promiseArray)
})

/**
 * Test making HTTP GET request to /api/blogs
 * Should return the correct amount of blog posts
 * Should return the blog posts in JSON format
 */
test('Make HTTP GET request to /api/blogs', async () => {
  // Check if return status and return type is correct i.e. 200 and JSON
  const httpResponse = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  // Note that we need to put await for the helper function. That is because the fn is async in nature even though it returns a JSON array. So if we want an async fn's values, we need to await it
  const initialBlogs = await helper.getBlogsInJSON()

  // Check for correct amount of blogs returned
  assert.strictEqual(httpResponse.body.length, initialBlogs.length)
})

/**
 * Verify if the unique identifier property is named id
 * Get the response back first -- can just be any GET
 * Use Object.keys() to get the keys returned in an array
 * Use assert(array.includes('id))
 */
test('Verify unique identifier property is id', async () => {
  const httpResponse = await api.get('/api/blogs')
  const firstBlog = httpResponse.body[0] // Just take the first blog
  const keys = Object.keys(firstBlog)
  assert(keys.includes('id'))
})

/**
 * Verify that HTTP POST request successfully creates new blog post
 * initialBlogs
 * Create the note to be posted
 * POST expect 201, expect Content-Type application/json
 * Check the whether the returned length is +1 of initial
 */
test('Check POST request successful', async () => {
  const initialBlogs = await helper.getBlogsInJSON()

  // Note: Not posting a Mongoose document but rather a JS object
  const blog = {
    title: 'Testing',
    author: 'Tester',
    url: 'testing.com',
    likes: 1
  }
  // Check for the correct status and type
  await api
    .post('/api/blogs')
    .send(blog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const getResponse = await api.get('/api/blogs')

  // Check if after posting, the get response length is +1 initial length
  assert.strictEqual(getResponse.body.length, initialBlogs.length+1)

  // Check if the content posted was correct
  // From the GET response, access the body which are all the blog objects
  // map the title of the blog objects to an array
  // Check if 'Testing' is included
  const titles = getResponse.body.map(blog => blog.title)
  assert(titles.includes(blog.title))
})

/**
 * Verify that if likes is missing from a note, likes will be set to 0
 * POST the blog
 * Retrieve the id from the POST response
 * GET the specific blog
 * Check if the likes in the blog is 0
 */
test('Check if no likes provided, default is 0', async () => {
  const blog = {
    title: 'Testing',
    author: 'Tester',
    url: 'testing.com',
  }

  const postResponse = await api.post('/api/blogs').send(blog)
  const postedId = postResponse.body.id

  const getResponse = await api.get(`/api/blogs/${postedId}`)

  assert.strictEqual(getResponse.body.likes, 0)
})

/**
 * If title not provided
 * Expect 400
 */
describe('Expect 400 if', () => {
  test('Title not provided', async () => {
    const blog = {
      author: 'Tester',
      url: 'testing.com',
    }

    await api
      .post('/api/blogs')
      .send(blog)
      .expect(400)
  })

  test('URL not provided', async () => {
    const blog = {
      title: 'Testing',
      author: 'Tester',
    }

    await api
      .post('/api/blogs')
      .send(blog)
      .expect(400)
  })

  test('Title and URL not provided', async () => {
    const blog = {
      author: 'Tester',
    }

    await api
      .post('/api/blogs')
      .send(blog)
      .expect(400)
  })
})

// DELETE functionality test
describe('Deleting a single blog', () => {
  test('For a valid blog id, is successful', async () => {
    // Also check if the blogsAtEnd content !includes the firstBlog.content

    const blogsAtStart = await helper.getBlogsInJSON()
    const firstBlog = blogsAtStart[0]

    // Status code check
    await api
      .delete(`/api/blogs/${firstBlog.id}`)
      .expect(204)

    // Length check
    const blogsAtEnd = await helper.getBlogsInJSON()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    // Titles check
    const titles = blogsAtEnd.map(blog => blog.title)
    assert(!titles.includes(firstBlog.title))
  })

  test('Invalid blog id should return 400', async () => {
    const invalidId = 'invalid'

    await api
      .delete(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

// PUT functionality test
/**
 * Valid ID
 * - Construct a update to send
 * - Get the initialBlog[0]
 * - api put to this id
 * - Expect 201
 * - Content-Type json
 * - Length check blogsAtEnd no difference
 * - Content check that indeed updated
 * Non Valid ID
 */
describe('Updating a single blog', () => {
  test('Successful for a valid blog id', async () => {
    const blogsAtStart = await helper.getBlogsInJSON()
    const firstBlog = blogsAtStart[0]
    const update = {
      title: 'Updated with PUT',
      author: 'Updated with PUT',
      url: 'Updated with PUT',
      likes: 60
    }

    await api
      .put(`/api/blogs/${firstBlog.id}`)
      .send(update)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    // Length check
    const blogsAtEnd = await helper.getBlogsInJSON()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)

    // Title check
    const titles = blogsAtEnd.map(blog => blog.title)
    assert(titles.includes(update.title))
  })

  test('Invalid blog id will return 400', async () => {
    const invalidId = 'invalid'
    const update = {
      title: 'Updated with PUT',
      author: 'Updated with PUT',
      url: 'Updated with PUT',
      likes: 60
    }

    await api
      .put(`/api/blogs/${invalidId.id}`)
      .send(update)
      .expect(400)
  })
})

after(async () => {
  await mongoose.connection.close()
})