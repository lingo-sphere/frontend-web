// Component hiển thị danh sách các lựa chọn đáp án trắc nghiệm cho câu hỏi TOEIC.

import { CheckCircle2, XCircle } from 'lucide-react'

interface ToeicMultipleChoiceOptionsProps {
  options?: Array<{ key: string; textEn: string }>
  selectedOption?: string
  correctOption?: string
  showAnswer: boolean
  isSubmitted: boolean
  onSelectAnswer: (key: string) => void
}

export function ToeicMultipleChoiceOptions({
  options,
  selectedOption,
  correctOption,
  showAnswer,
  isSubmitted,
  onSelectAnswer,
}: ToeicMultipleChoiceOptionsProps) {
  return (
    <div className="mt-4 space-y-2">
      {options?.map((option) => {
        const isSelected = selectedOption === option.key
        const isCorrect = showAnswer && option.key === correctOption
        const isWrong = showAnswer && isSelected && option.key !== correctOption

        return (
          <button
            key={option.key}
            onClick={() => onSelectAnswer(option.key)}
            disabled={isSubmitted}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
              isCorrect
                ? 'border-emerald-500 bg-emerald-50'
                : isWrong
                  ? 'border-red-500 bg-red-50'
                  : isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] font-medium ${
                isCorrect
                  ? 'bg-emerald-500 text-white'
                  : isWrong
                    ? 'bg-red-500 text-white'
                    : isSelected
                      ? 'bg-primary text-white'
                      : 'bg-surface-subtle'
              }`}
            >
              {option.key}
            </span>
            <span
              className={`flex-1 text-[14px] ${
                isCorrect
                  ? 'font-medium text-emerald-700'
                  : isWrong
                    ? 'text-red-700'
                    : 'text-text-primary'
              }`}
            >
              {option.textEn}
              {isCorrect && <CheckCircle2 size={14} className="ml-2 inline text-emerald-600" />}
              {isWrong && <XCircle size={14} className="ml-2 inline text-red-600" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
