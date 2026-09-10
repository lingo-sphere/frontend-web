// Trang giới thiệu trung tâm cộng đồng LingoSphere và hướng dẫn tham gia kênh chat chung.
'use client';

import Link from 'next/link';
import {
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';

export default function CommunityAppPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-b from-slate-50 via-white to-slate-50/50 p-8 shadow-xs md:p-12 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Kênh Chat Trực Tiếp #general-lounge</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
            Cộng Đồng Học Viên <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">LingoSphere</span>
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base dark:text-slate-300">
            Không gian kết nối, giao lưu và học hỏi thời gian thực mở cho toàn bộ học viên LingoSphere. Hãy cùng nhau chia sẻ mẹo học, kinh nghiệm thi TOEIC và giải đáp thắc mắc mỗi ngày.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const trigger = document.querySelector('button[aria-label="Mở kênh chat cộng đồng"]') as HTMLButtonElement | null;
                if (trigger) trigger.click();
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-98 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Mở Hộp Thoại Chat Ngay</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {!isAuthenticated && (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Đăng nhập tài khoản
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            Nhắn Tin Tức Thời
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Giao tiếp mượt mà qua WebSocket với tab nổi ở góc phải màn hình, hỗ trợ gửi ảnh bài tập và biểu tượng cảm xúc.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            Cộng Đồng Học Tập Năng Động
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Mạng lưới học viên sôi nổi, cùng nhau chia sẻ tài liệu và tiến bộ mỗi ngày với hệ thống huy hiệu nhận diện rõ ràng.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            Môi Trường Văn Minh
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Hệ thống kiểm duyệt chủ động bởi Quản trị viên và Phó nhóm, ngăn chặn hành vi spam và quấy rối.
          </p>
        </div>
      </div>
    </div>
  );
}
