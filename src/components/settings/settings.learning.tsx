'use client'

/**
 * @file SettingsLearningTab.tsx
 * @description Component tab cài đặt trải nghiệm học tập, phát âm, phiên âm IPA và mục tiêu ngày
 */

import {
  GraduationCap,
  Volume2,
  Sparkles,
  Flame,
  Award,
  Check,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { UserPreferences } from '@/types/user'

interface SettingsLearningTabProps {
  preferences: UserPreferences
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>
  isVi: boolean
}

export function SettingsLearningTab({
  preferences,
  setPreferences,
  isVi,
}: SettingsLearningTabProps) {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border bg-surface shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border bg-surface-subtle/30">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" />
            <span>{isVi ? 'Tùy chọn tương tác bài giảng' : 'Lesson Interaction'}</span>
          </h3>
          <p className="text-xs text-text-tertiary mt-0.5">
            {isVi ? 'Tùy chỉnh cách phát âm thanh, từ điển và phiên âm trong các buổi học' : 'Audio and phonetic settings'}
          </p>
        </div>

        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface-subtle/40 hover:bg-surface-subtle/70 transition-colors">
            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Volume2 size={18} />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-text-primary">
                  {isVi ? 'Tự động phát âm thanh khi mở từ mới' : 'Auto-play Audio Pronunciation'}
                </div>
                <div className="text-[11px] sm:text-xs text-text-tertiary mt-0.5">
                  {isVi
                    ? 'Tự động đọc mẫu phát âm tiếng Anh chuẩn khi lật thẻ từ vựng hoặc sang câu hỏi mới.'
                    : 'Automatically play native pronunciation audio when opening vocabulary cards.'}
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                setPreferences((prev) => ({
                  ...prev,
                  learning: { ...prev.learning, autoPlayAudio: !prev.learning.autoPlayAudio },
                }))
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
                preferences.learning.autoPlayAudio ? 'bg-primary' : 'bg-surface-subtle border border-border'
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  preferences.learning.autoPlayAudio ? 'translate-x-5 shadow-sm' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface-subtle/40 hover:bg-surface-subtle/70 transition-colors">
            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-text-primary">
                  {isVi ? 'Hiển thị ký hiệu ngữ âm quốc tế (IPA)' : 'Show Phonetic IPA Transcriptions'}
                </div>
                <div className="text-[11px] sm:text-xs text-text-tertiary mt-0.5">
                  {isVi
                    ? 'Luôn hiển thị phiên âm chuẩn quốc tế /aɪ piː eɪ/ dưới từ vựng để hỗ trợ luyện phát âm chuẩn.'
                    : 'Display standard IPA phonetic spellings beneath vocabulary and phrases.'}
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                setPreferences((prev) => ({
                  ...prev,
                  learning: { ...prev.learning, showPhonetic: !prev.learning.showPhonetic },
                }))
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
                preferences.learning.showPhonetic ? 'bg-primary' : 'bg-surface-subtle border border-border'
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  preferences.learning.showPhonetic ? 'translate-x-5 shadow-sm' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border bg-surface shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border bg-surface-subtle/30">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Flame size={18} className="text-warning" />
            <span>{isVi ? 'Mục tiêu học tập hàng ngày' : 'Daily Study Goals'}</span>
          </h3>
          <p className="text-xs text-text-tertiary mt-0.5">
            {isVi ? 'Hệ thống sẽ dựa trên mục tiêu này để theo dõi tiến độ và nhắc nhở duy trì Streak' : 'Set your daily minutes target'}
          </p>
        </div>

        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { time: 15, title: isVi ? 'Khởi động' : 'Casual', desc: '15 min/day', level: 'Dễ' },
              { time: 30, title: isVi ? 'Tiêu chuẩn' : 'Regular', desc: '30 min/day', level: 'Khuyên dùng' },
              { time: 45, title: isVi ? 'Chăm chỉ' : 'Serious', desc: '45 min/day', level: 'Tích cực' },
              { time: 60, title: isVi ? 'Bứt phá' : 'Intense', desc: '60 min/day', level: 'Siêu tốc' },
            ].map((plan) => {
              const isSelected = preferences.learning.dailyGoal === plan.time
              return (
                <div
                  key={plan.time}
                  onClick={() =>
                    setPreferences((prev) => ({
                      ...prev,
                      learning: { ...prev.learning, dailyGoal: plan.time },
                    }))
                  }
                  className={`p-3.5 sm:p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20'
                      : 'border-border bg-surface hover:bg-surface-subtle'
                  }`}
                >
                  <div className="text-xs font-bold text-primary mb-0.5">{plan.level}</div>
                  <div className="text-base sm:text-lg font-extrabold text-text-primary">{plan.title}</div>
                  <div className="text-xs text-text-secondary mt-1">{plan.desc}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border bg-surface shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border bg-surface-subtle/30">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Award size={18} className="text-primary" />
            <span>{isVi ? 'Độ khó bài tập khởi đầu' : 'Initial Exercise Difficulty'}</span>
          </h3>
        </div>

        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'easy', title: isVi ? 'Dễ' : 'Easy', desc: isVi ? 'Từ vựng & ngữ pháp cơ bản' : 'Basic vocabulary' },
              { key: 'medium', title: isVi ? 'Trung bình' : 'Medium', desc: isVi ? 'Cân bằng giữa nghe, nói, đọc' : 'Balanced level' },
              { key: 'hard', title: isVi ? 'Nâng cao' : 'Hard', desc: isVi ? 'Tăng tốc độ đọc và đề thi thực tế' : 'Advanced challenges' },
            ].map((diff) => {
              const isSelected = preferences.learning.defaultExerciseDifficulty === diff.key
              return (
                <div
                  key={diff.key}
                  onClick={() =>
                    setPreferences((prev) => ({
                      ...prev,
                      learning: { ...prev.learning, defaultExerciseDifficulty: diff.key as any },
                    }))
                  }
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20'
                      : 'border-border bg-surface hover:bg-surface-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-text-primary">{diff.title}</span>
                    {isSelected && <Check size={16} className="text-primary" />}
                  </div>
                  <p className="text-xs text-text-tertiary">{diff.desc}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
