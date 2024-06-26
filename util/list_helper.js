// const dummy = (blogs) => {
//   return 1
// }

const totalLikes = (blogs) => {
  // Given an array of blog posts, Return the total sum of likes in each blog
  if (blogs.length === 0) return 0

  // Extract out the likes in another array
  const likes = blogs.map(blog => blog.likes)

  return likes.reduce((sum, likesOnePost) => sum + likesOnePost)
}

/**
 * Given an array of blogs, find out which blog has most likes
 * Extract out their likes into an array
 * Use Math.max to find out the max like
 * Use find to extract out the blog with blog.likes === maxLikes
 */
const mostLikes = (blogs) => {
  if (blogs.length === 0) return 0
  const likes = blogs.map(blog => blog.likes)
  const highestLikes = Math.max(...likes)
  return blogs.find(blog => blog.likes === highestLikes)
}

module.exports = {
  totalLikes,
  mostLikes
}