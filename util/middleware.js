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

// So now instead of extracting the token and returning it, we want to:
// Extract, and then set it in the request's token field -- which is not an inherent field; express allows us to set custom fields
const getToken = (request, response, next) => {
  const authorization = request.get('Authorization')
  // Check if authorization truthy and whether starts with 'Bearer  i.e. token
  if (authorization && authorization.startsWith('Bearer ')) {
    // Then get the token out -- The value of Authorization is always 'Bearer <token>' hence the need to replace
    const token = authorization.replace('Bearer ', '')
    // Make a new field in request
    request.token = token
  }
  // Whether or not the if block executes, we will just pass this on to the next middleware
  next()
}

module.exports = {
  unknownEndpoint,
  errorHandler,
  getToken
}