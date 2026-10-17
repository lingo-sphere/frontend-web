// Component thẻ bài viết kiến thức và cẩm nang luyện thi TOEIC chuẩn SEO
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'
import type { BlogPost } from '@/features/blog/types/blog'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-border bg-surface overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div>
        <Link href={`/blog/${post.slug}`} className="block relative aspect-video w-full overflow-hidden bg-surface-subtle">
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary text-primary-foreground shadow-sm">
              {post.category}
            </span>
          </div>
        </Link>

        <div className="p-5 space-y-3">
          <div className="flex items-center gap-4 text-[12px] text-text-tertiary">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {post.publishedAt}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-text-primary line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            <Link href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </h3>

          <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
        <span className="text-text-tertiary flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          {post.author}
        </span>
        <Link
          href={`/blog/${post.slug}`}
          className="font-bold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
        >
          Đọc tiếp
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  )
}
