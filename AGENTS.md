# 💻 LingoSphere Frontend Web - Architecture, Coding Standards & Components Guide

> **Tài liệu chuẩn kỹ thuật Frontend Web:** Hướng dẫn toàn diện về ứng dụng Web Client dành cho Học viên LingoSphere (`frontend-web`), bao gồm quy chuẩn đặt tên biến, cấu trúc tệp tin, phong cách viết component React 19, hệ thống Strict TypeScript (0 `any`), quản lý State với Zustand và tích hợp các tính năng học tập cốt lõi.

---

## 🛠️ 1. Công Nghệ & Tiêu Chuẩn Kỹ Thuật

* **Core Framework:** React 19 + Vite 8.2 + TypeScript (Strict Mode - 100% Type Safety)
* **Styling & Design System:** TailwindCSS với Hệ thống Design Tokens (`primary`, `surface`, `accent`, `text-primary`, `surface-hover`, v.v.)
* **State Management:** Zustand (`src/store/`)
* **Routing:** React Router DOM v7 (`src/routes/` & `src/App.tsx`)
* **HTTP Client:** Axios với Request Queue Interceptor tự động Refresh Token (`src/services/api-client.ts`)
* **Đa ngôn ngữ (i18n):** Song ngữ Anh - Việt qua `i18next` (`src/i18n/`)
* **Port Mặc Định:** **`5174`** (`http://localhost:5174`)

---

## 🏷️ 2. Quy Chuẩn Đặt Tên & Phong Cách Viết Code (Frontend Web Standards)

### 2.1. Quy Chuẩn Đặt Tên Tệp Tin & Thư Mục
* **Components & Pages:** `PascalCase.tsx` (ví dụ: `ToeicExamPage.tsx`, `FlashcardExercise.tsx`, `DailyGoalWidget.tsx`).
* **Custom Hooks:** `camelCase.ts` có tiền tố `use*` (ví dụ: `useAuth.ts`, `useAudioRecorder.ts`).
* **Zustand Stores:** `use*Store.ts` hoặc `kebab-case-store.ts` (ví dụ: `auth-store.ts`, `ui-store.ts`, `toast-store.ts`).
* **Services & APIs:** `kebab-case.service.ts` (ví dụ: `course.service.ts`, `ai.service.ts`, `vocabulary.service.ts`).
* **Interfaces & Types:** `kebab-case.ts` đặt trong thư mục `src/types/` (ví dụ: `user.ts`, `course.ts`, `vocabulary-learn.ts`).

### 2.2. Quy Chuẩn Đặt Tên Biến & Props (Naming Conventions)
* **Props Interface:** Đặt tên dạng `<ComponentName>Props` (ví dụ: `CourseCardProps`, `FlashcardExerciseProps`).
* **Boolean Props & State:** Luôn có tiền tố `is`, `has`, `can`, `should` (ví dụ: `isCompleted`, `isLoading`, `hasAudio`, `canSubmit`).
* **Event Handlers trong Component:**
  - Hàm xử lý nội bộ: `handle*` (ví dụ: `handleSubmit()`, `handleCardFlip()`, `handleAudioPlay()`).
  - Callback truyền qua Props: `on*` (ví dụ: `onComplete()`, `onNextExercise()`, `onSelectAnswer()`).

### 2.3. Cấu Trúc File Chuẩn của một React 19 Component
```tsx
import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Volume2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import type { VocabularyItem } from '@/types/vocabulary-learn'

interface FlashcardExerciseProps {
  word: VocabularyItem
  onComplete: (wordId: string, qualityScore: number) => void
  disabled?: boolean
}

export function FlashcardExercise({
  word,
  onComplete,
  disabled = false,
}: FlashcardExerciseProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const [isFlipped, setIsFlipped] = useState<boolean>(false)

  const handleFlip = useCallback(() => {
    if (disabled) return
    setIsFlipped((prev) => !prev)
  }, [disabled])

  const pronunciationDisplay = useMemo(() => {
    return word.pronunciation ? `/${word.pronunciation}/` : ''
  }, [word.pronunciation])

  return (
    <div className="flex flex-col items-center">
      <Card
        className="relative h-72 w-full cursor-pointer transition-transform duration-500"
        onClick={handleFlip}
      >
        <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {word.partOfSpeech}
          </span>
          <h2 className="mt-3 text-3xl font-bold text-text-primary">{word.word}</h2>
          <p className="mt-1 font-mono text-sm text-text-secondary">{pronunciationDisplay}</p>
        </CardContent>
      </Card>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => onComplete(word.id, 5)}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {isVi ? 'Đã nhớ từ này' : 'Remembered'}
        </Button>
      </div>
    </div>
  )
}
```

---

## 📂 3. Cấu Trúc Toàn Diện Các Thư Mục Chức Năng (`src/components/`)

```
frontend-web/src/components/
├── auth/                 # Modal & Form Xác thực
│   ├── AuthModal.tsx     # Modal chứa tabs Đăng nhập / Đăng ký
│   ├── LoginForm.tsx     # Form đăng nhập với validation
│   └── RegisterForm.tsx  # Form đăng ký tài khoản học viên mới
├── common/               # Component chia sẻ toàn ứng dụng (Shared Atoms & Molecules)
│   ├── UserAvatar.tsx    # Avatar học viên kèm badge Level
│   ├── StatBadge.tsx     # Huy hiệu XP / Streak
│   └── ProgressBar.tsx   # Thanh tiến độ hoạt hình
├── course/               # Khóa học & Bài giảng
│   ├── CourseCard.tsx    # Thẻ khóa học hiển thị ảnh, điểm target, tiến độ
│   ├── CourseDetailPage.tsx # Trang chi tiết, danh sách chương, video player
│   ├── CourseList.tsx    # Lưới danh sách khóa học kèm bộ lọc
│   └── LessonVideoPlayer.tsx # Trình phát video bài giảng
├── dashboard/            # Trang tổng quan học viên
│   ├── DailyGoalWidget.tsx   # Đồng hồ đo thời gian học hôm nay
│   ├── StreakBanner.tsx      # Biểu đồ chuỗi ngày học liên tiếp
│   ├── LearningRadarChart.tsx# Biểu đồ Radar 4 kỹ năng
│   └── RecommendedCourses.tsx# Khóa học AI đề xuất
├── layout/               # Bộ khung giao diện ứng dụng
│   ├── AppLayout.tsx     # Bố cục chuẩn gồm Sidebar + Header + Main Content
│   ├── Sidebar.tsx       # Sidebar thu gọn / mở rộng
│   ├── SidebarNav.tsx    # Nhóm menu đa cấp hỗ trợ đa ngôn ngữ
│   └── Header.tsx        # Thanh điều hướng trên cùng kèm thông báo
├── practice/             # Trung tâm luyện 4 kỹ năng
│   ├── ListeningPractice.tsx # Luyện nghe chép chính tả (Dictation)
│   ├── SpeakingPractice.tsx  # Luyện nói tích hợp ghi âm giọng nói & Whisper
│   └── WritingPractice.tsx   # Luyện viết đoạn văn & Chấm bài bằng AI
├── toeic/                # Hệ thống Thi Thử TOEIC Chuẩn ETS 2024
│   ├── ToeicHub.tsx      # Sảnh chọn đề Full Test (200 câu) & Practice Part 1-7
│   ├── ToeicExamPage.tsx # Phòng thi chuẩn: Timer 120p, Audio player, Palette câu hỏi
│   └── ToeicResultModal.tsx # Báo cáo điểm số chi tiết thang 990 & Nhận xét Part
├── vocabulary-learning/  # 6 Dạng bài tập học từ vựng Spaced Repetition (SRS SM-2):
│   ├── exercises/
│   │   ├── FlashcardExercise.tsx     # Lật thẻ Flashcard 3D
│   │   ├── TypeWordExercise.tsx      # Gõ từ theo nghĩa tiếng Việt
│   │   ├── ListenTypeExercise.tsx    # Nghe phát âm và gõ từ
│   │   ├── PronunciationExercise.tsx # Thu âm luyện phát âm
│   │   ├── ImageWordExercise.tsx     # Nhìn hình ảnh đoán từ vựng
│   │   └── ContextExercise.tsx       # Điền từ vào ngữ cảnh câu mẫu
│   └── VocabularyLearningFlow.tsx    # Điều phối chu trình 6 bước học từ
└── writing/              # Kết quả đánh giá bài viết AI
    └── WritingResult.tsx # Tab phân tích: Tổng quan, Từ vựng, Ngữ pháp, Lỗi sai
```

---

## 🤖 4. Màn Hình Gia Sư AI LingoSphere (`src/routes/ai-learning-route.tsx`)

* **Giao tiếp API:** Gọi trực tiếp `aiService.chatWithAiTutor(message, history)` kết nối Gateway `POST /ai/chat`.
* **Tốc độ phản hồi:** **1.5s - 2.1s** nhờ tích hợp Google Gemini 3.1 Flash Lite.
* **Quy chuẩn hiển thị:**
  - Hỗ trợ Markdown đầy đủ, hiển thị code block và bảng giải thích ngữ pháp.
  - Các nút gợi ý nhanh (Prompt Suggestions): *"Giải thích câu điều kiện loại 3"*, *"Phân biệt In/On/At"*, *"Sửa lỗi ngữ pháp đoạn văn này"*.

---

## 🎯 5. Quản Lý State Toàn Cục (Zustand Stores)

* **`useAuthStore` (`src/store/auth-store.ts`):** Quản lý phiên đăng nhập của học viên:
  - `user`: Thông tin học viên hiện tại (`UserProfile | null`).
  - `accessToken`, `refreshToken`: Token xác thực.
  - `isAuthenticated`: Trạng thái đã đăng nhập hay chưa.
* **`useUIStore` (`src/store/ui-store.ts`):** Quản lý giao diện:
  - `theme`: Chế độ giao diện (`'light' | 'dark' | 'system'`).
  - `isSidebarCollapsed`: Trạng thái đóng/mở của thanh Sidebar.
* **`useToastStore` (`src/store/toast-store.ts`):** Quản lý hiển thị thông báo popup Toast.

---

## 📝 6. Quy Chuẩn Kiểm Tra Trước Khi Bàn Giao (Validation Checklist)

```bash
# Kiểm tra TypeScript toàn dự án (phải đạt 0 lỗi)
npx tsc --noEmit

# Kiểm tra đóng gói Production Build (phải đạt Exit Code 0)
npm run build
```
