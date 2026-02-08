import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

/**
 * Generate RSS feed for all blog posts
 * Uses the new unified posts collection
 */
export async function GET(context) {
  // Get all published posts from the unified collection
  const posts = await getCollection('posts', ({ data }) => {
    // Filter out draft posts
    return !data.draft
  })
  
  // Sort posts by publication date (newest first)
  const sortedPosts = posts.sort((a, b) => 
    b.data.pubDate.getTime() - a.data.pubDate.getTime()
  )
  
  return rss({
    title: 'yi - Blog Posts',
    description: 'Latest blog posts and articles',
    site: context.site.toString().endsWith('/') ? context.site : `${context.site}/`,
    items: sortedPosts.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description || '',
      // Use the correct link format with post.id
      link: `/posts/${post.id}`,
      // Add additional RSS fields
      author: 'yi',
      categories: post.data.tags || [],
    })),
    // Add RSS metadata
    customData: `<language>zh-cn</language>`,
  })
}
