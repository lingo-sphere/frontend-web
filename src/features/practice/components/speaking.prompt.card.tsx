/**
 * @file speaking.prompt.card.tsx
 * @description Card hiển thị đề bài, hình ảnh mô tả tranh, kịch bản hội thoại đa lượt,
 * văn bản đọc mẫu, hướng dẫn gợi ý và các thông số thời gian của bài tập Speaking.
 */

import { useState, useRef, useEffect } from 'react'
import {
  Volume2,
  VolumeX,
  Image as ImageIcon,
  MessageSquare,
  MapPin,
  Users,
  Lightbulb,
  Target,
  Loader2,
  Play,
  Pause,
  Maximize2,
  X,
  Compass,
  Sparkles,
  Layers,
  Eye,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import type { SpeakingExercise, SpeakingExerciseType } from '@/features/practice/types/speaking'
import { resolveMediaUrlAsync } from '@/utils/media.utils'
import { practiceService } from '@/features/practice/services/practice.service'

interface SpeakingPromptCardProps {
  exercise: SpeakingExercise
  isVietnamese: boolean
  typeLabels: Record<SpeakingExerciseType, string>
}

export function SpeakingPromptCard({
  exercise,
  isVietnamese,
  typeLabels,
}: SpeakingPromptCardProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Quản lý hình ảnh và xem chi tiết (Lightbox)
  const [imageUrl, setImageUrl] = useState<string | null>(exercise.prompt_media_id || null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [activeOutlineStep, setActiveOutlineStep] = useState<number>(1)

  useEffect(() => {
    if (exercise.prompt_media_id) {
      resolveMediaUrlAsync(exercise.prompt_media_id).then((url) => {
        setImageUrl(url || exercise.prompt_media_id || null)
      })
    } else {
      setImageUrl(null)
    }
  }, [exercise.prompt_media_id])

  // Dọn dẹp audio khi component unmount hoặc exercise thay đổi
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setIsPlayingAudio(false)
      setIsLoadingAudio(false)
      setAudioError(null)
    }
  }, [exercise.id, exercise._id])

  const handlePlayReferenceAudio = async () => {
    if (isLoadingAudio) return

    // Nếu đang phát thì tạm dừng
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause()
      setIsPlayingAudio(false)
      return
    }

    // Nếu đã có audio sẵn trong ref và đang tạm dừng thì tiếp tục phát
    if (audioRef.current && !isPlayingAudio) {
      try {
        await audioRef.current.play()
        setIsPlayingAudio(true)
        return
      } catch {
        audioRef.current = null
      }
    }

    // Lần đầu tải: Lấy qua R2 cache hoặc sinh mới TTS lưu R2
    setIsLoadingAudio(true)
    setAudioError(null)

    try {
      let resolvedUrl = ''

      // 1. Kiểm tra reference_media_id có sẵn từ bài tập
      if (exercise.reference_media_id) {
        resolvedUrl = await resolveMediaUrlAsync(exercise.reference_media_id)
      }

      // 2. Nếu chưa có reference_media_id, gọi Cache-Aside API (R2 first, TTS fallback)
      const targetText = exercise.source_text || exercise.reference_transcript || exercise.prompt_text_en
      if (!resolvedUrl && targetText) {
        const audioRes = await practiceService.getOrGeneratePracticeAudio(targetText)
        if (audioRes?.url) {
          resolvedUrl = await resolveMediaUrlAsync(audioRes.url)
        }
      }

      if (!resolvedUrl) {
        throw new Error(isVietnamese ? 'Không thể tải tệp âm thanh mẫu' : 'Failed to load reference audio')
      }

      const audio = new Audio(resolvedUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlayingAudio(false)
      }

      audio.onerror = () => {
        setIsPlayingAudio(false)
        setIsLoadingAudio(false)
        setAudioError(isVietnamese ? 'Lỗi phát âm thanh mẫu' : 'Playback error')
      }

      await audio.play()
      setIsPlayingAudio(true)
    } catch (err: any) {
      setAudioError(err?.message || (isVietnamese ? 'Lỗi tải audio' : 'Audio load error'))
    } finally {
      setIsLoadingAudio(false)
    }
  }
  return (
    <Card className="mb-6 dashboard-card">
      <CardContent className="p-5">
        {/* Context Path Breadcrumb */}
        {exercise.context_path && exercise.context_path.length > 0 && (
          <div className="mb-3 flex items-center gap-1.5 text-[12px] font-medium text-primary">
            <MapPin size={14} className="shrink-0" />
            <span>{exercise.context_path.join(' › ')}</span>
          </div>
        )}

        {/* Title & Instructions */}
        <div className="mb-4">
          <h2 className="mb-1 text-[15px] font-semibold text-text-primary">
            {isVietnamese ? 'Hướng dẫn bài tập' : 'Exercise Instructions'}
          </h2>
          <p className="text-[13px] leading-relaxed text-text-secondary">
            {isVietnamese ? (exercise.prompt_text_vi || exercise.description_vi) : (exercise.prompt_text_en || exercise.description)}
          </p>
        </div>

        {/* 1. DESCRIBE PICTURE: Render Image with Lightbox & 4-Step Scaffolding Guide */}
        {exercise.exercise_type === 'DESCRIBE_PICTURE' && (imageUrl || exercise.prompt_media_id) && (
          <div className="mb-5 space-y-4">
            {/* Image Container with Zoom Button */}
            <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-surface-subtle shadow-xs">
              <div className="relative max-h-96 w-full overflow-hidden bg-black/5 flex items-center justify-center">
                <img
                  src={imageUrl || exercise.prompt_media_id}
                  alt={exercise.title}
                  className="h-full max-h-96 w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                  loading="lazy"
                />
                {/* Maximize Lightbox Button */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute right-3 top-3 flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-md transition hover:bg-black/80 cursor-pointer shadow-md"
                  title={isVietnamese ? 'Phóng to xem chi tiết tranh' : 'Zoom image'}
                >
                  <Maximize2 size={14} />
                  <span>{isVietnamese ? 'Xem chi tiết' : 'Zoom'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 bg-surface/50 px-4 py-2 text-[12px] text-text-tertiary">
                <div className="flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-primary" />
                  <span>{isVietnamese ? 'Quan sát kỹ tiền cảnh, nhân vật chính, hậu cảnh và các chi tiết xung quanh.' : 'Observe foreground, main subjects, background and surrounding details.'}</span>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-medium text-primary">
                  {isVietnamese ? 'Mẹo: Nhấn nút "Xem chi tiết" để phóng to' : 'Tip: Click "Zoom" to expand'}
                </span>
              </div>
            </div>

            {/* Lightbox Fullscreen Modal */}
            {isLightboxOpen && (
              <div
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
                onClick={() => setIsLightboxOpen(false)}
              >
                <div className="relative max-h-[90vh] max-w-[95vw] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                  <div className="mb-3 flex w-full items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={16} className="text-primary" />
                      <span className="text-[14px] font-medium">{exercise.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(false)}
                      className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition cursor-pointer"
                      title={isVietnamese ? 'Đóng' : 'Close'}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <img
                    src={imageUrl || exercise.prompt_media_id}
                    alt={exercise.title}
                    className="max-h-[80vh] max-w-[95vw] rounded-xl object-contain shadow-2xl border border-white/10"
                  />

                  <p className="mt-3 text-[12px] text-white/70">
                    {isVietnamese ? 'Nhấn ra ngoài hoặc nút X để quay lại giao diện luyện tập.' : 'Click outside or X to return to workspace.'}
                  </p>
                </div>
              </div>
            )}

            {/* 4-Step Guided Outline Scaffolding for Describe Picture */}
            <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-primary" />
                  <span className="text-[13px] font-semibold text-text-primary">
                    {isVietnamese ? 'Dàn ý Chiến lược 4 Bước Mô tả Tranh' : '4-Step Picture Description Strategy'}
                  </span>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {isVietnamese ? 'Khung chuẩn TOEIC / IELTS' : 'Standard Exam Frame'}
                </span>
              </div>

              {/* Step Navigation Pills */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
                {[
                  { step: 1, label: isVietnamese ? '1. Bối cảnh chung' : '1. Overview' },
                  { step: 2, label: isVietnamese ? '2. Nhân vật chính' : '2. Main Subject' },
                  { step: 3, label: isVietnamese ? '3. Hậu cảnh & Vật' : '3. Background' },
                  { step: 4, label: isVietnamese ? '4. Bầu không khí' : '4. Atmosphere' },
                ].map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveOutlineStep(s.step)}
                    className={`rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition cursor-pointer text-center ${
                      activeOutlineStep === s.step
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface border border-border/70 text-text-secondary hover:border-primary/40'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Active Step Content */}
              <div className="rounded-xl border border-border/60 bg-surface p-3 text-[12px] leading-relaxed">
                {activeOutlineStep === 1 && (
                  <div>
                    <p className="font-semibold text-text-primary mb-1">
                      {isVietnamese ? 'Bước 1: Nêu bối cảnh tổng quan bức tranh' : 'Step 1: General Setting & Location'}
                    </p>
                    <p className="text-text-secondary mb-2">
                      {isVietnamese
                        ? 'Nêu địa điểm diễn ra bức ảnh (ở đâu? trong nhà hay ngoài trời?) và ấn tượng đầu tiên.'
                        : 'State where the picture was taken (indoor or outdoor) and the general scene.'}
                    </p>
                    <div className="rounded-lg bg-surface-subtle p-2 text-primary font-mono text-[11px]">
                      {isVietnamese
                        ? 'Mẫu câu: "This picture was taken in..." / "Looking at the image, I can see a scene taking place at..."'
                        : 'Sentence starter: "This picture was taken in..." / "The picture shows a scene in..."'}
                    </div>
                  </div>
                )}

                {activeOutlineStep === 2 && (
                  <div>
                    <p className="font-semibold text-text-primary mb-1">
                      {isVietnamese ? 'Bước 2: Nhân vật trung tâm & Hành động đang diễn ra' : 'Step 2: Main Subject & Continuous Actions'}
                    </p>
                    <p className="text-text-secondary mb-2">
                      {isVietnamese
                        ? 'Mô tả người ở tiền cảnh: họ mặc gì, đang làm gì (bắt buộc dùng thì Hiện tại tiếp diễn: is/are V-ing).'
                        : 'Describe who is in the foreground: their attire, posture, and what they are doing (Use Present Continuous: is/are V-ing).'}
                    </p>
                    <div className="rounded-lg bg-surface-subtle p-2 text-primary font-mono text-[11px]">
                      {isVietnamese
                        ? 'Mẫu câu: "In the foreground, there is a man/woman wearing... and he/she is [V-ing]..."'
                        : 'Sentence starter: "In the foreground, there is a person who is [V-ing]..."'}
                    </div>
                  </div>
                )}

                {activeOutlineStep === 3 && (
                  <div>
                    <p className="font-semibold text-text-primary mb-1">
                      {isVietnamese ? 'Bước 3: Hậu cảnh & Các vật thể xung quanh' : 'Step 3: Background & Spatial Surroundings'}
                    </p>
                    <p className="text-text-secondary mb-2">
                      {isVietnamese
                        ? 'Dùng các giới từ chỉ vị trí để tả đồ vật hoặc người khác ở phía sau hoặc hai bên.'
                        : 'Use spatial prepositions to describe objects or other people behind or on the sides.'}
                    </p>
                    <div className="rounded-lg bg-surface-subtle p-2 text-primary font-mono text-[11px]">
                      {isVietnamese
                        ? 'Mẫu câu: "In the background / On the left-hand side, I can notice..."'
                        : 'Sentence starter: "In the background, on the right side, there are..."'}
                    </div>
                  </div>
                )}

                {activeOutlineStep === 4 && (
                  <div>
                    <p className="font-semibold text-text-primary mb-1">
                      {isVietnamese ? 'Bước 4: Bầu không khí & Suy đoán cảm xúc' : 'Step 4: Atmosphere & Speculation'}
                    </p>
                    <p className="text-text-secondary mb-2">
                      {isVietnamese
                        ? 'Đưa ra cảm nhận chung về bầu không khí và tâm trạng của những người trong hình.'
                        : 'Conclude with the overall atmosphere and the mood of the subjects.'}
                    </p>
                    <div className="rounded-lg bg-surface-subtle p-2 text-primary font-mono text-[11px]">
                      {isVietnamese
                        ? 'Mẫu câu: "Overall, the atmosphere appears to be cozy / busy / productive..."'
                        : 'Sentence starter: "Overall, it seems that everyone is having a good time..."'}
                    </div>
                  </div>
                )}
              </div>

              {/* Spatial Phrases & Expected Keywords Pills */}
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>{isVietnamese ? 'Cụm từ định vị không gian gợi ý (Spatial Collocations):' : 'Spatial Phrases:'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {['In the foreground', 'In the background', 'In the middle of the picture', 'On the left side', 'On the right side', 'Next to'].map((phrase) => (
                    <span
                      key={phrase}
                      className="rounded-md border border-amber-200 bg-amber-50/70 px-2 py-0.5 font-medium text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200"
                    >
                      {phrase}
                    </span>
                  ))}
                </div>

                {exercise.expected_keywords && exercise.expected_keywords.length > 0 && (
                  <div className="mt-2.5">
                    <div className="mb-1.5 text-[11px] font-semibold text-text-secondary">
                      {isVietnamese ? 'Từ khóa gợi ý theo tranh:' : 'Target keywords for this scene:'}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {exercise.expected_keywords.map((kw) => (
                        <span
                          key={kw}
                          className="rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. SHORT DIALOGUE: Multi-turn Role Play Scenario */}
        {exercise.exercise_type === 'SHORT_DIALOGUE' && exercise.dialogue_scenario && (
          <div className="mb-4 space-y-3 rounded-xl border border-primary/20 bg-primary/[0.02] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-text-primary">
                <Users size={16} className="text-primary" />
                <span>
                  {isVietnamese ? 'Bối cảnh: ' : 'Setting: '}
                  <span className="font-normal text-text-secondary">{exercise.dialogue_scenario.setting}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px]">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-700">
                  {exercise.dialogue_scenario.user_role} (Bạn)
                </span>
                <span className="text-text-tertiary">vs</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-medium text-emerald-700">
                  {exercise.dialogue_scenario.ai_role} (AI)
                </span>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5 pt-2">
              {exercise.dialogue_scenario.turns.map((turn) => (
                <div
                  key={turn.turn_number}
                  className={`rounded-2xl p-4 sm:p-5 text-[13.5px] transition-all shadow-xs ${
                    turn.speaker === 'AI'
                      ? 'border border-border/80 bg-surface shadow-2xs'
                      : 'border border-primary/30 bg-primary/[0.03]'
                  }`}
                >
                  <div className="mb-2 pb-1.5 flex items-center justify-between font-semibold border-b border-border/30">
                    <span className={turn.speaker === 'AI' ? 'text-emerald-700' : 'text-primary'}>
                      {turn.speaker_name} ({turn.speaker === 'AI' ? 'AI' : isVietnamese ? 'Lượt của bạn' : 'Your turn'})
                    </span>
                    <span className="text-[11px] text-text-tertiary">Turn {turn.turn_number}</span>
                  </div>

                  <p className="leading-relaxed font-medium text-text-primary">{turn.text_en}</p>
                  {turn.text_vi && (
                    <p className="mt-1 text-[12px] italic text-text-tertiary">{turn.text_vi}</p>
                  )}

                  {turn.user_guidance && (
                    <div className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 text-[12px]">
                      <div className="flex items-center gap-1.5 font-medium text-amber-800">
                        <Lightbulb size={13} />
                        <span>{isVietnamese ? 'Nhiệm vụ: ' : 'Guidance: '}</span>
                        <span>{turn.user_guidance.goal_vi}</span>
                      </div>
                      {turn.user_guidance.suggested_phrases && turn.user_guidance.suggested_phrases.length > 0 && (
                        <div className="mt-1.5 text-amber-900">
                          <span className="font-medium">{isVietnamese ? 'Gợi ý: ' : 'Suggested: '}</span>
                          {turn.user_guidance.suggested_phrases.join(' | ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. READ ALOUD, REPEAT AFTER AUDIO & SHADOWING: Source Text & Reference Audio Player */}
        {(exercise.exercise_type === 'READ_ALOUD' ||
          exercise.exercise_type === 'PRONUNCIATION' ||
          exercise.exercise_type === 'SHADOWING' ||
          (exercise.exercise_type as string) === 'REPEAT_AFTER_AUDIO' ||
          Boolean(exercise.source_text) ||
          Boolean(exercise.reference_media_id)) && (
            <div className="mb-4 rounded-xl border border-border/80 bg-surface-subtle p-4">
              <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                <h3 className="flex items-center gap-2 text-[13px] font-semibold text-text-primary">
                  <Volume2 size={16} className="text-primary" />
                  {exercise.exercise_type === 'READ_ALOUD'
                    ? (isVietnamese ? 'Văn bản cần đọc' : 'Text to read')
                    : (isVietnamese ? 'Nội dung nghe mẫu' : 'Reference Audio')}
                </h3>

                {/* Nút bấm nghe audio mẫu (tải từ Cloudflare R2 cache) */}
                <button
                  type="button"
                  onClick={handlePlayReferenceAudio}
                  disabled={isLoadingAudio}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition cursor-pointer shadow-sm ${
                    isPlayingAudio
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                      : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
                  }`}
                  title={isVietnamese ? 'Nghe phát âm chuẩn từ Cloudflare R2' : 'Play reference audio from R2'}
                >
                  {isLoadingAudio ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-primary" />
                      <span>{isVietnamese ? 'Đang nạp từ R2...' : 'Loading audio...'}</span>
                    </>
                  ) : isPlayingAudio ? (
                    <>
                      <Pause size={14} />
                      <span>{isVietnamese ? 'Tạm dừng mẫu' : 'Pause'}</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      <span>{isVietnamese ? 'Nghe giọng đọc mẫu' : 'Play reference'}</span>
                    </>
                  )}
                </button>
              </div>

              {exercise.source_text && (
                <p className="text-[15px] font-medium leading-relaxed text-text-primary">
                  {exercise.source_text}
                </p>
              )}

              {exercise.source_text_vi && (
                <p className="mt-2 text-[13px] italic text-text-secondary">
                  {exercise.source_text_vi}
                </p>
              )}

              {audioError && (
                <p className="mt-2 text-[12px] font-medium text-red-600 bg-red-50 rounded-lg p-2 border border-red-200">
                  ⚠️ {audioError}
                </p>
              )}
            </div>
          )}

        {/* 4. ANSWER QUESTION & OPINION RESPONSE */}
        {(exercise.exercise_type === 'ANSWER_QUESTION' ||
          exercise.exercise_type === 'OPINION_RESPONSE' ||
          exercise.exercise_type === 'TOPIC' ||
          exercise.exercise_type === 'RESPOND_SITUATION') &&
          exercise.prompt_text_en && (
            <div className="mb-4 rounded-xl border border-border/80 bg-surface-subtle p-4">
              <h3 className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-text-primary">
                <MessageSquare size={16} className="text-primary" />
                {isVietnamese ? 'Chủ đề thảo luận' : 'Discussion Topic'}
              </h3>
              <p className="text-[15px] font-medium leading-relaxed text-text-primary">
                {exercise.prompt_text_en}
              </p>
              {exercise.prompt_text_vi && (
                <p className="mt-2 text-[13px] italic text-text-secondary">
                  {exercise.prompt_text_vi}
                </p>
              )}
            </div>
          )}

        {/* Target Phonetics / Keywords Pills */}
        {exercise.target_phonetics_knowledge_ids && exercise.target_phonetics_knowledge_ids.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-[12px] font-medium text-text-secondary">
              <Target size={14} className="text-primary" />
              {isVietnamese ? 'Âm mục tiêu:' : 'Target sounds:'}
            </span>
            {exercise.target_phonetics_knowledge_ids.map((sound) => (
              <span
                key={sound}
                className="rounded-lg border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[12px] font-bold text-primary"
              >
                {sound}
              </span>
            ))}
          </div>
        )}

        {/* Metadata Footer */}
        <div className="flex flex-wrap items-center gap-2.5 text-[12px]">
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium text-text-secondary">
            {isVietnamese ? 'Dạng:' : 'Type:'} {typeLabels[exercise.exercise_type] || exercise.exercise_type}
          </span>
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium text-text-secondary">
            {isVietnamese ? 'Chuẩn bị:' : 'Prep:'} {exercise.preparation_time_seconds || 0}s
          </span>
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium text-text-secondary">
            {isVietnamese ? 'Nói:' : 'Speak:'} {exercise.response_time_seconds || 60}s
          </span>
          {exercise.cefr_level && (
            <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium text-text-secondary">
              CEFR: {exercise.cefr_level}
            </span>
          )}
          {exercise.difficulty_level && (
            <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium text-text-secondary">
              {exercise.difficulty_level}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
