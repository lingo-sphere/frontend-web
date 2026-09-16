// Tiện ích tạo và bóc tách URL khóa học chuẩn SEO dạng [slug]-c[id].html.
export function slugify(text: string): string {
  if (!text) return 'khoa-hoc'
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildCourseUrl(course: {
  id?: string
  _id?: string
  slug?: string
  title?: string
}): string {
  const id = course.id || course._id || ''
  const baseSlug = course.slug
    ? course.slug.replace(/\.html$/i, '').replace(/-c[^-]+$/i, '')
    : slugify(course.title || 'khoa-hoc')

  return `/course/${baseSlug}-c${id}.html`
}

export function extractCourseId(param: string): string {
  if (!param) return ''
  const decoded = decodeURIComponent(param)
  const match = decoded.match(/-c([^-]+)\.html$/i)
  if (match && match[1]) {
    return match[1]
  }
  if (decoded.endsWith('.html')) {
    return decoded.slice(0, -5)
  }
  return decoded
}

export function isCanonicalCourseUrl(
  currentPath: string,
  course: { id?: string; _id?: string; slug?: string; title?: string }
): boolean {
  if (!currentPath || !course) return false
  const canonical = buildCourseUrl(course)
  return currentPath.toLowerCase() === canonical.toLowerCase()
}
