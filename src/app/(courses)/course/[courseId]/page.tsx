import type { Metadata } from 'next'
import { CourseClientWrapper } from '@/components/course/CourseClientWrapper'

interface CoursePageProps {
  params: Promise<{ courseId: string }>
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { courseId } = await params
  const formattedTitle = courseId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    title: `Khóa học ${formattedTitle}`,
    description: `Lộ trình học tập chi tiết, video bài giảng và bài tập thử thách cho khóa học ${formattedTitle} trên LingoSphere.`,
    openGraph: {
      title: `Khóa học ${formattedTitle} | LingoSphere`,
      description: `Lộ trình học tập chi tiết, bài tập trắc nghiệm và video bài giảng chất lượng cao.`,
    },
  }
}

export default async function CourseDetailPageWrapper({ params }: CoursePageProps) {
  const { courseId } = await params

  return <CourseClientWrapper courseId={courseId} />
}
