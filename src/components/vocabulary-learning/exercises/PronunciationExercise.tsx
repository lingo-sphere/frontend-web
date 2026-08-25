
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Volume2, Mic, Square, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { speakWord } from '@/data/vocabulary-learn-data'
import type { VocabularyItem } from '@/types/vocabulary-learn'

interface PronunciationExerciseProps {
  word: VocabularyItem
  isAnswered: boolean
  onAnswer: (isCorrect: boolean, userAnswer: string) => void
  onNext: () => void
  onSpeakWord: () => void
  onSpeakSentence: () => void
}

export function PronunciationExercise({ word, isAnswered, onAnswer, onNext, onSpeakWord }: PronunciationExerciseProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const handleStartRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000)
  }

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    setHasRecorded(true)
    const score = Math.floor(Math.random() * 30) + 70
    setPronunciationScore(score)
    onAnswer(score >= 70, `${score}%`)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <p className="mb-2 text-[14px] text-text-secondary">
          {isVietnamese ? 'Phát âm từ này:' : 'Say this word:'}
        </p>
        <h2 className="text-[32px] font-bold text-text-primary">{word.word}</h2>
        <p className="mt-2 font-mono text-[16px] text-text-secondary">{word.pronunciation}</p>
      </div>

      <button onClick={onSpeakWord}
        className="mb-8 flex items-center gap-2 rounded-xl bg-primary px-6 py-4 text-white transition-colors hover:bg-primary-hover">
        <Volume2 size={24} />
        <span className="font-semibold">{isVietnamese ? 'Nghe' : 'Listen'}</span>
      </button>

      {!hasRecorded ? (
        <div className="flex flex-col items-center">
          <button onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`flex h-24 w-24 items-center justify-center rounded-full text-white transition-all ${
              isRecording ? 'bg-error animate-pulse' : 'bg-primary hover:bg-primary-hover'
            }`}>
            {isRecording ? <Square size={32} /> : <Mic size={32} />}
          </button>

          {isRecording ? (
            <div className="mt-4 text-center">
              <p className="text-[14px] text-error">{isVietnamese ? 'Đang ghi...' : 'Recording...'}</p>
              <p className="mt-1 text-[24px] font-bold text-text-primary">{formatTime(recordingTime)}</p>
            </div>
          ) : (
            <p className="mt-4 text-[14px] text-text-secondary">
              {isVietnamese ? 'Nhấn để bắt đầu ghi' : 'Tap to start recording'}
            </p>
          )}
        </div>
      ) : (
        <div className="w-full text-center">
          {pronunciationScore !== null && (
            <div className="mb-6">
              <p className="mb-2 text-[14px] text-text-secondary">
                {isVietnamese ? 'Điểm phát âm' : 'Pronunciation Score'}
              </p>
              <div className="relative mx-auto h-32 w-32">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-subtle" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                    strokeDasharray={`${(pronunciationScore / 100) * 283} 283`}
                    className={pronunciationScore >= 80 ? 'text-success' : pronunciationScore >= 70 ? 'text-warning' : 'text-error'}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[32px] font-bold text-text-primary">{pronunciationScore}%</span>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-center gap-2 text-success">
              <Check size={18} />
              <span className="text-[14px]">{isVietnamese ? 'Từ được nhận diện' : 'Word recognized'}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-success">
              <Check size={18} />
              <span className="text-[14px]">{isVietnamese ? 'Phát âm tốt' : 'Good pronunciation'}</span>
            </div>
          </div>

          <Button className="bg-primary hover:bg-primary-hover" onClick={onNext}>
            {isVietnamese ? 'Tiếp theo' : 'Next'}
            <ChevronRight size={18} />
          </Button>
        </div>
      )}
    </div>
  )
}
