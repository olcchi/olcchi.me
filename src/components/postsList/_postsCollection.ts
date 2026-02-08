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
 */
export const allPosts = allPostsRaw
  .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())

/**
 * Posts dynamically grouped by year
 * Automatically includes all years present in the posts collection
 */
export const postsByYear = allPosts.reduce((acc, post) => {
  const year = post.data.collection;
  acc[year] = acc[year] || [];
  acc[year].push(post);
  return acc;
}, {} as Record<number, typeof allPosts>);

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
