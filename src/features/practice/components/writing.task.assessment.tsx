"use client";
import { useTranslation } from 'react-i18next';
import type { WritingTaskAssessment, WritingScorePolicy } from '../types/writing';

export function WritingTaskAssessmentView({ assessment, policy, source, skill = 'WRITING' }: { assessment?: WritingTaskAssessment; policy?: WritingScorePolicy; source?: string; skill?: 'WRITING' | 'SPEAKING' }) {
  const { i18n } = useTranslation();
  const vi = i18n.language.startsWith('vi');
  if (!assessment) return null;
  const labels = { ON_TASK: vi ? 'Đáp ứng đầy đủ nhiệm vụ' : 'Task fulfilled', PARTIAL: vi ? 'Đáp ứng một phần nhiệm vụ' : 'Task partially fulfilled', OFF_TOPIC: vi ? skill === 'SPEAKING' ? 'Bài nói không thực hiện nhiệm vụ chính' : 'Bài viết hoàn toàn lệch đề' : 'Off-topic response', UNGRADABLE: vi ? 'Không có nội dung có thể chấm' : 'No assessable response', UNCERTAIN: vi ? 'Cần kiểm tra đánh giá đáp ứng đề' : 'Task assessment needs review' };
  const statuses = { MET: vi ? 'Đã đáp ứng' : 'Met', PARTIAL: vi ? 'Chưa đầy đủ' : 'Partial', MISSING: vi ? 'Chưa thực hiện' : 'Missing', UNKNOWN: vi ? 'Chưa xác định' : 'Unknown' };
  return <div className="space-y-2 rounded-xl border border-border bg-surface-subtle p-4 text-sm">
    {source && <p className="text-text-secondary">{source}</p>}
    <p className="font-semibold text-text-primary">{labels[assessment.outcome]}</p>
    <p className="text-text-secondary">{assessment.reason}</p>
    {policy?.applied_cap === 0 && <p className="font-medium text-text-primary">{vi ? 'Điểm bài làm: 0/100. Điểm ngôn ngữ được giữ để hướng dẫn học và không bù cho việc không thực hiện nhiệm vụ.' : 'Assignment score: 0/100. Language diagnostics are retained for learning and do not compensate for an unfulfilled task.'}</p>}
    {policy && <p className="text-text-secondary">{vi ? 'Điểm trước điều kiện đáp ứng đề' : 'Score before task gate'}: {policy.pre_policy_score} · {vi ? 'Điểm cuối' : 'Final score'}: {policy.final_score}</p>}
    {policy?.reason_code === 'TURN_COVERAGE' && <p className="text-text-secondary">{vi ? 'Điểm tối đa bị giới hạn theo mức hoàn thành từng lượt (đầy đủ, một phần hoặc chưa thực hiện); các lượt chưa thực hiện không được bù bằng điểm phát âm.' : 'The score ceiling follows the completion level of each turn; pronunciation cannot compensate for unfulfilled turns.'}</p>}
    {policy?.reason_code === 'REFERENCE_COVERAGE' && <p className="text-text-secondary">{vi ? 'Điểm bài đọc/nhại được giới hạn theo mức hoàn thành văn bản tham chiếu; điểm phát âm vẫn được giữ riêng.' : 'The reading/repetition score is limited by reference-text coverage; pronunciation diagnostics are retained separately.'}</p>}
    <details><summary className="min-h-11 cursor-pointer pt-3 font-medium">{vi ? 'Đối chiếu từng yêu cầu' : 'Requirement coverage'}</summary>
      <ul className="space-y-2 pt-2">{assessment.requirements.map((r, index) => <li key={r.requirement_id}><p>{r.text || (index === 0 ? (vi ? 'Nhiệm vụ chính' : 'Core task') : `${vi ? 'Yêu cầu' : 'Requirement'} ${index}`)}: {statuses[r.status]}</p>{r.evidence.map((q, i) => <blockquote key={i} className="mt-1 border-l-2 border-border pl-3 text-text-secondary">{q}</blockquote>)}</li>)}</ul>
    </details>
  </div>;
}
