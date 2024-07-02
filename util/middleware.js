const unknownEndpoint = (request, response) => {
  response.status(404).json({
    error: 'unknown endpoint'
  })
}

const errorHandler = (error, request, response, next) => {
  // console.log('This is the error name', error.name)
  // console.log('This is the error message', error.message)

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

  else if (error.message.includes('data and salt arguments required')) {
    return response.status(400).json({
      error: 'password not provided'
    })
  }

  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler
}