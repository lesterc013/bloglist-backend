// npm modules
// npm test -- tests/note_api.test.js
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')

// Same directory modules
const app = require('../app')
const Blog = require('../models/blogModel')
const User = require('../models/userModel')
const helper = require('./test_helper')

// Wrap supertest around app so we can use supertest methods
const api = supertest(app)
// Global token variable so we can call it in beforeAll, and then use it in all the appropriate tests
let token = null

beforeEach(async () => {
  await Blog.deleteMany({})

  // Create an array of Blog objects
  // Mapping .save() on all the Blog objects to create a new array of Promises
  // End goal is to use Promise.all() on an array of Promises
  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blogObj => blogObj.save())
  await Promise.all(promiseArray)

  // Clear and populate Users database also
  await User.deleteMany({})
  await User.insertMany(helper.initialUsers)

  // Initialise a token for POST and DELETE use
  token = await helper.getToken(api)
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
    .set('Authorization', `Bearer ${token}`)
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
 * Check if after POST with certain user tagging, does it actually get saved correctly
 */
test('Check if blog is saved with user details', async () => {
  const blog = {
    title: 'Testing',
    author: 'Tester',
    url: 'testing.com',
    likes: 1
  }

  // Note that the user id will be added in the route portion
  const postResponse = await api.post('/api/blogs').send(blog).set('Authorization', `Bearer ${token}`)
  const blogId = postResponse.body.id

  const getResponse = await api.get(`/api/blogs/${blogId}`)

  // The user id that was returned in the postResponse should be the same as the one from the getResponse
  assert.strictEqual(postResponse.body.user, getResponse.body.user)
})

test('When call GET to /api/users, check if the user that posted the blog has the blog details saved in it', async () => {
  // Post the test blogs (the id will be saved in users[0] for now)
  const payload = jwt.verify(token, process.env.SECRET_KEY) // So we can access this userid
  const blog = {
    title: 'Testing',
    author: 'Tester',
    url: 'testing.com',
    likes: 1
  }

  await api
    .post('/api/blogs')
    .send(blog)
    .set('Authorization', `Bearer ${token}`)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  // Need to check if the posted blog id is in the user
  const getResponse = await api.get('/api/users')
  const poster = getResponse.body.find(blog => blog.id === payload.id)
  const blogObjInPoster = poster.blogs
  const blogsAfter = await helper.getBlogsInJSON()
  const postedBlog = blogsAfter.filter(blogAfter => blogAfter.title === blog.title)
  assert.strictEqual(blogObjInPoster[0].id, postedBlog[0].id)
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

  const postResponse = await api
    .post('/api/blogs')
    .send(blog)
    .set('Authorization', `Bearer ${token}`)

  const postedId = postResponse.body.id

  const getResponse = await api.get(`/api/blogs/${postedId}`)

  assert.strictEqual(getResponse.body.likes, 0)
})

/**
 * If title not provided
 * Expect 400
 */
describe('Expect 400 if', async () => {
  test('Title not provided', async () => {
    const blog = {
      author: 'Tester',
      url: 'testing.com',
    }

    await api
      .post('/api/blogs')
      .send(blog)
      .set('Authorization', `Bearer ${token}`)
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
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })

  test('Title and URL not provided', async () => {
    const blog = {
      author: 'Tester',
    }

    await api
      .post('/api/blogs')
      .send(blog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

// DELETE functionality test
describe('Deleting a single blog', () => {
  test('For a valid blog id, is successful', async () => {
    // For checking change in length of blogs later
    const blogsAtStart = await helper.getBlogsInJSON()

    // Because of DELETE now only allowing DELETE by the same user that posted, need to post a blog under the test account first
    const newBlog = {
      title: 'Testing',
      author: 'Tester',
      url: 'testing.com',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)

    const blogsAfterPost = await helper.getBlogsInJSON()
    const postedBlog = blogsAfterPost.find(blog => blog.title === newBlog.title)

    // Status code check
    await api
      .delete(`/api/blogs/${postedBlog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    // Length check
    const blogsAfterDelete = await helper.getBlogsInJSON()
    assert.strictEqual(blogsAfterDelete.length, blogsAtStart.length)

    // Titles check
    const titles = blogsAfterDelete.map(blog => blog.title)
    assert(!titles.includes(postedBlog.title))
  })

  test('Invalid blog id should return 400', async () => {
    const invalidId = 'invalid'

    await api
      .delete(`/api/blogs/${invalidId}`)
      .set('Authorization', `Bearer ${token}`)
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