// Trang chi tiết bài viết cẩm nang và hướng dẫn luyện thi TOEIC chuẩn SEO
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Award,
} from 'lucide-react'
import { getBlogPostBySlug, getAllBlogSlugs } from '@/features/blog/data/blog.posts'
import { SITE_CONFIG, absoluteUrl } from '@/config/site.config'
import { JsonLd } from '@/components/seo/json-ld'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: 'Bài viết không tồn tại | LingoSphere',
      robots: { index: false, follow: false },
    }
  }

  const pageUrl = absoluteUrl(`/blog/${post.slug}`)

  return {
    title: `${post.title} | LingoSphere`,
    description: post.excerpt,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: pageUrl,
      siteName: SITE_CONFIG.name,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const pageUrl = absoluteUrl(`/blog/${post.slug}`)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: SITE_CONFIG.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/favicon.ico'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  }

  const breadcrumbSchema = {
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
        name: 'Cẩm nang TOEIC',
        item: absoluteUrl('/blog'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: pageUrl,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <header className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Về trang cẩm nang
          </Link>
          <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-primary">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_#34d399]" />
            LINGO<span className="font-light text-text-primary">SPHERE</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-14">
        {/* Visual Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-text-secondary">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary transition-colors">Cẩm nang</Link>
          <span>/</span>
          <span className="text-text-primary truncate max-w-xs sm:max-w-md">{post.title}</span>
        </nav>

        <article className="space-y-8">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              {post.category}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-text-secondary pt-2 border-b border-border pb-6">
              <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
                <User className="w-4 h-4 text-primary" />
                {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Cập nhật: {post.updatedAt}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime} đọc
              </span>
            </div>
          </header>

          {/* Excerpt Box */}
          <div className="p-4 sm:p-6 rounded-2xl bg-surface border-l-4 border-primary text-text-secondary text-sm sm:text-base leading-relaxed italic">
            {post.excerpt}
          </div>

          {/* Featured Image */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-border shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          {/* Article Body */}
          <div className="space-y-6 text-text-secondary leading-relaxed sm:text-lg">
            <ReactMarkdown
              components={{
                h2: ({ ...props }) => (
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary mt-8 mb-4 border-b border-border pb-2 flex items-center gap-2" {...props} />
                ),
                h3: ({ ...props }) => (
                  <h3 className="text-lg sm:text-xl font-semibold text-text-primary mt-6 mb-3" {...props} />
                ),
                p: ({ ...props }) => (
                  <p className="my-4 leading-relaxed text-text-secondary" {...props} />
                ),
                ul: ({ ...props }) => (
                  <ul className="list-disc list-inside space-y-2 my-4 pl-2" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="list-decimal list-inside space-y-2 my-4 pl-2" {...props} />
                ),
                li: ({ ...props }) => (
                  <li className="text-text-secondary" {...props} />
                ),
                strong: ({ ...props }) => (
                  <strong className="font-bold text-text-primary" {...props} />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-border flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-text-secondary">Chủ đề liên quan:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-surface text-text-secondary border border-border text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* E-E-A-T Trust Box */}
          <div className="p-6 rounded-2xl bg-surface/70 border border-border flex items-start gap-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                Kiểm duyệt chuyên môn bởi LingoSphere Academic Team
                <ShieldCheck className="w-4 h-4 text-primary inline" />
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Nội dung bài viết được xây dựng dựa trên cấu trúc đề thi TOEIC chuẩn ETS cập nhật mới nhất, tham vấn kinh nghiệm từ các giảng viên đạt TOEIC 950+ nhằm mang lại giá trị học tập thực chất cho người học.
              </p>
            </div>
          </div>

          {/* Next Steps CTA */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/15 via-surface to-surface border border-primary/30 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                Sẵn sàng bứt phá điểm số TOEIC của bạn?
              </h3>
              <p className="text-sm sm:text-base text-text-secondary">
                Áp dụng ngay các kiến thức vừa học vào bài kiểm tra mô phỏng thực tế hoặc củng cố từ vựng với phương pháp Spaced Repetition thông minh.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/toeic"
                className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm inline-flex items-center gap-2 shadow-md hover:bg-primary/90 transition-all cursor-pointer"
              >
                Làm đề thi thử TOEIC
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/courses"
                className="px-5 py-3 rounded-xl bg-surface border border-border text-text-primary font-bold text-sm inline-flex items-center gap-2 hover:bg-surface-hover transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                Khám phá khóa học
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}
