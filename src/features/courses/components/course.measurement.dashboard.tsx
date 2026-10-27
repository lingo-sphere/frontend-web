'use client'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api.client'
import type { CourseMeasurementReport } from '../types/measurement'

const names: Record<string, string> = { INTERNAL: 'Điểm nội bộ', LISTENING: 'Listening', READING: 'Reading', SPEAKING: 'Speaking', WRITING: 'Writing', LISTENING_READING: 'TOEIC Listening & Reading' }
const deltaLabel = (value: number) => `${value >= 0 ? '+' : ''}${value}`
export function CourseMeasurementDashboard({ courseId }: { courseId: string }) {
  const [metric, setMetric] = useState('INTERNAL')
  const client = useQueryClient()
  const query = useQuery({ queryKey: ['course-measurement', courseId], enabled: !!courseId,
    queryFn: () => api.get<{ measurement_report: CourseMeasurementReport; is_baseline_established: boolean; baseline_evidence?: Record<string, unknown> }>(`/progress/courses/${courseId}/growth-chart`), staleTime: 0,
  })
  const [source, setSource] = useState('PRE_TEST_2K'), [value, setValue] = useState('')
  const baseline = useMutation({ mutationFn: () => api.post(`/progress/courses/${courseId}/baseline`, source === 'PRE_TEST_2K' ? { baseline_source: source, attempt_id: value.trim() } : { baseline_source: source, baseline_score: Number(value) }),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['course-measurement', courseId] }); void client.invalidateQueries({ queryKey: ['course-progress'] }); },
  })
  const report = query.data?.measurement_report
  if (query.isPending) return <p className="p-6 text-text-secondary">Đang tải báo cáo đo tiến bộ…</p>
  if (query.isError) return <div role="alert" className="p-6"><p>Chưa tải được báo cáo tiến bộ.</p><button onClick={() => void query.refetch()} className="text-primary underline">Thử lại</button></div>
  if (!report) return <p className="p-6">Dữ liệu cũ chưa có thông tin thang đo. Chưa thể kết luận mức tăng TOEIC.</p>
  const points = report.timeline.map(point => ({ ...point, value: metric === 'INTERNAL' ? point.score : point.skill_scores[metric] })).filter(point => typeof point.value === 'number')
  return <div className="space-y-6">
    <section className="space-y-3 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-lg font-bold">Tiến bộ học tập & TOEIC ước tính</h2>
      <p className="text-sm text-text-secondary">Điểm xét đạt khóa học: 0–100. TOEIC ước tính: Listening & Reading /990, Speaking /200, Writing /200; chỉ hiển thị khi có hiệu chuẩn phù hợp.</p>
      <p className="text-sm">Đo kết quả bằng <strong>lần đánh giá cuối khóa hoàn tất gần nhất</strong>. Điểm cao nhất được giữ riêng để xét kết quả khóa học.</p>
      {report.declared_baseline && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Mốc TOEIC L&R tự khai: {report.declared_baseline.score}/990. Chưa xác minh; không dùng để khẳng định mức tăng điểm.</p>}
      {!!query.data?.is_baseline_established && !query.data.baseline_evidence && <p className="text-sm text-amber-700">Mốc cũ chưa rõ nguồn và thang đo; không trừ trực tiếp với điểm cuối khóa.</p>}
    </section>
    <section className="grid gap-4 md:grid-cols-3" aria-label="Ước tính TOEIC theo từng kỹ năng">
      {report.toeic.rows.map(row => <article key={row.skill} className="space-y-2 rounded-2xl border border-border bg-surface p-4">
        <h3 className="font-semibold">{names[row.skill]}</h3>
        {row.current ? <><p className="text-2xl font-bold text-primary">{row.current.score}/{row.current.max}</p><p className="text-sm">Khoảng tham chiếu: {row.current.lower}–{row.current.upper}</p><p className="text-xs text-text-secondary">Hiệu chuẩn {row.current.profile_version} · Ước tính, không phải điểm thi chính thức</p></> : <p className="text-sm text-text-secondary">Chưa đủ dữ liệu hiệu chuẩn để ước tính.</p>}
        {row.baseline && <p className="text-sm">Mốc tham chiếu: {row.baseline.score}/{row.baseline.max}{row.baseline_source === 'VERIFIED_APP_MOCK_TEST' ? ' · Bài thi thử đã đối chiếu' : ' · Chặng đầu tiên'}</p>}
        {row.comparable && row.delta !== null ? <><p className="font-semibold">Thay đổi ước tính: {deltaLabel(row.delta)} điểm</p>{row.delta_range && <p className="text-xs text-text-secondary">Khoảng chênh lệch: {deltaLabel(row.delta_range.lower)} đến {deltaLabel(row.delta_range.upper)}. Khoảng chứa 0 chưa cho thấy hướng thay đổi rõ.</p>}</> : <p className="text-xs text-text-secondary">{row.reason}</p>}
      </article>)}
    </section>
    <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-bold">Các chặng đánh giá nội bộ · 0–100</h3>
      <div className="flex flex-wrap gap-2">{Object.entries(names).filter(([key]) => key !== 'LISTENING_READING').map(([key, name]) => <button key={key} onClick={() => setMetric(key)} className={`rounded-lg border px-3 py-2 text-sm ${metric === key ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}>{name}</button>)}</div>
      {points.length ? <div className="flex h-56 items-end gap-3 overflow-x-auto" aria-label={`Biểu đồ ${names[metric]}`}>{points.map(point => <div key={point.attempt_id} className="flex h-full min-w-16 flex-1 flex-col items-center justify-end gap-2"><span className="text-sm font-bold">{point.value}/100</span><div className="flex h-36 w-10 items-end rounded bg-surface-subtle"><div className="w-full rounded bg-primary" style={{ height: `${point.value}%` }} /></div><span className="text-xs">{point.stage}</span><span className="text-[10px] text-text-secondary">{new Date(point.assessed_at).toLocaleDateString('vi-VN')}</span></div>)}</div> : <p className="text-sm text-text-secondary">Hoàn thành một bài đánh giá để bắt đầu theo dõi. Bài đang chờ chấm không được ghi thành điểm 0.</p>}
      <p className="text-sm">{report.internal.comparable && report.internal.delta !== null ? `Chênh lệch nội bộ giữa hai mốc tương đương: ${deltaLabel(report.internal.delta)} điểm.` : report.internal.reason}</p>
      <p className="text-xs text-text-secondary">Chặng đầu tiên không mặc nhiên là năng lực trước khi học. Chênh lệch quan sát được không chứng minh toàn bộ tác động do khóa học tạo ra.</p>
      {report.timeline.some(point => point.measurement_warning) && <p className="text-sm text-amber-700">Có bài chưa khớp hiệu chuẩn. Giáo viên cần kiểm tra cấu hình đề.</p>}
    </section>
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="mb-3 font-bold">Hồ sơ kỹ năng hiện tại</h3><table className="w-full text-left text-sm"><thead><tr><th>Kỹ năng</th><th>Mốc đầu</th><th>Hiện tại</th><th>Chênh lệch cùng phương pháp</th></tr></thead><tbody>{report.internal.skills.map(row => <tr key={row.skill}><td className="py-2">{names[row.skill]}</td><td>{row.baseline === null ? '—' : `${row.baseline}/100`}</td><td>{row.current === null ? '—' : `${row.current}/100`}</td><td>{row.delta === null ? 'Chưa đủ căn cứ' : deltaLabel(row.delta)}</td></tr>)}</tbody></table>
      {!!report.recommendations.length && <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-text-secondary">{report.recommendations.map(row => <li key={row.skill}>{row.message}</li>)}</ul>}
    </section>
    {!query.data?.is_baseline_established && !report.timeline.length && <form onSubmit={event => { event.preventDefault(); baseline.mutate() }} className="space-y-3 rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-bold">Ghi nhận mốc đầu vào trước khi bắt đầu học</h3><p className="text-xs text-text-secondary">Chỉ ghi một lần. Bài thi thử cần đủ 200 câu, được đo trong 90 ngày trước ghi danh hoặc trước khi bắt đầu học.</p>
      <select aria-label="Nguồn mốc đầu vào" value={source} onChange={event => { setSource(event.target.value); setValue('') }} className="w-full rounded-lg border border-border bg-surface p-2"><option value="PRE_TEST_2K">Bài TOEIC L&R đầy đủ của tôi</option><option value="SELF_DECLARED">Điểm TOEIC L&R tự khai, chưa xác minh</option></select>
      <input aria-label="Giá trị mốc đầu vào" value={value} onChange={event => setValue(event.target.value)} placeholder={source === 'PRE_TEST_2K' ? 'ID lượt thi trong lịch sử bài thi của bạn' : 'Điểm từ 10 đến 990'} className="w-full rounded-lg border border-border bg-surface p-2" />
      {baseline.isError && <p role="alert" className="text-sm text-red-600">{baseline.error.message}</p>}<button disabled={baseline.isPending || !value.trim()} className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">{baseline.isPending ? 'Đang lưu…' : 'Lưu mốc đầu vào'}</button>
    </form>}
  </div>
}
