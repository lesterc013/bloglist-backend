const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema(
  {
    title: String,
    author: String,
    url: String,
    likes: Number,
  },
  {
    toJSON: {
      transform: (document, returned) => {
        returned.id = returned._id.toString(),
        delete returned._id,
        delete returned.__v
      }
    }
  }
)

/**
 * Alternative way"
blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString() // Bcos _id property is an object vs a string
        delete returnedObject._id
        delete returnedObject.__v
    }
})

More than this, impt to know that there are many different configurations for toJSON we can do to the Schema as shown in the Mongoose documentation https://mongoosejs.com/docs/api/document.html#Document.prototype.toObject()

 */

module.exports = mongoose.model('Blog', blogSchema)
