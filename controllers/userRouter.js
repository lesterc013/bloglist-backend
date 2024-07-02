const userRouter = require('express').Router()
const User = require('../models/userModel')
const bcrypt = require('bcrypt')

userRouter.post('/', async (request, response, next) => {
  const { username, password, name } = request.body
  // Hash the password
  const saltRounds = 10
  try {
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const newUser = new User({
      username: username,
      passwordHash: passwordHash,
      name: name
    })

    await newUser.save()

    response.status(201).json(newUser)
  } catch (error) {
    next(error)
  }
})

userRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.status(200).json(users)
})

module.exports = userRouter