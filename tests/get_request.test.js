// npm modules
const { test, after, beforeEach } = require('node:test')
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
  console.log('Clearing test database')
  await Blog.deleteMany({})

  console.log('Populating test database')
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

after(async () => {
  console.log('Closing database connection')
  await mongoose.connection.close()
})