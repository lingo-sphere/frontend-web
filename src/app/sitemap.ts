// Trình tạo sơ đồ trang web sitemap.xml động tích hợp dữ liệu khóa học và bài thi TOEIC
import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/config/site.config'
import { buildCourseUrl } from '@/features/courses/lib/course.url'
import { BLOG_POSTS } from '@/features/blog/data/blog.posts'

interface ApiCourseItem {
  _id?: string
  id?: string
  slug?: string
  title?: string
  is_published?: boolean
  updated_at?: string
  created_at?: string
}

interface ApiExamItem {
  _id?: string
  id?: string
  is_published?: boolean
  updated_at?: string
  created_at?: string
}

interface ApiTopicItem {
  _id?: string
  updated_at?: string
}

async function fetchDynamicCourses(): Promise<MetadataRoute.Sitemap> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.lingosphere.online'
    const res = await fetch(`${apiBase}/courses`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = await res.json()
    const items: ApiCourseItem[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []

    return items
      .filter((c) => c.is_published !== false && (c._id || c.id))
      .map((course) => ({
        url: `${SITE_CONFIG.url}${buildCourseUrl(course)}`,
        lastModified: course.updated_at ? new Date(course.updated_at) : new Date(course.created_at || '2026-09-01'),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
  } catch {
    return []
  }
}

async function fetchDynamicExams(): Promise<MetadataRoute.Sitemap> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.lingosphere.online'
    const res = await fetch(`${apiBase}/exams`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = await res.json()
    const items: ApiExamItem[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []

    return items
      .filter((e) => e.is_published !== false && (e._id || e.id))
      .map((exam) => ({
        url: `${SITE_CONFIG.url}/toeic/exam/${exam._id || exam.id}`,
        lastModified: exam.updated_at ? new Date(exam.updated_at) : new Date(exam.created_at || '2026-09-01'),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
  } catch {
    return []
  }
}

async function fetchDynamicTopics(): Promise<MetadataRoute.Sitemap> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.lingosphere.online'
    const res = await fetch(`${apiBase}/vocabulary/topics`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = await res.json()
    const items: ApiTopicItem[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []

    return items
      .filter((t) => Boolean(t._id))
      .map((t) => ({
        url: `${SITE_CONFIG.url}/vocabulary?topic=${t._id}`,
        lastModified: t.updated_at ? new Date(t.updated_at) : new Date('2026-09-01'),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url
  const releaseDate = new Date('2026-10-14')

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: releaseDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: releaseDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/toeic`,
      lastModified: releaseDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vocabulary`,
      lastModified: releaseDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/topics`,
      lastModified: releaseDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/grammar`,
      lastModified: releaseDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ipa`,
      lastModified: releaseDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/listening`,
      lastModified: releaseDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reading`,
      lastModified: releaseDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/speaking`,
      lastModified: releaseDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/writing`,
      lastModified: releaseDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/public-decks`,
      lastModified: releaseDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: releaseDate,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: releaseDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: releaseDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const [courseRoutes, examRoutes, topicRoutes] = await Promise.all([
    fetchDynamicCourses(),
    fetchDynamicExams(),
    fetchDynamicTopics(),
  ])

  return [...staticRoutes, ...blogRoutes, ...courseRoutes, ...examRoutes, ...topicRoutes]
}
