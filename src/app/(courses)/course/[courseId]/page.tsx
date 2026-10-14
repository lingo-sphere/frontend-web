// Trang điều phối không gian học tập và chi tiết khóa học cho học viên LingoSphere tích hợp Server SEO
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { extractCourseId } from '@/features/courses/lib/course.url'
import { STORAGE_KEYS } from '@/lib/storage'
import { CourseDetailClient } from '@/features/courses/components/course.detail.client'
import { SITE_CONFIG } from '@/config/site.config'
import { JsonLd } from '@/components/seo/json-ld'
import { resolveMediaUrl } from '@/utils/media.utils'

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>
}

interface ServerCourseModule {
  title?: string
}

interface ServerCourseData {
  _id?: string
  title?: string
  description?: string
  thumbnail_url?: string
  thumbnail?: string
  author_name?: string
  target_score?: number
  price?: number
  discount_price?: number
  modules?: ServerCourseModule[]
}

async function getCourseServer(id: string): Promise<ServerCourseData | null> {
  if (!id) return null
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.lingosphere.io.vn'
    const res = await fetch(`${apiBase}/courses/${id}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const json = await res.json()
    return (json?.data || json || null) as ServerCourseData | null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const rawParam = resolvedParams?.courseId || ''
  const courseId = extractCourseId(rawParam)
  const course = await getCourseServer(courseId)

  if (!course || !course.title) {
    return {
      title: 'Khóa Học TOEIC | LingoSphere',
      description: 'Khám phá khóa học luyện thi TOEIC chất lượng cao tại LingoSphere.',
      alternates: {
        canonical: `${SITE_CONFIG.url}/courses`,
      },
    }
  }

  const title = `${course.title} | LingoSphere - Luyện Thi TOEIC`
  const description =
    course.description ||
    `Khóa học ${course.title} tại LingoSphere với lộ trình tinh gọn, video bài giảng chuẩn ETS và gia sư AI đồng hành.`
  const canonicalUrl = `${SITE_CONFIG.url}/course/${rawParam}`
  const rawImage = course.thumbnail_url || course.thumbnail
  const imageUrl = rawImage ? resolveMediaUrl(rawImage) : `${SITE_CONFIG.url}/og-image.png`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const resolvedParams = await params
  const rawParam = resolvedParams?.courseId || ''
  const courseId = extractCourseId(rawParam)
  const course = await getCourseServer(courseId)

  const cookieStore = await cookies()
  const isEnrolledCookie =
    cookieStore.get(STORAGE_KEYS.COURSE_ENROLLED(courseId))?.value === 'true' ||
    (rawParam ? cookieStore.get(STORAGE_KEYS.COURSE_ENROLLED(rawParam))?.value === 'true' : false) ||
    cookieStore.get(STORAGE_KEYS.IS_PRIVILEGED)?.value === 'true'

  const courseSchema = course && course.title ? {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description || course.title,
    provider: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      sameAs: SITE_CONFIG.url,
    },
    offers: {
      '@type': 'Offer',
      price: course.discount_price || course.price || 0,
      priceCurrency: 'VND',
      category: 'Paid',
    },
  } : null

  const breadcrumbSchema = course && course.title ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: SITE_CONFIG.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Khóa học',
        item: `${SITE_CONFIG.url}/courses`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: course.title,
        item: `${SITE_CONFIG.url}/course/${rawParam}`,
      },
    ],
  } : null

  return (
    <>
      {courseSchema && <JsonLd data={courseSchema} />}
      {breadcrumbSchema && <JsonLd data={breadcrumbSchema} />}

      {course && course.title && (
        <article className="sr-only">
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          {course.author_name && <div>Giảng viên: {course.author_name}</div>}
          {course.target_score && <div>Mục tiêu: {course.target_score}+ điểm TOEIC</div>}
          {Array.isArray(course.modules) && course.modules.length > 0 && (
            <section>
              <h2>Nội dung chương trình đào tạo</h2>
              <ul>
                {course.modules.map((m, idx) => (
                  <li key={idx}>{m.title}</li>
                ))}
              </ul>
            </section>
          )}
        </article>
      )}

      <CourseDetailClient
        rawParam={rawParam}
        courseId={courseId}
        initialIsEnrolled={isEnrolledCookie}
      />
    </>
  )
}
