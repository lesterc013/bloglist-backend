const mongoose = require('mongoose')

// Included default likes to be 0
const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: String,
    url: { type: String, required: true },
    likes: { type: Number, default: 0 },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
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
