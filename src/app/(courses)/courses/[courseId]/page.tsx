// Chuyển hướng tuyến đường /courses/[courseId] sang /course/[courseId] chuẩn SEO.
import { redirect } from 'next/navigation'

interface CourseRedirectProps {
  params: Promise<{ courseId: string }>
}

export default async function CourseRedirectPage({ params }: CourseRedirectProps) {
  const { courseId } = await params
  redirect(`/course/${courseId}`)
}
