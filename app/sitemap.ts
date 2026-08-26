import type { MetadataRoute } from 'next'

const SITE_URL = 'https://manna-restaurant.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: SITE_URL, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/menu`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/order`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${SITE_URL}/chef`, lastModified, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${SITE_URL}/gallery`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/reviews`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified, changeFrequency: 'yearly', priority: 0.7 },
  ]
}
