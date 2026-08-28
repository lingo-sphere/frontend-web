import type { Metadata } from 'next'
import { ToeicExamPage } from '@/components/toeic/ToeicExamPage'

interface ToeicExamPageProps {
  params: Promise<{ examId: string }>
}

export async function generateMetadata({ params }: ToeicExamPageProps): Promise<Metadata> {
  const { examId } = await params
  const formattedTitle = examId.toUpperCase()

  return {
    title: `Phòng Thi TOEIC Thực Chiến - ${formattedTitle}`,
    description: `Thi thử TOEIC Full Test 200 câu / Luyện từng Part chuẩn cấu trúc ETS 2024 có bấm giờ và tính điểm tức thì.`,
    openGraph: {
      title: `Phòng Thi TOEIC Thực Chiến - ${formattedTitle} | LingoSphere`,
      description: `Thi thử TOEIC chuẩn đề ETS với hệ thống chấm điểm và phân tích điểm yếu thông minh.`,
    },
  }
}

export default function ToeicExamPageWrapper() {
  return <ToeicExamPage />
}
