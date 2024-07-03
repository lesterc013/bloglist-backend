const unknownEndpoint = (request, response) => {
  response.status(404).json({
    error: 'unknown endpoint'
  })
}

const errorHandler = (error, request, response, next) => {
  console.log('This is the error name', error.name)
  console.log('This is the error message', error.message)

  if (error.name === 'CastError') {
    response.status(400).json({
      error: 'malformatted'
    })
  }

  else if (error.name === 'ValidationError') {
    return response.status(400).send({
      error: error.message
    })
  }

  else if (error.name === 'TypeError') {
    return response.status(400).send({
      error: error.message
    })
  }

  // For unique username validation
  else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({
      error: 'username must be unique'
    })
  }

  else if (error.statusCode === 401 || error.message === 'invalid username or password') {
    return response.status(401).json({
      error: error.message
    })
  }

  else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }

  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler
}