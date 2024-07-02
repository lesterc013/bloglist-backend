const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const User = require('../models/userModel')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  await User.insertMany(helper.initialUsers)
})

describe('Valid Requests:', () => {
  test('GET request should return all users in db and statuscode 200', async () => {
    const initialUsers = await helper.getUsers()

    // Expect 200 and Content-Type
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    // Check length of response.body is same as initialUsers
    assert.strictEqual(response.body.length, initialUsers.length)
    // Check if the username of the first guy is the same
    const usernames = response.body.map(user => user.username)
    assert(usernames.includes('hellas'))
  })

  test('POST request with valid username and password should return that username, id and name, and statuscode 201', async () => {
    const initialUsers = await helper.getUsers()

    const newUser = {
      username: 'test',
      password: 'test1',
      name: 'tester'
    }
    // Expect 201 and json
    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    // Check if length of collection did increase
    const afterUsers = await helper.getUsers()
    assert.strictEqual(afterUsers.length, initialUsers.length + 1)

    // Check if the user added was indeed tester
    assert(response.body.username.includes('test'))
  })
})

describe('Invalid Requests', () => {
  test('Username length less than 3', async () => {
    const initialUsers = await helper.getUsers()

    const newUser = {
      username: 'te',
      password: 'test1',
      name: 'tester'
    }
    // Expect 400 and a JSON response
    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    // Check if error message is relevant
    assert.strictEqual(response.body.error, 'User validation failed: username: Path `username` (`te`) is shorter than the minimum allowed length (3).')

    // Check if username confirmed did not get saved into db
    const afterUsers = await helper.getUsers()
    assert.strictEqual(afterUsers.length, initialUsers.length)
  })

  test('Username not provided', async () => {
    const initialUsers = await helper.getUsers()

    const newUser = {
      password: 'test1',
      name: 'tester'
    }
    // Expect 400 and a JSON response
    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    // Check if error message is relevant
    assert.strictEqual(response.body.error, 'User validation failed: username: Path `username` is required.')

    // Check if username confirmed did not get saved into db
    const afterUsers = await helper.getUsers()
    assert.strictEqual(afterUsers.length, initialUsers.length)
  })

  test('Password length less than 3', async () => {
    const initialUsers = await helper.getUsers()

    const newUser = {
      username: 'test',
      password: 'te',
      name: 'tester'
    }
    // Expect 400 and a JSON response
    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    // Check if error message is relevant
    assert.strictEqual(response.body.error, 'password too short')

    // Check if username confirmed did not get saved into db
    const afterUsers = await helper.getUsers()
    assert.strictEqual(afterUsers.length, initialUsers.length)
  })

  test('Password not provided', async () => {
    const initialUsers = await helper.getUsers()

    const newUser = {
      username: 'test',
      name: 'tester'
    }
    // Expect 400 and a JSON response
    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    // Check if error message is relevant
    assert.strictEqual(response.body.error, 'password is missing')

    // Check if username confirmed did not get saved into db
    const afterUsers = await helper.getUsers()
    assert.strictEqual(afterUsers.length, initialUsers.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})