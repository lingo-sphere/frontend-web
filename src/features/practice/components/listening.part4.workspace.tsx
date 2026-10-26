/**
 * @file listening.part4.workspace.tsx
 * @description Workspace luyện tập Part 4: Short Talks (chuẩn TOEIC 3 câu hỏi trắc nghiệm một người nói)
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/card';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon.map';
import { getOrGeneratePracticeAudio, resolveAudioUrl } from '@/utils/media.utils';
import type { Part4Item } from '../types/listening-practice';

interface ListeningPart4WorkspaceProps {
  talk: Part4Item;
  onBack: () => void;
  onComplete?: (result: { totalCorrect: number; totalQuestions: number; scorePercent: number }) => void;
}

export function ListeningPart4Workspace({
  talk,
  onBack,
  onComplete,
}: ListeningPart4WorkspaceProps) {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === 'vi';

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string>(() => resolveAudioUrl(talk.audio_url));
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setAnswers({});
    setHasAnswered(false);
    setShowTranscript(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }

    let isCancelled = false;
    async function initAudio() {
      const directResolved = resolveAudioUrl(talk.audio_url);
      if (directResolved) {
        setAudioSrc(directResolved);
        return;
      }
      setIsLoadingAudio(true);
      const url = await getOrGeneratePracticeAudio(talk.transcript, talk.audio_url, 'listening');
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
  }, [talk._id, talk.audio_url, talk.transcript]);

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
          console.warn('[ListeningPart4] Failed to play audio:', err);
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

  const handleSelectAnswer = (qIndex: number, key: string) => {
    if (hasAnswered) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: key }));
  };

  const calculateScore = () => {
    let correct = 0;
    talk.questions.forEach((q) => {
      const userAns = answers[q.question_index];
      if (userAns && userAns.toUpperCase() === q.correct_answer.toUpperCase()) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmit = () => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setShowTranscript(true);

    const correctCount = calculateScore();
    const totalQuestions = talk.questions.length;
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);

    if (onComplete) {
      onComplete({ totalCorrect: correctCount, totalQuestions, scorePercent });
    }
  };

  const handleReset = () => {
    setAnswers({});
    setHasAnswered(false);
    setShowTranscript(false);
  };

  const allAnswered = talk.questions.every((q) => answers[q.question_index]);
  const correctCount = calculateScore();
  const totalQuestions = talk.questions.length;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <Icon name="arrowLeft" size={18} />
          {isVietnamese ? 'Quay lại danh sách' : 'Back to list'}
        </Button>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Part 4 • {talk.talk_type}
          </span>
          <span className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs font-medium text-text-secondary">
            {talk.difficulty_level || 'MEDIUM'}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Audio Player Card */}
        <Card className="dashboard-card overflow-hidden">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  {isVietnamese && talk.title_vi ? talk.title_vi : talk.title}
                </h2>
                <div className="mt-1 flex items-center gap-3 text-xs text-text-secondary">
                  <span>
                    🎙️ {talk.speaker_name || (talk.speaker_gender === 'FEMALE' ? 'Female Speaker' : 'Male Speaker')}
                    {talk.speaker_role ? ` (${talk.speaker_role})` : ''}
                  </span>
                  <span>•</span>
                  <span>⏱️ {talk.duration_seconds}s</span>
                </div>
              </div>

              {/* Playback speed */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
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
                        : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Bar */}
            <div className="flex items-center gap-4 rounded-xl bg-surface-subtle border border-border p-3.5">
              <audio
                ref={audioRef}
                src={audioSrc || undefined}
                preload="auto"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onError={() => setIsPlaying(false)}
              />
              <button
                onClick={togglePlayAudio}
                disabled={isLoadingAudio || !audioSrc}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Icon name={isPlaying ? 'pause' : 'volume2'} size={22} />
              </button>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">
                  {isLoadingAudio
                    ? isVietnamese
                      ? 'Đang chuẩn bị âm thanh...'
                      : 'Preparing audio...'
                    : isPlaying
                    ? isVietnamese
                      ? 'Đang phát bài nói ngắn...'
                      : 'Playing short talk...'
                    : isVietnamese
                    ? 'Bấm để nghe bài nói ngắn'
                    : 'Click to play short talk audio'}
                </p>
                <p className="text-xs text-text-tertiary">
                  {isVietnamese
                    ? 'Lắng nghe kỹ để trả lời 3 câu hỏi trắc nghiệm bên dưới'
                    : 'Listen carefully to answer the 3 questions below'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {talk.questions.map((q, idx) => {
            const userAns = answers[q.question_index];
            const isCorrect = userAns?.toUpperCase() === q.correct_answer.toUpperCase();

            return (
              <Card key={idx} className="dashboard-card">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-xs font-bold text-text-secondary">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">
                          {q.question_text}
                        </h4>
                        {q.question_text_vi && (
                          <p className="mt-0.5 text-xs text-text-secondary">{q.question_text_vi}</p>
                        )}
                      </div>
                    </div>

                    {hasAnswered && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
                        }`}
                      >
                        <Icon name={isCorrect ? 'checkCircle' : 'xCircle'} size={14} />
                        {isCorrect ? (isVietnamese ? 'Đúng' : 'Correct') : (isVietnamese ? 'Sai' : 'Incorrect')}
                      </span>
                    )}
                  </div>

                  {/* 4 Options */}
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {q.options.map((opt) => {
                      const isSelected = userAns === opt.key;
                      const isCorrectOpt = opt.key.toUpperCase() === q.correct_answer.toUpperCase();

                      let btnStyle = 'border-border hover:border-primary/50 hover:bg-surface-hover';
                      let badgeStyle = 'bg-surface-subtle text-text-secondary';

                      if (hasAnswered) {
                        if (isCorrectOpt) {
                          btnStyle = 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20';
                          badgeStyle = 'bg-emerald-600 text-white';
                        } else if (isSelected && !isCorrectOpt) {
                          btnStyle = 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20';
                          badgeStyle = 'bg-rose-600 text-white';
                        } else {
                          btnStyle = 'border-border opacity-50';
                        }
                      } else if (isSelected) {
                        btnStyle = 'border-primary bg-primary/5 ring-1 ring-primary/30';
                        badgeStyle = 'bg-primary text-white';
                      }

                      return (
                        <button
                          key={opt.key}
                          disabled={hasAnswered}
                          onClick={() => handleSelectAnswer(q.question_index, opt.key)}
                          className={`flex items-start gap-2.5 rounded-xl border p-3 text-left text-sm transition-all ${btnStyle}`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded font-bold text-xs ${badgeStyle}`}
                          >
                            {opt.key}
                          </span>
                          <span className="flex-1 font-medium text-text-primary text-xs leading-relaxed">
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {hasAnswered && (q.explanation || q.explanation_vi) && (
                    <div className="rounded-lg bg-surface-subtle p-3 text-xs text-text-secondary border border-border">
                      <strong className="text-text-primary">
                        {isVietnamese ? 'Giải thích:' : 'Explanation:'}
                      </strong>{' '}
                      {isVietnamese ? q.explanation_vi || q.explanation : q.explanation}
                    </div>
                  )}

                  {/* Grammar Remedial Link when wrong */}
                  {hasAnswered && !isCorrect && (q.grammar_point_title || q.grammar_point_title_vi) && (
                    <div className="flex items-center justify-between rounded-lg bg-rose-50/70 dark:bg-rose-950/30 p-2.5 border border-rose-200 dark:border-rose-900/50">
                      <div className="flex items-center gap-2 text-xs text-text-primary">
                        <Icon name="book" size={15} className="text-primary shrink-0" />
                        <span>
                          {isVietnamese ? 'Ngữ pháp liên quan:' : 'Related Grammar:'}{' '}
                          <strong className="text-primary">
                            {isVietnamese
                              ? q.grammar_point_title_vi || q.grammar_point_title
                              : q.grammar_point_title}
                          </strong>
                        </span>
                      </div>
                      <a
                        href={`/grammar?search=${encodeURIComponent(q.grammar_point_title || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline ml-2 shrink-0"
                      >
                        <span>{isVietnamese ? 'Học lại ngữ pháp' : 'Review'}</span>
                        <Icon name="externalLink" size={12} />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Panel */}
        {!hasAnswered ? (
          <div className="flex justify-end pt-2">
            <Button
              disabled={!allAnswered}
              onClick={handleSubmit}
              className="gap-2 min-w-[150px]"
            >
              <Icon name="check" size={16} />
              {isVietnamese ? 'Nộp bài (3 câu)' : 'Submit Answers'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Score Banner */}
            <div className="flex items-center justify-between rounded-2xl bg-surface-subtle border border-border p-6">
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  {isVietnamese ? 'Kết quả làm bài' : 'Session Result'}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {isVietnamese
                    ? `Bạn đã trả lời đúng ${correctCount}/${totalQuestions} câu hỏi.`
                    : `You answered ${correctCount}/${totalQuestions} questions correctly.`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-primary">
                  {Math.round((correctCount / totalQuestions) * 100)}%
                </span>
              </div>
            </div>

            {/* Transcript Card */}
            {talk.transcript && (
              <Card className="dashboard-card">
                <CardContent className="p-5 space-y-3">
                  <h4 className="font-semibold text-sm text-text-primary">
                    📜 {isVietnamese ? 'Bản ghi bài nói (Transcript)' : 'Short Talk Transcript'}
                  </h4>
                  <div className="rounded-xl bg-surface-subtle p-4 font-mono text-xs leading-relaxed text-text-secondary whitespace-pre-line border border-border">
                    {talk.transcript}
                  </div>
                  {talk.transcript_vi && (
                    <div className="rounded-xl bg-surface-subtle p-4 text-xs leading-relaxed text-text-secondary whitespace-pre-line border border-border">
                      <strong className="text-text-primary block mb-1">
                        {isVietnamese ? 'Bản dịch tiếng Việt:' : 'Vietnamese Translation:'}
                      </strong>
                      {talk.transcript_vi}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <Icon name="refreshCw" size={16} />
                {isVietnamese ? 'Luyện lại bài nói này' : 'Practice Again'}
              </Button>
              <Button onClick={onBack} className="gap-2">
                {isVietnamese ? 'Chọn bài khác' : 'Next Exercise'}
                <Icon name="arrowRight" size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

