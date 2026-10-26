/**
 * @file listening.topic-hub.modal.tsx
 * @description Modal trung tâm chọn dạng bài tập (Part 1, 2, 3, 4, Dictation) khi người học chọn một Chủ đề ngữ cảnh
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon.map';
import { useContextById } from '../hooks/use.context';

export type PracticePartType = 'PART_1' | 'PART_2' | 'PART_3' | 'PART_4' | 'DICTATION';

interface ListeningTopicHubModalProps {
  contextId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPart: (part: PracticePartType, contextId: string, contextName: string) => void;
  onStartSession: (contextId: string, contextName: string) => void;
}

export function ListeningTopicHubModal({
  contextId,
  isOpen,
  onClose,
  onSelectPart,
  onStartSession,
}: ListeningTopicHubModalProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';

  const { data: contextDetail, isLoading } = useContextById(contextId || undefined);

  if (!isOpen || !contextId) return null;

  const contextTitle = contextDetail
    ? isVi
      ? contextDetail.name_vi || contextDetail.name_en
      : contextDetail.name_en
    : isVi
    ? 'Chủ đề luyện nghe'
    : 'Listening Topic';

  const contextDesc = contextDetail
    ? isVi
      ? contextDetail.description_vi || contextDetail.description || 'Luyện nghe các tình huống thực tế theo chủ đề'
      : contextDetail.description || 'Practice real-life listening scenarios under this topic'
    : '';

  const PARTS: Array<{
    id: PracticePartType;
    badge: string;
    iconName: string;
    titleVi: string;
    titleEn: string;
    descVi: string;
    descEn: string;
    accentColor: string;
  }> = [
    {
      id: 'PART_1',
      badge: 'Part 1',
      iconName: 'camera',
      titleVi: 'Mô tả tranh ảnh (Photographs)',
      titleEn: 'Photographs Description',
      descVi: 'Quan sát tranh thực tế và lắng nghe 4 phương án A, B, C, D để chọn miêu tả đúng nhất.',
      descEn: 'Look at real-life photos and listen to 4 statements (A, B, C, D) to select the best match.',
      accentColor: 'from-amber-500/15 to-amber-500/5 text-amber-500 border-amber-500/30',
    },
    {
      id: 'PART_2',
      badge: 'Part 2',
      iconName: 'help-circle',
      titleVi: 'Hỏi & Đáp (Question - Response)',
      titleEn: 'Question & Response Drills',
      descVi: 'Lắng nghe 1 câu hỏi/phát biểu và 3 phương án phản hồi để chọn câu trả lời logic nhất.',
      descEn: 'Listen to a question or statement and three responses, then pick the most suitable reply.',
      accentColor: 'from-blue-500/15 to-blue-500/5 text-blue-500 border-blue-500/30',
    },
    {
      id: 'PART_3',
      badge: 'Part 3',
      iconName: 'message-square',
      titleVi: 'Đoạn hội thoại (Conversations)',
      titleEn: 'Short Conversations',
      descVi: 'Lắng nghe hội thoại thực tế giữa 2-3 người và trả lời chùm 3 câu hỏi trắc nghiệm.',
      descEn: 'Listen to a dialogue between 2-3 people and answer a set of 3 comprehension questions.',
      accentColor: 'from-emerald-500/15 to-emerald-500/5 text-emerald-500 border-emerald-500/30',
    },
    {
      id: 'PART_4',
      badge: 'Part 4',
      iconName: 'volume-2',
      titleVi: 'Bài nói ngắn (Short Talks)',
      titleEn: 'Short Talks & Announcements',
      descVi: 'Lắng nghe độc thoại, thông báo công cộng hoặc tin tức và trả lời chùm 3 câu hỏi.',
      descEn: 'Listen to monologues, airport/office announcements, and answer 3 related questions.',
      accentColor: 'from-purple-500/15 to-purple-500/5 text-purple-500 border-purple-500/30',
    },
    {
      id: 'DICTATION',
      badge: 'Dictation',
      iconName: 'pen-tool',
      titleVi: 'Nghe chép chính tả (Dictation Drills)',
      titleEn: 'Dictation Audio Drills',
      descVi: 'Luyện tai phân tách âm và gõ chính xác từng từ còn thiếu theo từng phân đoạn âm thanh.',
      descEn: 'Sharpen your auditory discrimination by listening segment by segment and typing missing words.',
      accentColor: 'from-rose-500/15 to-rose-500/5 text-rose-500 border-rose-500/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-surface-subtle text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <Icon name="x" size={18} />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {isVi ? 'Chủ đề luyện tập' : 'Practice Topic'}
            </span>
            {contextDetail?.code && (
              <span className="rounded-full bg-surface-subtle px-2.5 py-0.5 text-xs font-mono text-text-tertiary">
                {contextDetail.code}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">
            {isLoading ? (isVi ? 'Đang tải chủ đề...' : 'Loading topic...') : contextTitle}
          </h2>
          {contextDesc && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {contextDesc}
            </p>
          )}
        </div>

        {/* Parts Selection Grid */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            {isVi ? 'Chọn định dạng bài tập bạn muốn luyện tập:' : 'Select an exercise format to practice:'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {PARTS.map((part) => (
              <Card
                key={part.id}
                className="group relative flex flex-col justify-between overflow-hidden border border-border bg-surface-subtle hover:bg-card hover:border-primary/40 hover:shadow-md transition-all rounded-2xl cursor-pointer"
                onClick={() => {
                  onSelectPart(part.id, contextId, contextTitle);
                  onClose();
                }}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br border ${part.accentColor}`}>
                        <Icon name={part.iconName} size={20} />
                      </div>
                      <span className="text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md bg-surface text-text-secondary border border-border">
                        {part.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                        {isVi ? part.titleVi : part.titleEn}
                      </h3>
                      <p className="mt-1 text-xs text-text-tertiary line-clamp-2 leading-relaxed">
                        {isVi ? part.descVi : part.descEn}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                    <span>{isVi ? 'Bắt đầu luyện' : 'Start drill'}</span>
                    <Icon name="arrowRight" size={14} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA: Random Session */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <Icon name="zap" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                {isVi ? 'Luyện phiên ngẫu nhiên theo chủ đề' : 'Random Topic Session'}
              </h4>
              <p className="text-xs text-text-secondary">
                {isVi
                  ? 'Bắt đầu phiên luyện tập bấm giờ 6-10 câu hỏi ngẫu nhiên thuộc chủ đề này'
                  : 'Start a timed practice session with random questions from this topic'}
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              onStartSession(contextId, contextTitle);
              onClose();
            }}
            className="shrink-0 rounded-xl cursor-pointer"
          >
            <Icon name="play" size={16} />
            {isVi ? 'Luyện ngẫu nhiên' : 'Start Session'}
          </Button>
        </div>
      </div>
    </div>
  );
}

