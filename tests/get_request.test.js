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
  console.log('Starting test')

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

after(async () => {
  console.log('Closing database connection')
  await mongoose.connection.close()
})