const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../util/list_helper')


test('dummy returns one', () => {
  const blogs = []
  const result = listHelper.dummy(blogs)

  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  // All the tests
  test('of empty list is zero', () => {
    const empty = []
    assert.strictEqual(listHelper.totalLikes(empty), 0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const oneBlog = [{
      id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }]
    assert.strictEqual(listHelper.totalLikes(oneBlog), 5)
  })

  test('of a bigger list is calculated right', () => {
    const manyBlogs = [
      {
        title: 'Testing 1',
        author: 'Tester 1',
        url: 'Tester.com',
        likes: 10,
        id: '667bb0bc8a19a13eac32760e'
      },
      {
        title: 'Testing 2',
        author: 'Tester 2',
        url: 'Tester2.com',
        likes: 20,
        id: '667bb978aa1aea3b68825154'
      },
      {
        title: 'Testing 3',
        author: 'Tester 3',
        url: 'Tester3.com',
        likes: 30,
        id: '667bc3700b67612aa209309a'
      }
    ]
    assert.strictEqual(listHelper.totalLikes(manyBlogs), 60)
  })
})