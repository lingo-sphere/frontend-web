"use client"

import { useState, useEffect, useCallback } from "react"

export type LandingLang = "vi" | "en"

export const landingLocales = {
  vi: {
    nav: {
      workbench: "Phương Pháp",
      showcase: "Trải Nghiệm",
      performance: "Hiệu Năng",
      islands: "4 Trụ Cột",
      manifesto: "Triết Lý",
      stargazer: "Bắt Đầu",
      login: "Đăng Nhập",
      enterStudio: "Vào Bàn Học",
      langSwitch: "Ngôn ngữ",
    },
    hero: {
      tag: "Hệ Sinh Thái Luyện Thi Thông Minh",
      title1: "Tiếng Anh Tư Duy",
      title2: "Bứt Phá TOEIC",
      quote: '"Học tiếng Anh bằng tư duy logic và khoa học não bộ, nói không với học vẹt."',
      btnStart: "Bắt Đầu Học Miễn Phí",
      btnToeic: "Thi Thử TOEIC ETS",
      status: "Hơn 20,000 học viên đang học trực tuyến hôm nay",
      scrollPrompt: "Cuộn Để Khám Phá",
    },
    manifesto: {
      tag: "Triết Lý Sư Phạm LingoSphere",
      title: "Tiếng Anh không phải để học vẹt, mà là công cụ của",
      titleHighlight: "tư duy logic",
      lines: [
        "Học tiếng Anh bằng tư duy logic, không học vẹt.",
        "Mỗi bài học là một bước đột phá điểm số vững chắc.",
        "Tối ưu hóa trí nhớ dài hạn cùng thuật toán Spaced Repetition SRS.",
        "Gia sư AI Hybrid và Whisper STT đồng hành sửa lỗi 24/7.",
      ],
    },
    books: {
      tag: "Thư Viện Sách & Cẩm Nang Thực Chiến",
      title: "Bộ Cẩm Nang & Giáo Trình Tư Duy",
      titleHighlight: "3D Field Manuals",
      desc: "Khám phá các cẩm nang thực chiến, bộ công cụ tư duy và phương pháp học tiếng Anh hiện đại được dựng trong không gian 3D tương tác sống động.",
      hint: "Kéo chuột & Click để lật sách 3D",
    },
    method: {
      title: "Hệ Phương Pháp",
      highlight: "Tư Duy Não Bộ",
      suffix: "Logic",
      desc: "Tách cấu trúc câu, hiểu trọn vẹn ngữ cảnh và ghi nhớ vĩnh viễn từ vựng bằng thuật toán lặp lại ngắt quãng Spaced Repetition.",
      step1: "Tư Duy Logic (Đơn giản hóa & Liên kết)",
      step2: "Chuẩn Hóa Âm Vị Whisper AI",
      deepFocus: "Tập Trung Sâu",
      deepFocusDesc: "Tối ưu hóa tải nhận thức cho học viên",
    },
    marquee: "✦ 4 TRỤ CỘT ĐỘT PHÁ ĐIỂM SỐ ✦ HỆ SINH THÁI LINGOSPHERE ✦ CHINH PHỤC ETS 990 ✦ PHÁT ÂM WHISPER AI ✦",
    pillars: {
      tag: "Khám Phá Hệ Sinh Thái Học Tập",
      items: [
        {
          node: "TRỤ_CỘT_01",
          title: "Luyện Thi TOEIC Chuẩn ETS",
          description:
            "Phòng thi thử 200 câu 7 Part bấm giờ thực tế. Thuật toán chấm điểm và phân tích điểm yếu tức thì.",
        },
        {
          node: "TRỤ_CỘT_02",
          title: "Luyện Nói Whisper AI",
          description:
            "Nhận diện giọng nói siêu chuẩn xác từng âm vị. Hướng dẫn phát âm, nối âm và ngữ điệu tự nhiên.",
        },
        {
          node: "TRỤ_CỘT_03",
          title: "Siêu Trí Nhớ Từ Vựng SRS",
          description:
            "Khoa học SuperMemo SM-2 tự động nhắc lại từ vựng đúng thời điểm não bộ sắp quên để ghi nhớ vĩnh viễn.",
        },
        {
          node: "TRỤ_CỘT_04",
          title: "Gia Sư AI Hybrid 24/7",
          description:
            "Trợ lý AI Gemini Flash kết hợp Groq LPU giải đáp thắc mắc, phân tích ngữ pháp và sửa bài viết tức thì.",
        },
      ],
    },
    stats: [
      { target: 990, suffix: "", decimals: 0, label: "Thang Điểm ETS Tối Đa" },
      { target: 4000, suffix: "+", decimals: 0, label: "Học Viên Đạt 850+" },
      { target: 20, suffix: "k+", decimals: 0, label: "Học Viên Tin Dùng" },
      { target: 0.4, suffix: "s", decimals: 1, label: "Tốc Độ Phản Hồi AI" },
    ],
    showcase: {
      tag: "Kiến Trúc Đột Phá Điểm Số",
      title: "Sức Mạnh Tư Duy & Công Nghệ AI",
      heading: "Tối ưu hóa học tập bằng khoa học não bộ,",
      headingHighlight: "nói không với học vẹt.",
      desc: "LingoSphere kết hợp thuật toán lặp lại ngắt quãng Spaced Repetition SM-2 và mô hình AI Whisper STT nhận diện ngữ điệu, giúp bạn ghi nhớ từ vựng vĩnh viễn và phát âm chuẩn bản xứ chỉ sau 30 ngày.",
      bullet1: "Phân tích ngữ cảnh và cấu trúc câu thông minh theo tư duy LingoThinking.",
      bullet2: "Gia sư AI Hybrid đồng hành giải đáp thắc mắc và sửa lỗi chi tiết 24/7.",
      bullet3: "Thuật toán thích ứng tự động lấp đầy lỗ hổng ngữ pháp TOEIC.",
      btnTry: "Trải Nghiệm Bàn Học Ngay",
    },
    performance: {
      tag: "Kiến Trúc Đa Tầng Hiệu Năng Cao",
      title1: "Hiệu Năng Học Tập Đỉnh Cao.",
      title2: "Bứt Phá Giới Hạn.",
      coreEngine: "Động Cơ Học Tập Nơ-ron AI",
      coreActive: "100% Học Chủ Động",
      card1Title: "Lặp Lại Ngắt Quãng",
      card1Badge: "Thuật Toán SM-2",
      card1Word: "Resilience",
      card1Phonetic: "/rɪˈzɪl.jəns/",
      card1Desc: "Khả năng phục hồi & bứt phá giới hạn nhận thức",
      card1Retention: "Độ nhớ: 98%",
      card1Review: "Ôn lại: sau 6 ngày",
      card2Title: "Luyện Nói Whisper AI",
      card2Badge: "99.2% Chuẩn Âm",
      card2Desc: "Chuẩn hóa cặp âm khó /θ/ & /ð/",
      card3Title: "Động Cơ Thi Thử ETS",
      card3Score: "965",
      card3Max: "/ 990 tối đa",
      card3Listening: "Nghe: 490/495",
      card3Reading: "Đọc: 475/495",
      card4Title: "Gia Sư Trí Tuệ Nhân Tạo",
      card4Badge: "Phản Hồi 0.3s",
      card4Question: "Tại sao câu này chọn (B) mà không chọn (D)?",
      card4Answer: "Vì sau giới từ 'despite' ta cần một danh từ...",
      card5Title: "Tư Duy Ngữ Pháp Logic",
      card5Badge: "Ma Trận Cú Pháp",
      card5Desc: "Cắt lớp cấu trúc câu phức, không cần dịch thô từng từ",
      card6Title: "Chuỗi Học Liên Tục",
      card6Streak: "42 Ngày Liên Tục",
      card6XP: "+1,280 XP hôm nay",
    },
    lanyard: {
      tag: "Cổng Nhập Học LingoSphere",
      title: "Kéo Thẻ Sinh Viên VIP Để Vào Bàn Học",
      subtitle:
        "Trải nghiệm cơ chế vật lý tương tác trực tiếp — Nhấp giữ và kéo thẻ xuống dưới để xác thực vé vào hệ thống.",
      vipPassport: "THẺ VIP HỌC VIÊN",
      academy: "HỌC VIỆN TIẾNG ANH TƯ DUY LOGIC",
      targetBadge: "MỤC TIÊU: ETS 990",
      statusAuth: "TRẠNG THÁI: ĐÃ XÁC THỰC 2026",
      quote: '"Học tiếng Anh bằng tư duy tự nhiên, bứt phá điểm số cùng AI."',
      sparkEngine: "✦ ĐỘNG CƠ TƯ DUY SPARK",
      studentLabel: "HỌC VIÊN",
      studentName: "Học Viên VIP LingoSphere",
      accessCodeLabel: "MÃ TRUY CẬP",
      promptPull: "Kéo thẻ xuống để vào Bàn Học",
      granted: "Xác Thực Thành Công ➔ Đang Vào Bàn Học...",
    },
    footer: {
      tag: "Nền Tảng LingoSphere",
      title: "Sẵn sàng bứt phá điểm số?",
      subtitle:
        "Hơn 20,000 học viên đã làm chủ tiếng Anh cùng LingoSphere. Học bằng tư duy logic não bộ và chinh phục mục tiêu TOEIC ngay hôm nay.",
      btnEnter: "Vào Bàn Học Ngay",
      btnToeic: "Thi Thử TOEIC ETS",
      colCourses: "Khóa Học",
      colPractice: "Luyện Tập",
      colSystem: "Hệ Thống",
      course1: "TOEIC Foundation 450+",
      course2: "TOEIC Intensive 750+",
      course3: "Luyện Nói Whisper AI",
      course4: "Từ Vựng SRS 44 Âm",
      prac1: "Phòng Thi ETS 7 Part",
      prac2: "Luyện Nghe Dictation",
      prac3: "Viết AI Sửa Lỗi",
      prac4: "Ngữ Pháp Tinh Gọn",
      sys1: "Giới Thiệu LingoSphere",
      sys2: "Bảng Xếp Hạng Tuần",
      sys3: "Huy Hiệu & Cột Mốc",
      sys4: "Điều Khoản & Bảo Mật",
      copyright: "© 2026 LingoSphere Ecosystem. Nền tảng học tiếng Anh tư duy logic.",
    },
  },
  en: {
    nav: {
      workbench: "Methodology",
      showcase: "Showcase",
      performance: "Performance",
      islands: "4 Pillars",
      manifesto: "Manifesto",
      stargazer: "Get Started",
      login: "Log In",
      enterStudio: "Study Room",
      langSwitch: "Language",
    },
    hero: {
      tag: "Intelligent Test Prep Ecosystem",
      title1: "Cognitive English",
      title2: "TOEIC Mastery",
      quote: '"Master English through logic and brain science, eliminating rote memorization."',
      btnStart: "Start Learning Free",
      btnToeic: "ETS Mock Test",
      status: "Over 20,000 students actively learning today",
      scrollPrompt: "Scroll To Explore",
    },
    manifesto: {
      tag: "LingoSphere Pedagogical Philosophy",
      title: "English is not for rote memorization, but a tool for",
      titleHighlight: "cognitive logic",
      lines: [
        "Master English through logic and natural reasoning, not memorization.",
        "Every lesson delivers a solid, measurable score breakthrough.",
        "Maximize long-term memory with Spaced Repetition (SRS) science.",
        "Hybrid AI Tutor and Whisper STT provide 24/7 instant feedback.",
      ],
    },
    books: {
      tag: "Interactive 3D Book Showcase",
      title: "Field Manuals & Practical Guides",
      titleHighlight: "3D Field Manuals",
      desc: "Explore hands-on field manuals, thinking blueprints, and modern language tools rendered in an immersive 3D interactive space.",
      hint: "Drag & Click to explore 3D books",
    },
    method: {
      title: "Core Methodology",
      highlight: "LingoThinking",
      suffix: "Logic",
      desc: "Deconstruct sentence structures, master deep context, and lock vocabulary into permanent memory with Spaced Repetition.",
      step1: "Logical Reasoning (Simplify & Connect)",
      step2: "Phoneme Alignment via Whisper STT",
      deepFocus: "Deep Focus",
      deepFocusDesc: "Optimized cognitive load for learners",
    },
    marquee: "✦ 4 PILLARS OF SCORE BREAKTHROUGH ✦ LINGOSPHERE ECOSYSTEM ✦ CONQUER ETS 990 ✦ WHISPER AI SPEECH ✦",
    pillars: {
      tag: "Explore The Learning Ecosystem",
      items: [
        {
          node: "NODE_01",
          title: "ETS Standard TOEIC Prep",
          description:
            "Realistic 200-question 7-part timed exam simulator. Instant ETS scoring engine and weakness diagnostics.",
        },
        {
          node: "NODE_02",
          title: "Whisper AI Speech Lab",
          description:
            "Phoneme-level speech recognition. Real-time feedback on pronunciation, linking sounds, and natural intonation.",
        },
        {
          node: "NODE_03",
          title: "SRS Super Memory Flashcards",
          description:
            "SuperMemo SM-2 spaced repetition algorithm schedules reviews right before you forget, locking words in forever.",
        },
        {
          node: "NODE_04",
          title: "24/7 Hybrid AI Tutor",
          description:
            "Gemini Flash paired with ultra-low latency Groq LPU clarifies doubts, breaks down grammar, and grades essays instantly.",
        },
      ],
    },
    stats: [
      { target: 990, suffix: "", decimals: 0, label: "ETS Max Scale" },
      { target: 4000, suffix: "+", decimals: 0, label: "Students 850+" },
      { target: 20, suffix: "k+", decimals: 0, label: "Student Reviews" },
      { target: 0.4, suffix: "s", decimals: 1, label: "AI Latency" },
    ],
    showcase: {
      tag: "Score Breakthrough Architecture",
      title: "Power of Cognitive Logic & AI",
      heading: "Optimize learning through brain science,",
      headingHighlight: "no more rote memorization.",
      desc: "LingoSphere fuses Spaced Repetition SM-2 science with Whisper STT speech AI, helping you retain vocabulary permanently and sound native in 30 days.",
      bullet1: "Intelligent context and sentence breakdown via LingoThinking logic.",
      bullet2: "24/7 Hybrid AI Tutor clarifying questions and correcting mistakes in real time.",
      bullet3: "Adaptive algorithm automatically patching your specific ETS grammar gaps.",
      btnTry: "Enter Study Room Now",
    },
    performance: {
      tag: "High-Performance Multi-Tier Architecture",
      title1: "Peak Learning Performance.",
      title2: "Beyond Boundaries.",
      coreEngine: "Neural Study Engine",
      coreActive: "100% Active Learning",
      card1Title: "Spaced Repetition",
      card1Badge: "SM-2 SuperMemo",
      card1Word: "Resilience",
      card1Phonetic: "/rɪˈzɪl.jəns/",
      card1Desc: "Cognitive resilience & breaking learning plateaus",
      card1Retention: "Retention: 98%",
      card1Review: "Review: in 6 days",
      card2Title: "Whisper AI STT",
      card2Badge: "99.2% Match",
      card2Desc: "Phoneme accuracy for difficult /θ/ & /ð/ sounds",
      card3Title: "ETS TOEIC Engine",
      card3Score: "965",
      card3Max: "/ 990 max",
      card3Listening: "Listening: 490/495",
      card3Reading: "Reading: 475/495",
      card4Title: "Groq LPU Hybrid AI",
      card4Badge: "0.4s Latency",
      card4Question: "Why is option (B) correct instead of (D)?",
      card4Answer: "Because following the preposition 'despite', a noun phrase is required...",
      card5Title: "LingoThinking Logic",
      card5Badge: "Grammar Matrix",
      card5Desc: "Complex sentence structure deconstruction without literal translation",
      card6Title: "Active Study Streak",
      card6Streak: "42 Days Streak",
      card6XP: "+1,280 XP earned today",
    },
    lanyard: {
      tag: "LingoSphere Academy Entrance",
      title: "Pull VIP Student Badge to Enter",
      subtitle:
        "Experience direct interactive physics — Click, hold, and pull the badge down to authenticate your access.",
      vipPassport: "VIP PASSPORT",
      academy: "ACADEMY OF COGNITIVE ENGLISH",
      targetBadge: "TARGET: ETS 990",
      statusAuth: "STATUS: AUTHENTICATED 2026",
      quote: '"Master English with natural cognitive logic, supercharged by AI."',
      sparkEngine: "✦ SPARK COGNITIVE ENGINE",
      studentLabel: "STUDENT",
      studentName: "Lingo Scholar VIP",
      accessCodeLabel: "ACCESS CODE",
      promptPull: "Pull card down to enter Study Room",
      granted: "Access Granted ➔ Entering Study Room...",
    },
    footer: {
      tag: "LingoSphere Platform",
      title: "Ready for your score breakthrough?",
      subtitle:
        "Join over 20,000 students who have mastered English with LingoSphere. Learn with cognitive logic and reach your dream TOEIC score today.",
      btnEnter: "Enter Study Room",
      btnToeic: "ETS Mock Exam",
      colCourses: "Courses",
      colPractice: "Practice",
      colSystem: "Platform",
      course1: "TOEIC Foundation 450+",
      course2: "TOEIC Intensive 750+",
      course3: "Whisper AI Speaking",
      course4: "44-Sound SRS Vocab",
      prac1: "ETS 7-Part Exam Room",
      prac2: "Dictation Listening",
      prac3: "AI Essay Correction",
      prac4: "Concise Grammar",
      sys1: "About LingoSphere",
      sys2: "Weekly Leaderboards",
      sys3: "Badges & Milestones",
      sys4: "Terms & Privacy",
      copyright: "© 2026 LingoSphere Ecosystem. Cognitive logic English learning platform.",
    },
  },
}

const STORAGE_KEY = "lingo_landing_lang"

export function useLandingLocale() {
  const [lang, setLangState] = useState<LandingLang>("vi")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY) as LandingLang | null
      if (saved === "vi" || saved === "en") {
        setLangState(saved)
      } else {
        const i18nSaved = localStorage.getItem("i18nextLng")
        if (i18nSaved && (i18nSaved.startsWith("en") || i18nSaved.startsWith("vi"))) {
          setLangState(i18nSaved.startsWith("en") ? "en" : "vi")
        }
      }
    }
  }, [])

  const setLang = useCallback((newLang: LandingLang) => {
    setLangState(newLang)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLang)
    }
  }, [])

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === "vi" ? "en" : "vi"
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, next)
      }
      return next
    })
  }, [])

  return {
    lang,
    setLang,
    toggleLang,
    t: landingLocales[lang],
  }
}
