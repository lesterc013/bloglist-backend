const unknownEndpoint = (request, response) => {
  response.status(404).json({
    error: 'unknown endpoint'
  })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

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

  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler
}