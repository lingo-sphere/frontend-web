/**
 * @file listening.part2.workspace.tsx
 * @description Workspace luyện tập Part 2: Question - Response (chuẩn TOEIC 3 lựa chọn A, B, C)
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon.map';
import { getOrGeneratePracticeAudio, resolveAudioUrl } from '@/utils/media.utils';
import type { Part2Item } from '../types/listening-practice';

interface ListeningPart2WorkspaceProps {
  question: Part2Item;
  onBack: () => void;
  onComplete?: (result: { selectedOption: string; isCorrect: boolean }) => void;
}

export function ListeningPart2Workspace({
  question,
  onBack,
  onComplete,
}: ListeningPart2WorkspaceProps) {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === 'vi';

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string>(() => resolveAudioUrl(question.audio_url));
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
    setShowTranscript(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }

    let isCancelled = false;
    async function initAudio() {
      const directResolved = resolveAudioUrl(question.audio_url);
      if (directResolved) {
        setAudioSrc(directResolved);
        return;
      }
      setIsLoadingAudio(true);
      const textToSpeak = `${question.transcript}. (A) ${question.options?.[0]?.text || ''}. (B) ${question.options?.[1]?.text || ''}. (C) ${question.options?.[2]?.text || ''}.`;
      const url = await getOrGeneratePracticeAudio(textToSpeak, question.audio_url, 'listening');
      if (!isCancelled && url) {
        setAudioSrc(resolveAudioUrl(url));
      }
      if (!isCancelled) {
        setIsLoadingAudio(false);
      }
    }
    initAudio();

    return () => {
      isCancelled = true;
    };
  }, [question._id, question.audio_url, question.transcript]);

  const togglePlayAudio = () => {
    if (!audioRef.current || !audioSrc) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('[ListeningPart2] Failed to play audio:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleSelectOption = (key: string) => {
    if (hasAnswered) return;
    setSelectedOption(key);
  };

  const handleSubmit = () => {
    if (!selectedOption || hasAnswered) return;
    setHasAnswered(true);
    setShowTranscript(true);

    const isCorrect = selectedOption.toUpperCase() === question.correct_answer.toUpperCase();
    if (onComplete) {
      onComplete({ selectedOption, isCorrect });
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    setShowTranscript(false);
  };

  const isUserCorrect =
    selectedOption?.toUpperCase() === question.correct_answer.toUpperCase();

  // Distractor reason for wrong answer
  const activeDistractor = question.distractors?.find(
    (d) => d.option_key.toUpperCase() === selectedOption?.toUpperCase(),
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <Icon name="arrowLeft" size={18} />
          {isVietnamese ? 'Quay lại danh sách' : 'Back to list'}
        </Button>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Part 2 • {question.question_type}
          </span>
          <span className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs font-medium text-text-secondary">
            {question.difficulty_level || 'MEDIUM'}
          </span>
        </div>
      </div>

      <Card className="dashboard-card overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Audio Player Panel */}
          <div className="rounded-2xl bg-surface-subtle border border-border p-5 text-center space-y-4">
            <audio
              ref={audioRef}
              src={audioSrc || undefined}
              preload="auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onError={() => setIsPlaying(false)}
            />

            <div className="flex flex-col items-center justify-center gap-3">
              <button
                onClick={togglePlayAudio}
                disabled={isLoadingAudio || !audioSrc}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                title={isPlaying ? 'Dừng audio' : 'Phát audio'}
              >
                <Icon name={isPlaying ? 'pause' : 'volume2'} size={28} />
              </button>
              <div className="text-sm font-medium text-text-primary">
                {isLoadingAudio
                  ? isVietnamese
                    ? 'Đang chuẩn bị âm thanh...'
                    : 'Preparing audio...'
                  : isPlaying
                  ? isVietnamese
                    ? 'Đang phát âm thanh...'
                    : 'Playing audio...'
                  : isVietnamese
                  ? 'Bấm để nghe câu hỏi và 3 đáp án'
                  : 'Click to listen to the question & options'}
              </div>
            </div>

            {/* Playback speed controls */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-xs text-text-tertiary">
                {isVietnamese ? 'Tốc độ:' : 'Speed:'}
              </span>
              {[0.75, 1.0, 1.25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleRateChange(speed)}
                  className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                    playbackRate === speed
                      ? 'bg-primary text-white'
                      : 'bg-surface text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Instruction */}
          <div className="text-center">
            <h3 className="text-base font-semibold text-text-primary">
              {isVietnamese
                ? 'Chọn câu trả lời phù hợp nhất (A, B hoặc C)'
                : 'Select the best response (A, B, or C)'}
            </h3>
            <p className="mt-1 text-xs text-text-tertiary">
              {isVietnamese
                ? 'Trong bài thi thật TOEIC Part 2, câu hỏi và đáp án sẽ không được in trên đề thi'
                : 'In real TOEIC Part 2, questions and responses are not printed'}
            </p>
          </div>

          {/* 3 Response Options */}
          <div className="space-y-3">
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt.key;
              const isCorrectAnswer =
                opt.key.toUpperCase() === question.correct_answer.toUpperCase();

              let containerStyle =
                'border-border hover:border-primary/50 hover:bg-surface-hover';
              let badgeStyle = 'bg-surface-subtle text-text-secondary';

              if (hasAnswered) {
                if (isCorrectAnswer) {
                  containerStyle = 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20';
                  badgeStyle = 'bg-emerald-600 text-white';
                } else if (isSelected && !isCorrectAnswer) {
                  containerStyle = 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20';
                  badgeStyle = 'bg-rose-600 text-white';
                } else {
                  containerStyle = 'border-border opacity-50';
                }
              } else if (isSelected) {
                containerStyle = 'border-primary bg-primary/5 ring-2 ring-primary/20';
                badgeStyle = 'bg-primary text-white';
              }

              return (
                <button
                  key={opt.key}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(opt.key)}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${containerStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-sm transition-colors ${badgeStyle}`}
                    >
                      {opt.key}
                    </span>
                    <div>
                      {/* Hiển thị text đáp án (trong luyện tập hoặc sau khi nộp) */}
                      <p className="text-sm font-medium text-text-primary">
                        {showTranscript || hasAnswered ? opt.text : `Đáp án (${opt.key})`}
                      </p>
                      {(showTranscript || hasAnswered) && opt.text_vi && (
                        <p className="mt-0.5 text-xs text-text-secondary">{opt.text_vi}</p>
                      )}
                    </div>
                  </div>

                  {hasAnswered && (
                    <div>
                      {isCorrectAnswer && (
                        <Icon name="checkCircle" className="text-emerald-500" size={20} />
                      )}
                      {isSelected && !isCorrectAnswer && (
                        <Icon name="xCircle" className="text-rose-500" size={20} />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          {!hasAnswered ? (
            <div className="flex justify-end pt-2">
              <Button
                disabled={!selectedOption}
                onClick={handleSubmit}
                className="gap-2 min-w-[140px]"
              >
                <Icon name="check" size={16} />
                {isVietnamese ? 'Kiểm tra' : 'Submit'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Result banner */}
              <div
                className={`rounded-xl p-4 flex items-start gap-3 border ${
                  isUserCorrect
                    ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200'
                    : 'border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200'
                }`}
              >
                <Icon
                  name={isUserCorrect ? 'checkCircle' : 'alertCircle'}
                  className={isUserCorrect ? 'text-emerald-600 mt-0.5' : 'text-rose-600 mt-0.5'}
                  size={20}
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    {isUserCorrect
                      ? isVietnamese
                        ? 'Chính xác! Bạn đã chọn phản hồi đúng.'
                        : 'Correct! You selected the right response.'
                      : isVietnamese
                      ? `Chưa chính xác! Đáp án đúng là: ${question.correct_answer}`
                      : `Incorrect! The correct response is: ${question.correct_answer}`}
                  </p>
                  {!isUserCorrect && activeDistractor && (
                    <p className="text-xs text-rose-700 dark:text-rose-300">
                      <strong>{isVietnamese ? 'Phân tích bẫy:' : 'Distractor Analysis:'}</strong>{' '}
                      {isVietnamese
                        ? activeDistractor.reason_vi || activeDistractor.reason
                        : activeDistractor.reason}
                    </p>
                  )}

                  {!isUserCorrect && (question.grammar_point_title || question.grammar_point_title_vi) && (
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-white/70 dark:bg-black/30 p-2.5 border border-rose-300/50 dark:border-rose-900/40">
                      <div className="flex items-center gap-2 text-xs text-text-primary">
                        <Icon name="book" size={15} className="text-primary" />
                        <span>
                          {isVietnamese ? 'Chủ điểm ngữ pháp cần ôn:' : 'Grammar Point to Review:'}{' '}
                          <strong className="text-primary">
                            {isVietnamese
                              ? question.grammar_point_title_vi || question.grammar_point_title
                              : question.grammar_point_title}
                          </strong>
                        </span>
                      </div>
                      <a
                        href={`/grammar?search=${encodeURIComponent(question.grammar_point_title || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline ml-3 shrink-0"
                      >
                        <span>{isVietnamese ? 'Học ngữ pháp này' : 'Review Grammar'}</span>
                        <Icon name="externalLink" size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Transcript & Explanation Card */}
              <div className="rounded-xl border border-border bg-surface-subtle p-4 space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider text-text-tertiary">
                    {isVietnamese ? 'Nội dung câu hỏi' : 'Question Transcript'}
                  </h4>
                  <p className="mt-1 font-medium text-text-primary">{question.transcript}</p>
                  {question.transcript_vi && (
                    <p className="text-xs text-text-secondary mt-0.5">{question.transcript_vi}</p>
                  )}
                </div>

                {(question.explanation || question.explanation_vi) && (
                  <div className="pt-2 border-t border-border">
                    <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wider text-text-tertiary">
                      {isVietnamese ? 'Giải thích đáp án' : 'Explanation'}
                    </h4>
                    <p className="mt-1 text-text-secondary text-xs leading-relaxed">
                      {isVietnamese
                        ? question.explanation_vi || question.explanation
                        : question.explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Reset / Next action */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <Icon name="refreshCw" size={16} />
                  {isVietnamese ? 'Luyện lại câu này' : 'Practice Again'}
                </Button>
                <Button onClick={onBack} className="gap-2">
                  {isVietnamese ? 'Chọn câu hỏi khác' : 'Next Question'}
                  <Icon name="arrowRight" size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

