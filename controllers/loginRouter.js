const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/userModel')

loginRouter.post('/', async (request, response, next) => {
  const username = request.body.username
  const password = request.body.password

  // Find user within the db
  const user = await User.findOne({ username: username })
  // Check the password -- T/F based on whether user can be found or not
  const passwordCheck = user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCheck)) {
    const error = new Error('invalid username or password')
    error.statusCode = 401
    return next(error)
  }

  const payload = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(payload, process.env.SECRET_KEY)

  response.status(200).send({
    token: token,
    username: user.username,
    name: user.name
  })
})

module.exports = loginRouter