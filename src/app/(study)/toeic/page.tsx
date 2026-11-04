// Chuyển hướng trang luyện thi sang trang đề thi đánh giá năng lực đầu vào.
import { redirect } from 'next/navigation'

export default function ToeicHubPage() {
  redirect('/placement-test')
}
