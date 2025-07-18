import { getCollection } from 'astro:content'

/**
 * Get all posts from the unified posts collection
 * Filters out draft posts and sorts by publication date (newest first)
 */
const allPostsRaw = await getCollection('posts', ({ data }) => {
  // Filter out draft posts in production
  return import.meta.env.DEV || !data.draft
})

/**
 * All posts sorted by publication date (newest first)
 * and grouped by collection year for easy access
 */
export const allPosts = allPostsRaw
  .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())

/**
 * Posts grouped by year for backward compatibility
 */
export const postsByYear = {
  2023: allPosts.filter(post => post.data.collection === 2023),
  2022: allPosts.filter(post => post.data.collection === 2022),
}

/**
 * Get posts by specific year
 */
export const getPostsByYear = (year: number) => 
  allPosts.filter(post => post.data.collection === year)

/**
 * Get recent posts (limit can be specified)
 */
export const getRecentPosts = (limit = 5) => 
  allPosts.slice(0, limit)
