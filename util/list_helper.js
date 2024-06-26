const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  // Given an array of blog posts, Return the total sum of likes in each blog
  if (blogs.length === 0) return 0

  // Extract out the likes in another array
  const likes = blogs.map(blog => blog.likes)

  return likes.reduce((sum, likesOnePost) => sum + likesOnePost)
}

module.exports = {
  dummy,
  totalLikes
}