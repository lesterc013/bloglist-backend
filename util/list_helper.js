const dummy = () => {
  return 1
}

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

/**
 * Find the author who has the largest amount of blogs
 * Use a map? For loop to iterate over each blog
 * if map.has(blog.author)
 *  +1 to the map.set(blog.author, map.get(blog.author)+1)
 * else i.e. the map dont have the author
 *  map.set(blog.author, 0)
 */
const mostBlogs = (blogs) => {
  if (blogs.length === 0) return 0

  let blogCount = 0
  let author = ''
  let authorAndBlogCounts = new Map()

  const compareBlogCounts = (value, key) => {
    if (value > blogCount) {
      blogCount = value
      author = key
    }
  }

  for (let i = 0; i < blogs.length; i++) {
    const thisAuthor = blogs[i].author
    if (authorAndBlogCounts.has(thisAuthor)) {
      authorAndBlogCounts.set(thisAuthor, authorAndBlogCounts.get(thisAuthor)+1)
    }
    else {
      authorAndBlogCounts.set(thisAuthor, 1)
    }
  }

  authorAndBlogCounts.forEach(compareBlogCounts)

  return {
    author: author,
    blogs: blogCount
  }
}

module.exports = {
  dummy,
  totalLikes,
  mostLikes,
  mostBlogs
}