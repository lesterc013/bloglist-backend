/**
 * Create a test helper to store the standard blog posts
 */

const Blog = require('../models/blogModel')
const User = require('../models/userModel')

const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

const getBlogsInJSON = async () => {
  const blogObjects = await Blog.find({})
  const blogJSON = blogObjects.map(blogObj => blogObj.toJSON())
  return blogJSON
}

const initialUsers = [
  { _id: '6683a80ba0c8fb596db86046',
    username: 'hellas',
    passwordHash: '$2b$10$g6g2UtLEqNiQCN15O75gFuYtJNhmhDdCHq4viv7zQqIWFiBZFMzO',
    name: 'Arto Hellas',
    __v: 0
  },
  { _id: '6683ae51dfc1530aac50fd5a',
    username: 'mluukkai',
    passwordHash: '$2b$10$yCDBFVKl3DhgR5MA6vn0uSsp2VZvafBDHxWXTG6q4P6wlTnQxd8e',
    name: 'Matti Luukkainen',
    __v: 0
  },
]

const getUsers = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const getToken = async (api) => {
  const newUser = {
    username: 'test',
    password: 'test',
    name: 'tester'
  }
  await api
    .post('/api/users')
    .send(newUser)

  // Login with newUser to get the token
  const login = {
    username: 'test',
    password: 'test',
  }
  const loginResponse = await api
    .post('/api/login')
    .send(login)

  return loginResponse.body.token
}

module.exports = {
  initialBlogs,
  getBlogsInJSON,
  initialUsers,
  getUsers,
  getToken
}