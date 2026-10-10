import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Layers, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/card";
import { Button } from "@/components/button";
import type { WritingSubmission } from "@/features/practice/types/writing";

// Backend AI evaluation returns scores on a 0-100 scale. Defensive clamp so
// any bad/outlier score never flips the color band or breaks the bar width.
const clampPercent = (n: number) =>
  Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;

interface WritingEvaluationCardProps {
  submission: WritingSubmission;
  onStartScaffoldedRewrite?: () => void;
  onViewComparison?: () => void;
}

interface CriterionConfig {
  key: string;
  labelVi: string;
  labelEn: string;
  score: number;
  descriptionVi: string;
  descriptionEn: string;
}

export function WritingEvaluationCard({
  submission,
  onStartScaffoldedRewrite,
  onViewComparison,
}: WritingEvaluationCardProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === "vi";

  const criteria: CriterionConfig[] = [
    {
      key: "task_achievement",
      labelVi: "Task Achievement (Đáp ứng đề bài)",
      labelEn: "Task Achievement",
      score: clampPercent(submission.task_achievement_score ?? submission.overall_score ?? 0),
      descriptionVi:
        "Mức độ trả lời đầy đủ các yêu cầu và triển khai ý của đề bài.",
      descriptionEn: "How well the response addresses all parts of the task.",
    },
    {
      key: "grammatical_accuracy",
      labelVi: "Grammar Accuracy (Độ chính xác ngữ pháp)",
      labelEn: "Grammatical Accuracy",
      score: clampPercent(submission.grammatical_accuracy_score ?? 0),
      descriptionVi:
        "Độ chuẩn xác về thì, cấu trúc câu và sự hòa hợp ngữ pháp.",
      descriptionEn:
        "Grammar correctness, structure variety, and sentence boundaries.",
    },
    {
      key: "lexical_resource",
      labelVi: "Lexical Resource (Vốn từ vựng)",
      labelEn: "Lexical Resource",
      score: clampPercent(submission.lexical_resource_score ?? 0),
      descriptionVi:
        "Sử dụng từ vựng phong phú, collocations và đúng ngữ cảnh.",
      descriptionEn: "Range and precision of vocabulary and collocations used.",
    },
    {
      key: "coherence",
      labelVi: "Coherence & Cohesion (Tính mạch lạc)",
      labelEn: "Coherence & Cohesion",
      score: clampPercent(submission.coherence_score ?? 0),
      descriptionVi: "Tổ chức đoạn văn, liên kết ý và sử dụng từ nối mượt mà.",
      descriptionEn: "Logical structuring, paragraphing, and linking devices.",
    },
    {
      key: "naturalness",
      labelVi: "Naturalness (Độ tự nhiên của diễn đạt)",
      labelEn: "Naturalness",
      score:
        submission.naturalness_score ??
        Math.min(
          100,
          Math.round(
            ((submission.overall_score ?? 60) +
              (submission.lexical_resource_score ?? 60)) /
              2
          )
        ),
      descriptionVi: "Độ tự nhiên và diễn đạt trôi chảy như người bản xứ.",
      descriptionEn: "How natural, idiomatic, and fluent the expression feels.",
    },
    {
      key: "register",
      labelVi: "Register / Appropriateness (Văn phong phù hợp)",
      labelEn: "Register & Appropriateness",
      score:
        submission.register_score ??
        Math.min(
          100,
          Math.round(
            ((submission.overall_score ?? 65) +
              (submission.task_achievement_score ?? 65)) /
              2
          )
        ),
      descriptionVi:
        "Sử dụng đúng văn phong trang trọng (formal) hoặc thân mật (informal).",
      descriptionEn:
        "Suitability of tone, register, and format for the given context.",
    },
  ];

  const getScoreColorClass = (score: number) => {
    if (score >= 70)
      return {
        bar: "bg-emerald-500",
        text: "text-emerald-700 dark:text-emerald-400",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    if (score >= 60)
      return {
        bar: "bg-amber-500",
        text: "text-amber-700 dark:text-amber-400",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
      };
    return {
      bar: "bg-rose-500",
      text: "text-rose-700 dark:text-rose-400",
      badge: "bg-rose-50 text-rose-700 border-rose-200",
    };
  };

  const overallScore = clampPercent(submission.overall_score ?? 0);
  const isLowScore = overallScore < 60;
  const isV2 = Boolean(submission.parent_submission_id);
  const scaffoldTemplate = submission.ai_evaluation?.scaffold_template;

  return (
    <div className="space-y-6">
      {/* 6 CRITERIA DETAIL CARD */}
      <Card className="border border-border/80 bg-surface shadow-xs">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                {isVi
                  ? "Đánh giá chi tiết 6 Tiêu chí (IELTS & TOEIC Standards)"
                  : "Detailed 6 Criteria Evaluation"}
              </h3>
              <p className="text-xs text-text-tertiary">
                {isVi
                  ? "Hệ thống đo lường tự động bởi AI với các mốc chuẩn quốc tế"
                  : "Automated AI measurement based on standard writing rubrics"}
              </p>
            </div>
            <span className="text-xs font-medium text-text-secondary bg-surface-subtle px-2.5 py-1 rounded-full border border-border">
              Thang điểm 0 - 100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criteria.map((crit) => {
              const colors = getScoreColorClass(crit.score);
              return (
                <div
                  key={crit.key}
                  className="rounded-xl border border-border/60 bg-surface-subtle/50 p-4 transition-all hover:border-border"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-text-primary">
                      {isVi ? crit.labelVi : crit.labelEn}
                    </span>
                    <span className={`text-sm font-bold ${colors.text}`}>
                      {crit.score}
                      <span className="text-xs font-normal text-text-tertiary">
                        /100
                      </span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border/40">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${colors.bar}`}
                      style={{
                        width: `${Math.max(4, Math.min(100, crit.score))}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                    {isVi ? crit.descriptionVi : crit.descriptionEn}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SCAFFOLDED REWRITE RECOMMENDATION CARD (IMAGE 2) */}
      {(isLowScore || scaffoldTemplate || isV2) && (
        <Card
          className={`border-2 transition-all ${
            isV2
              ? "border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20"
              : isLowScore
              ? "border-indigo-300 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-surface dark:from-indigo-950/30 dark:via-purple-950/20"
              : "border-border bg-surface-subtle"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      isV2
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : isLowScore
                        ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isV2
                      ? isVi
                        ? "Phiên bản viết lại (V2)"
                        : "Scaffolded Rewrite (V2)"
                      : isLowScore
                      ? isVi
                        ? "Đề xuất AI: Viết lại có hướng dẫn"
                        : "AI Recommendation: Scaffolded Rewrite"
                      : isVi
                      ? "Khung hướng dẫn mở rộng"
                      : "Guided Scaffold Template"}
                  </span>
                  {isLowScore && !isV2 && (
                    <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Điểm &lt; 60
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-bold text-text-primary">
                  {isV2
                    ? isVi
                      ? "Bạn đã hoàn thành phiên bản viết lại có khung sườn!"
                      : "You completed the scaffolded rewrite!"
                    : isVi
                    ? "Luyện viết lại với Khung sườn thông minh (Scaffolded Rewrite)"
                    : "Practice with AI Scaffolded Rewrite"}
                </h4>

                <p className="text-sm text-text-secondary leading-relaxed">
                  {isV2
                    ? isVi
                      ? "Xem so sánh chi tiết giữa phiên bản V1 và V2 để nhận thấy sự tiến bộ rõ rệt trên từng tiêu chí."
                      : "Review the side-by-side comparison between V1 and V2 to see your improvement across all criteria."
                    : isVi
                    ? "Hệ thống đã phân tích các điểm còn thiếu trong bài viết và tạo sẵn bộ khung sườn theo từng khối (Mở bài, Thân bài, Kết luận), câu hỏi gợi ý và mẫu câu bắt đầu giúp bạn tự nâng cấp bài viết lên phiên bản V2 hoàn hảo hơn."
                    : "AI has structured this exercise into guided blocks with prompts and sentence starters so you can rewrite a superior V2 version step-by-step."}
                </p>
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                {isV2 && onViewComparison && (
                  <Button
                    onClick={onViewComparison}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isVi
                      ? "Xem so sánh tiến bộ (V1 vs V2)"
                      : "View Progress Comparison"}
                  </Button>
                )}

                {onStartScaffoldedRewrite && (
                  <Button
                    onClick={onStartScaffoldedRewrite}
                    className="gap-2 bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary-hover text-white font-medium px-5 py-2.5 shadow-sm transition-all"
                  >
                    <Layers className="h-4 w-4" />
                    {isVi
                      ? "Luyện viết theo Khung sườn"
                      : "Start Scaffolded Rewrite"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
