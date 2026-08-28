import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/dashboard/SectionHeading";
import { Icon } from "@/components/icons/icon-map";
import {
  listeningExercises,
  getExerciseById,
  getLastAttempt,
  getInProgressAttempt,
  getRecommendedExercises,
  getContinueListening,
  getSegmentIndexAtTime,
  validateListeningExercise,
  formatDuration,
  getDifficultyColor,
  getExerciseTypeLabel,
  getTopicById,
} from "@/data/listening-data";
import {
  checkBlankAnswer,
  calculateAttemptScore,
  type ListeningExercise,
  type ListeningAttempt,
  type TranscriptSegment,
  type Blank,
} from "@/types/listening";

type ViewMode = "list" | "exercise" | "result" | "review";

interface UserAnswers {
  [blankId: string]: string;
}

interface HintRevealedCount {
  [blankId: string]: number;
}

interface CheckedBlankResult {
  blankId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface CheckedResults {
  [blankId: string]: CheckedBlankResult;
}

function calculateDisplayText(
  answer: string,
  userInput: string,
  hintCount: number
): string {
  const answerLength = answer.length;
  const userInputLength = userInput.length;

  const revealedPrefix = answer.slice(0, hintCount);

  const userTypedPart = userInput.slice(hintCount);

  const totalShown = Math.max(userInputLength, hintCount);
  const remainingStars = Math.max(0, answerLength - totalShown);

  let display = revealedPrefix + userTypedPart;
  if (remainingStars > 0) {
    display += "*".repeat(remainingStars);
  }

  return display;
}

function hasEnoughCharacters(blank: Blank, userAnswer: string): boolean {
  return userAnswer.length >= blank.answer.length;
}

function areAllBlanksReady(blanks: Blank[], userAnswers: UserAnswers): boolean {
  return blanks.every((blank) => {
    const userAnswer = userAnswers[blank.id] || "";
    return hasEnoughCharacters(blank, userAnswer);
  });
}

function findHintableBlank(
  blanks: Blank[],
  hintCounts: HintRevealedCount
): Blank | undefined {
  return blanks.find((blank) => {
    const hintCount = hintCounts[blank.id] || 0;
    return hintCount < blank.answer.length;
  });
}

function getSegmentHintCount(
  blanks: Blank[],
  hintCounts: HintRevealedCount
): number {
  return blanks.reduce((sum, blank) => sum + (hintCounts[blank.id] || 0), 0);
}

function checkBlank(blank: Blank, userAnswer: string): CheckedBlankResult {
  const isCorrect =
    userAnswer.toLowerCase().trim() === blank.answer.toLowerCase().trim();
  return {
    blankId: blank.id,
    userAnswer: userAnswer,
    correctAnswer: blank.answer,
    isCorrect,
  };
}

export function ListeningPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedExercise, setSelectedExercise] =
    useState<ListeningExercise | null>(null);
  const [selectedAttempt, setSelectedAttempt] =
    useState<ListeningAttempt | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedMediaType, setSelectedMediaType] = useState<string>("all");

  const filteredExercises = listeningExercises.filter((exercise) => {
    const matchesSearch =
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === "all" ||
      exercise.difficultyLevel === selectedDifficulty;
    const matchesMediaType =
      selectedMediaType === "all" || exercise.mediaType === selectedMediaType;
    return matchesSearch && matchesDifficulty && matchesMediaType;
  });

  const continueListening = getContinueListening();
  const recommended = getRecommendedExercises();

  const handleSelectExercise = (exercise: ListeningExercise) => {

    const { valid, errors } = validateListeningExercise(exercise);
    if (!valid) {
      console.error("Exercise validation failed:", errors);
    }

    setSelectedExercise(exercise);
    const inProgress = getInProgressAttempt(exercise.id);
    setSelectedAttempt(inProgress || null);
    setViewMode("exercise");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedExercise(null);
    setSelectedAttempt(null);
  };

  if (viewMode === "exercise" && selectedExercise) {
    return (
      <VideoDictationView
        exercise={selectedExercise}
        existingAttempt={selectedAttempt}
        onBack={handleBackToList}
        onComplete={(attempt) => {
          setSelectedAttempt(attempt);
          setViewMode("result");
        }}
      />
    );
  }

  if (viewMode === "result" && selectedExercise && selectedAttempt) {
    return (
      <ResultView
        exercise={selectedExercise}
        attempt={selectedAttempt}
        onBack={handleBackToList}
        onReview={() => setViewMode("review")}
        onRetry={() => {
          setSelectedAttempt(null);
          setViewMode("exercise");
        }}
      />
    );
  }

  if (viewMode === "review" && selectedExercise && selectedAttempt) {
    return (
      <ReviewView
        exercise={selectedExercise}
        attempt={selectedAttempt}
        onBack={() => setViewMode("result")}
        onContinue={handleBackToList}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <SectionHeading
        eyebrow={t('listening.title')}
        title={isVietnamese ? 'Luyện nghe' : 'Practice Listening'}
        description={isVietnamese ? 'Cải thiện kỹ năng nghe với các bài luyện tập đa dạng' : 'Improve listening skills with various exercises'}
      />

      {continueListening.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-text-primary flex items-center gap-2">
            <Icon name="play-circle" className="text-primary" size={20} />
            {isVietnamese ? 'Tiếp tục luyện nghe' : 'Continue Listening'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {continueListening.map((attempt) => {
              const exercise = getExerciseById(attempt.exerciseId);
              if (!exercise) return null;
              return (
                <ContinueCard
                  key={attempt.id}
                  exercise={exercise}
                  attempt={attempt}
                  onClick={() => handleSelectExercise(exercise)}
                  isVietnamese={isVietnamese}
                />
              );
            })}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-text-primary flex items-center gap-2">
          <Icon name="star" className="text-warning" size={20} />
          {isVietnamese ? 'Đề xuất cho bạn' : 'Recommended for you'}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={() => handleSelectExercise(exercise)}
              isVietnamese={isVietnamese}
            />
          ))}
        </div>
      </section>

      <section className="mb-6">
        <div className="relative mb-4">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            size={18}
          />
          <Input
            placeholder={isVietnamese ? 'Tìm kiếm bài luyện...' : 'Search exercises...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-surface-subtle border-0"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <FilterChip
            active={selectedDifficulty === "all"}
            onClick={() => setSelectedDifficulty("all")}
          >
            {isVietnamese ? 'Tất cả' : 'All'}
          </FilterChip>
          <FilterChip
            active={selectedDifficulty === "EASY"}
            onClick={() => setSelectedDifficulty("EASY")}
            color="success"
          >
            {isVietnamese ? 'Dễ' : 'Easy'}
          </FilterChip>
          <FilterChip
            active={selectedDifficulty === "MEDIUM"}
            onClick={() => setSelectedDifficulty("MEDIUM")}
            color="warning"
          >
            {isVietnamese ? 'Trung bình' : 'Medium'}
          </FilterChip>
          <FilterChip
            active={selectedDifficulty === "HARD"}
            onClick={() => setSelectedDifficulty("HARD")}
            color="error"
          >
            {isVietnamese ? 'Khó' : 'Hard'}
          </FilterChip>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={selectedMediaType === "AUDIO"}
            onClick={() => setSelectedMediaType("AUDIO")}
          >
            <Icon name="headphones" size={14} /> Audio
          </FilterChip>
          <FilterChip
            active={selectedMediaType === "VIDEO"}
            onClick={() => setSelectedMediaType("VIDEO")}
          >
            <Icon name="video" size={14} /> Video
          </FilterChip>
          {selectedMediaType !== "all" && (
            <FilterChip
              active={false}
              onClick={() => setSelectedMediaType("all")}
            >
              Tất cả
            </FilterChip>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-text-primary flex items-center gap-2">
          <Icon name="library" className="text-primary" size={20} />
          {isVietnamese ? 'Thư viện luyện nghe' : 'Exercise Library'}
          <span className="text-sm font-normal text-text-secondary ml-2">
            ({filteredExercises.length} {isVietnamese ? 'bài' : 'exercises'})
          </span>
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={() => handleSelectExercise(exercise)}
              isVietnamese={isVietnamese}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  color,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  color?: "success" | "warning" | "error";
}) {
  const colorClass = color
    ? color === "success"
      ? "text-success"
      : color === "warning"
      ? "text-warning"
      : "text-error"
    : "";

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
        ${
          active
            ? "bg-primary text-white"
            : "bg-surface-subtle text-text-secondary hover:bg-surface-hover"
        }
        ${colorClass}
      `}
    >
      {children}
    </button>
  );
}

function ExerciseCard({
  exercise,
  onClick,
  isVietnamese,
}: {
  exercise: ListeningExercise;
  onClick: () => void;
  isVietnamese: boolean;
}) {
  const lastAttempt = getLastAttempt(exercise.id);
  const topic = getTopicById(exercise.topicId);
  const diffClass = getDifficultyColor(exercise.difficultyLevel);

  return (
    <Card
      className="dashboard-card cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-4">

        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                exercise.mediaType === "VIDEO"
                  ? "bg-info-soft text-info"
                  : "bg-primary-soft text-primary"
              }`}
            >
              <Icon
                name={exercise.mediaType === "VIDEO" ? "video" : "headphones"}
                size={20}
              />
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${diffClass}`}>
              {exercise.cefrLevel}
            </span>
          </div>
          <span className="text-xs px-2 py-1 bg-surface-subtle rounded text-text-secondary">
            {getExerciseTypeLabel(exercise.exerciseType)}
          </span>
        </div>

        <h4 className="font-semibold text-text-primary mb-1 line-clamp-1">
          {exercise.title}
        </h4>
        <p className="text-xs text-text-secondary mb-3 line-clamp-2">
          {exercise.description}
        </p>

        <div className="flex items-center gap-3 text-xs text-text-tertiary mb-3">
          <span className="flex items-center gap-1">
            <Icon name="clock" size={12} />
            {formatDuration(exercise.durationSeconds)}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="list" size={12} />
            {exercise.segments.length} câu
          </span>
          {topic && (
            <span className="flex items-center gap-1">
              <Icon name="tag" size={12} />
              {topic.name}
            </span>
          )}
        </div>

        {lastAttempt && (
          <div className="flex items-center gap-2 p-2 bg-surface-subtle rounded-lg mb-3">
            <div className="flex-1">
              <div className="text-xs text-text-tertiary">{isVietnamese ? 'Lần trước' : 'Last attempt'}</div>
              <div className="text-sm font-medium text-text-primary">
                {lastAttempt.accuracy}% {isVietnamese ? 'đúng' : 'correct'}
              </div>
            </div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                (lastAttempt.accuracy || 0) >= 80
                  ? "bg-success-soft text-success"
                  : (lastAttempt.accuracy || 0) >= 50
                  ? "bg-warning-soft text-warning"
                  : "bg-error-soft text-error"
              }`}
            >
              {lastAttempt.accuracy || 0}%
            </div>
          </div>
        )}

        <Button
          className={`w-full ${
            lastAttempt
              ? "bg-surface-hover hover:bg-surface-subtle text-text-primary"
              : "bg-primary hover:bg-primary-hover text-white"
          }`}
        >
          {lastAttempt ? (isVietnamese ? "Luyện lại" : "Retry") : (isVietnamese ? "Bắt đầu" : "Start")}
          <Icon name="arrow-right" size={16} />
        </Button>
      </CardContent>
    </Card>
  );
}

function ContinueCard({
  exercise,
  attempt,
  onClick,
  isVietnamese,
}: {
  exercise: ListeningExercise;
  attempt: ListeningAttempt;
  onClick: () => void;
  isVietnamese: boolean;
}) {
  const progress = attempt.segmentAnswers.length;
  const total = exercise.segments.length;

  return (
    <Card
      className="dashboard-card cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg bg-primary-5 border-primary"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="play-circle" className="text-primary" size={18} />
          <span className="text-xs font-medium text-primary">{isVietnamese ? 'Đang dở' : 'In Progress'}</span>
        </div>
        <h4 className="font-semibold text-text-primary mb-1">
          {exercise.title}
        </h4>
        <p className="text-sm text-text-secondary mb-3">
          {isVietnamese ? 'Câu' : 'Question'} {progress + 1} / {total}
        </p>
        <div className="h-1.5 bg-primary-20 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
        <Button className="w-full bg-primary hover:bg-primary-hover text-white">
          <Icon name="play" size={16} />
          {isVietnamese ? 'Tiếp tục' : 'Continue'}
        </Button>
      </CardContent>
    </Card>
  );
}

function VideoDictationView({
  exercise,
  existingAttempt,
  onBack,
  onComplete,
}: {
  exercise: ListeningExercise;
  existingAttempt: ListeningAttempt | null;
  onBack: () => void;
  onComplete: (attempt: ListeningAttempt) => void;
}) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(
    existingAttempt?.currentTime || 0
  );
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [autoPause, setAutoPause] = useState(true);

  const activeSegmentIndex = useMemo(
    () => getSegmentIndexAtTime(currentTime, exercise.segments),
    [currentTime, exercise.segments]
  );

  const [completedSegments, setCompletedSegments] = useState<Set<string>>(
    () => {
      const result = new Set<string>();
      if (existingAttempt) {
        existingAttempt.segmentAnswers.forEach((segAns) => {
          result.add(segAns.segmentId);
        });
      }
      return result;
    }
  );

  const [answers, setAnswers] = useState<UserAnswers>(() => {
    const result: UserAnswers = {};
    if (existingAttempt) {
      existingAttempt.segmentAnswers.forEach((segAns) => {
        segAns.blankResults.forEach((blankRes) => {
          result[blankRes.blankId] = blankRes.userAnswer;
        });
      });
    }
    return result;
  });

  const [hintRevealedCount, setHintRevealedCount] = useState<HintRevealedCount>(
    () => {
      const result: HintRevealedCount = {};
      if (existingAttempt) {
        existingAttempt.segmentAnswers.forEach((segAns) => {
          segAns.blankResults.forEach((blankRes) => {
            if (blankRes.isHintUsed) {
              result[blankRes.blankId] = 1;
            }
          });
        });
      }
      return result;
    }
  );

  const [replayCount, setReplayCount] = useState(
    existingAttempt?.totalReplays || 0
  );
  const [totalHintsUsed, setTotalHintsUsed] = useState(
    existingAttempt?.totalHintsUsed || 0
  );

  const [checkedResults, setCheckedResults] = useState<CheckedResults>({});

  const [correctedAnswers, setCorrectedAnswers] = useState<
    Record<string, string>
  >({});

  const segmentStartTimeRef = useRef<number>(Date.now());

  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const currentSegment = exercise.segments[activeSegmentIndex];

  const isCurrentSegmentCompleted = currentSegment
    ? completedSegments.has(currentSegment.id)
    : false;

  const isBlankFilled = (blank: Blank, userAnswer: string): boolean => {
    return userAnswer.length >= blank.answer.length;
  };

  const canSubmitCurrentSegment = currentSegment
    ? currentSegment.blanks.every((blank) => {
        const userAnswer = answers[blank.id] || "";
        return isBlankFilled(blank, userAnswer);
      })
    : false;

  const hasViewedCurrentResult = currentSegment
    ? checkedResults[currentSegment.blanks[0]?.id] !== undefined
    : false;

  const allSegmentsCompleted =
    completedSegments.size === exercise.segments.length;

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1 * playbackSpeed;

        if (autoPause && currentSegment) {
          if (next >= currentSegment.endTime) {
            setIsPlaying(false);
            return currentSegment.endTime;
          }
        }

        if (next >= exercise.durationSeconds) {
          setIsPlaying(false);
          return exercise.durationSeconds;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    playbackSpeed,
    autoPause,
    currentSegment,
    exercise.durationSeconds,
  ]);

  useEffect(() => {
    const segmentEl = segmentRefs.current[currentSegment?.id || ""];
    if (segmentEl) {
      segmentEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    segmentStartTimeRef.current = Date.now();
  }, [activeSegmentIndex]);

  const togglePlayback = () => setIsPlaying(!isPlaying);

  const replaySegment = () => {
    if (!currentSegment || isCurrentSegmentCompleted) return;
    setReplayCount((prev) => prev + 1);
    setCurrentTime(currentSegment.startTime);
    setIsPlaying(true);
  };

  const replayPreviousSegment = () => {
    if (activeSegmentIndex <= 0) return;
    const prevSegment = exercise.segments[activeSegmentIndex - 1];
    setCurrentTime(prevSegment.startTime);
    setIsPlaying(true);
  };

  const handleHint = () => {
    if (!currentSegment || isCurrentSegmentCompleted) return;

    const hintableBlank = findHintableBlank(
      currentSegment.blanks,
      hintRevealedCount
    );

    if (hintableBlank) {
      const currentRevealed = hintRevealedCount[hintableBlank.id] || 0;
      setHintRevealedCount((prev) => ({
        ...prev,
        [hintableBlank.id]: currentRevealed + 1,
      }));
      setTotalHintsUsed((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (!currentSegment) return;

    if (!hasViewedCurrentResult) {
      const newCheckedResults: CheckedResults = {};
      currentSegment.blanks.forEach((blank) => {
        const userAnswer = answers[blank.id] || "";
        newCheckedResults[blank.id] = checkBlank(blank, userAnswer);
      });
      setCheckedResults(newCheckedResults);
      return;
    }

    const newCorrected: Record<string, string> = {};
    currentSegment.blanks.forEach((blank) => {
      const result = checkedResults[blank.id];
      if (result && !result.isCorrect) {
        newCorrected[blank.id] = result.correctAnswer;
      }
    });
    setCorrectedAnswers((prev) => ({ ...prev, ...newCorrected }));

    setCompletedSegments((prev) => {
      const next = new Set(prev);
      next.add(currentSegment.id);
      return next;
    });

    if (activeSegmentIndex === exercise.segments.length - 1) {

      const segmentAnswers = exercise.segments.map((seg) => {
        const blankResults = seg.blanks.map((blank) => {
          const userAnswer = answers[blank.id] || "";
          const hintCount = hintRevealedCount[blank.id] || 0;
          const result = checkBlank(blank, userAnswer);
          return {
            blankId: blank.id,
            userAnswer,
            isCorrect: result.isCorrect,
            isHintUsed: hintCount > 0,
          };
        });

        return {
          segmentId: seg.id,
          completedAt: new Date().toISOString(),
          blankResults,
          timeSpentSeconds:
            seg.id === currentSegment.id
              ? Math.round((Date.now() - segmentStartTimeRef.current) / 1000)
              : 0,
          replayCount: 0,
        };
      });

      const { totalCorrectBlanks, totalBlanks, accuracy } =
        calculateAttemptScore(segmentAnswers);

      const attempt: ListeningAttempt = {
        id: `attempt-${Date.now()}`,
        exerciseId: exercise.id,
        userId: "user-001",
        status: "COMPLETED",
        currentSegmentIndex: activeSegmentIndex,
        currentTime,
        startedAt: existingAttempt?.startedAt || new Date().toISOString(),
        completedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        segmentAnswers,
        totalHintsUsed,
        totalReplays: replayCount,
        totalTimeSeconds: Math.round(
          (Date.now() -
            new Date(existingAttempt?.startedAt || Date.now()).getTime()) /
            1000
        ),
        score: accuracy,
        totalCorrectBlanks,
        totalBlanks,
        accuracy,
      };

      onComplete(attempt);
    } else {

      const nextSegment = exercise.segments[activeSegmentIndex + 1];
      setCurrentTime(nextSegment.startTime);
      setCheckedResults({});
      if (!autoPause) setIsPlaying(true);
    }
  };

  const goToSegment = (index: number) => {
    if (index < 0 || index >= exercise.segments.length) return;
    const segment = exercise.segments[index];

    if (
      index > activeSegmentIndex &&
      !completedSegments.has(exercise.segments[index - 1]?.id || "")
    ) {
      return;
    }

    setCurrentTime(segment.startTime);
    setIsPlaying(false);

    if (completedSegments.has(segment.id)) {
      const results: CheckedResults = {};
      segment.blanks.forEach((blank) => {
        const userAnswer = answers[blank.id] || "";
        results[blank.id] = checkBlank(blank, userAnswer);
      });
      setCheckedResults(results);

      const corrected: Record<string, string> = {};
      segment.blanks.forEach((blank) => {
        if (correctedAnswers[blank.id]) {
          corrected[blank.id] = correctedAnswers[blank.id];
        }
      });
      if (Object.keys(corrected).length > 0) {
        setCorrectedAnswers((prev) => ({ ...prev, ...corrected }));
      }
    } else {
      setCheckedResults({});
    }
  };

  const renderBlank = (blank: Blank, segmentId: string) => {
    const userAnswer = answers[blank.id] || "";
    const hintCount = hintRevealedCount[blank.id] || 0;
    const checkedResult = checkedResults[blank.id];
    const isChecked = !!checkedResult;
    const isCorrect = checkedResult?.isCorrect;
    const isSegmentCompleted = completedSegments.has(segmentId);
    const hasCorrectedAnswer = !!correctedAnswers[blank.id];

    const answerLength = blank.answer.length;
    const userInputLength = userAnswer.length;
    const totalShown = Math.max(userInputLength, hintCount);
    const remainingStars = Math.max(0, answerLength - totalShown);

    const hintPrefix = blank.answer.slice(0, hintCount);
    const userTypedPart = userAnswer.slice(hintCount);
    let displayText = hintPrefix + userTypedPart;
    if (remainingStars > 0 && !isChecked && !isSegmentCompleted) {
      displayText += "*".repeat(remainingStars);
    }

    let finalText = displayText;
    let textColor = "text-text-tertiary";
    let hasLineThrough = false;

    if (isSegmentCompleted) {

      if (isCorrect) {

        textColor = "text-success";
      } else if (hasCorrectedAnswer) {

        finalText = correctedAnswers[blank.id];
        textColor = "text-warning font-medium";
      }
    } else if (isChecked) {

      if (isCorrect) {
        textColor = "text-success";
      } else {

        textColor = "text-error";
        hasLineThrough = true;
      }
    } else if (userInputLength > hintCount) {
      textColor = "text-primary";
    } else if (hintCount > 0) {
      textColor = "text-warning";
    }

    return (
      <span
        key={blank.id}
        className="relative inline-block mx-0.5"
        onClick={() => {
          if (!isSegmentCompleted && !isChecked) {
            const input = document.getElementById(
              `blank-input-${blank.id}`
            ) as HTMLInputElement;
            if (input) input.focus();
          }
        }}
      >
        <span
          className={`
            inline-flex items-center justify-center min-w-[40px] max-w-[200px] h-8 px-2 text-center
            transition-all
            ${hasLineThrough ? "line-through decoration-2" : ""}
            ${textColor}
          `}
        >
          {finalText}
        </span>

        <input
          id={`blank-input-${blank.id}`}
          type="text"
          maxLength={answerLength}
          disabled={isSegmentCompleted}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          value={userAnswer}
          onChange={(e) => {
            if (isSegmentCompleted) return;
            const newValue = e.target.value;
            const hintPart = blank.answer.slice(0, hintCount);
            if (newValue.length < hintCount) {
              setAnswers((prev) => ({ ...prev, [blank.id]: hintPart }));
            } else {
              const userTyped = newValue.slice(hintCount);
              setAnswers((prev) => ({
                ...prev,
                [blank.id]: hintPart + userTyped,
              }));
            }
          }}
          onKeyDown={(e) => {
            if (isSegmentCompleted) return;
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
            if (e.key === "Backspace" && userAnswer.length <= hintCount) {
              e.preventDefault();
            }
          }}
          autoComplete="off"
          autoCapitalize="off"
        />
      </span>
    );
  };

  const renderSegmentWithBlanks = (segment: TranscriptSegment) => {
    const words = segment.textEn.split(" ");
    const isCompleted = completedSegments.has(segment.id);

    return words.map((word, index) => {
      const blank = segment.blanks.find((b) => b.wordIndex === index);

      if (!blank) {
        return <span key={index}>{word}</span>;
      }

      return (
        <span key={blank.id}>
          {renderBlank(blank, segment.id)}
          <span> </span>
        </span>
      );
    });
  };

  const currentSegmentHintsUsed = currentSegment
    ? getSegmentHintCount(currentSegment.blanks, hintRevealedCount)
    : 0;

  const hasMoreHints = currentSegment
    ? findHintableBlank(currentSegment.blanks, hintRevealedCount) !== undefined
    : false;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-4 lg:px-6">

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
        >
          <Icon name="arrow-left" size={20} />
          <span className="font-medium">Quay lại</span>
        </button>
        <div className="text-sm text-text-tertiary">{exercise.title}</div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-140px)]">

        <div className="w-180 shrink-0 flex flex-col gap-4">

          <Card className="overflow-hidden">
            <div
              className={`relative ${
                exercise.mediaType === "VIDEO"
                  ? "aspect-video bg-black"
                  : "h-32 bg-linear-to-br from-primary-20 to-primary-5"
              }`}
            >
              {exercise.mediaType === "VIDEO" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-surface-subtle">
                  <div className="text-center">
                    <Icon
                      name="video"
                      size={36}
                      className="text-text-tertiary mx-auto mb-1"
                    />
                    <p className="text-xs text-text-secondary">Video Player</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-16">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-0.5 rounded-full transition-all ${
                          currentTime >= (i / 20) * exercise.durationSeconds
                            ? "bg-primary"
                            : "bg-primary-20"
                        }`}
                        style={{ height: `${20 + Math.sin(i * 0.5) * 15}%` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={togglePlayback}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                  <Icon name={isPlaying ? "pause" : "play"} size={24} />
                </div>
              </button>
            </div>

            <CardContent className="p-3">

              <div className="mb-2">
                <input
                  type="range"
                  min="0"
                  max={exercise.durationSeconds}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => setCurrentTime(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-subtle rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-text-tertiary mt-0.5">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(exercise.durationSeconds)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={replayPreviousSegment}
                    disabled={activeSegmentIndex === 0}
                    className="h-7 w-7 p-0"
                  >
                    <Icon name="chevron-left" size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={replaySegment}
                    className="h-7 px-1.5"
                  >
                    <Icon name="rotate-ccw" size={12} />
                  </Button>
                </div>

                <div className="flex items-center gap-0.5 bg-surface-subtle rounded-md p-0.5">
                  {[0.75, 1, 1.25].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-1.5 py-0.5 rounded text-xs ${
                        playbackSpeed === speed
                          ? "bg-primary text-white"
                          : "text-text-secondary"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {exercise.segments.map((seg, i) => {
              const isCompleted = completedSegments.has(seg.id);
              const isActive = i === activeSegmentIndex && !isCompleted;

              return (
                <button
                  key={seg.id}
                  onClick={() => goToSegment(i)}
                  className={`
                    flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
                    ${
                      isCompleted
                        ? "bg-success text-white cursor-pointer"
                        : isActive
                        ? "bg-primary text-white cursor-pointer"
                        : "bg-surface-subtle text-text-tertiary cursor-not-allowed"
                    }
                  `}
                >
                  {isCompleted ? <Icon name="check" size={12} /> : i + 1}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-text-tertiary">
            <span>{isVietnamese ? 'Gợi ý' : 'Hints'}: {totalHintsUsed}</span>
            <span>{isVietnamese ? 'Nghe lại' : 'Replay'}: {replayCount}</span>
            <span>
              {completedSegments.size}/{exercise.segments.length}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="flex-1 overflow-y-auto p-4">

              <div className="flex items-center gap-2 mb-4 sticky top-0 bg-white pb-2">
                <span className="text-xs px-2 py-1 bg-primary-soft text-primary rounded-full font-medium">
                  Câu {activeSegmentIndex + 1}
                </span>
                <span className="text-xs text-text-tertiary">
                  {formatDuration(currentSegment?.startTime || 0)} -{" "}
                  {formatDuration(currentSegment?.endTime || 0)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg leading-relaxed text-text-primary mb-4 font-medium">
                {renderSegmentWithBlanks(currentSegment)}
              </div>

              {hasViewedCurrentResult && !isCurrentSegmentCompleted && (
                <div className="mb-4 p-3 bg-surface-subtle rounded-lg">
                  <h4 className="text-sm font-medium text-text-secondary mb-2">
                    Kết quả kiểm tra:
                  </h4>
                  {currentSegment?.blanks.map((blank) => {
                    const result = checkedResults[blank.id];
                    if (!result) return null;
                    return (
                      <div
                        key={blank.id}
                        className="flex items-center gap-2 mb-2"
                      >
                        <Icon
                          name={result.isCorrect ? "check" : "x"}
                          size={16}
                          className={
                            result.isCorrect ? "text-success" : "text-error"
                          }
                        />
                        <span className="text-sm">
                          {result.isCorrect ? (
                            <span className="text-success">
                              Đúng: {result.userAnswer}
                            </span>
                          ) : (
                            <span>
                              <span className="text-error line-through">
                                Sai: {result.userAnswer}
                              </span>
                              <span className="text-warning ml-2">
                                → Đáp án: {result.correctAnswer}
                              </span>
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={handleHint}
                  disabled={!hasMoreHints || isCurrentSegmentCompleted}
                  className="border-primary text-primary"
                >
                  <Icon name="lightbulb" size={16} />
                  <span className="ml-1">Gợi ý</span>
                  {currentSegmentHintsUsed > 0 && (
                    <span className="ml-1 text-xs opacity-70">
                      ({currentSegmentHintsUsed})
                    </span>
                  )}
                </Button>
              </div>

              <Button
                onClick={handleNext}
                disabled={!hasViewedCurrentResult && !canSubmitCurrentSegment}
                className="w-full bg-primary hover:bg-primary-hover"
              >
                {!hasViewedCurrentResult ? (
                  <>Kiểm tra</>
                ) : isCurrentSegmentCompleted || allSegmentsCompleted ? (
                  <>Hoàn thành</>
                ) : (
                  <>Tiếp tục</>
                )}
                <Icon
                  name={!hasViewedCurrentResult ? "check" : "chevron-right"}
                  size={16}
                />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function ResultView({
  exercise,
  attempt,
  onBack,
  onReview,
  onRetry,
}: {
  exercise: ListeningExercise;
  attempt: ListeningAttempt;
  onBack: () => void;
  onReview: () => void;
  onRetry: () => void;
}) {
  const scoreColor =
    (attempt.accuracy || 0) >= 80
      ? "text-success"
      : (attempt.accuracy || 0) >= 50
      ? "text-warning"
      : "text-error";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Kết quả luyện nghe
        </h2>
        <p className="text-text-secondary">{exercise.title}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-8 text-center">
          <div className={`text-6xl font-bold mb-2 ${scoreColor}`}>
            {attempt.accuracy}%
          </div>
          <p className="text-text-secondary mb-6">
            {attempt.totalCorrectBlanks} / {attempt.totalBlanks} từ đúng
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-surface-subtle rounded-xl">
              <div className="text-2xl font-bold text-text-primary">
                {Math.floor(attempt.totalTimeSeconds / 60)}:
                {String(attempt.totalTimeSeconds % 60).padStart(2, "0")}
              </div>
              <div className="text-xs text-text-tertiary">Thời gian</div>
            </div>
            <div className="p-3 bg-surface-subtle rounded-xl">
              <div className="text-2xl font-bold text-text-primary">
                {attempt.totalHintsUsed}
              </div>
              <div className="text-xs text-text-tertiary">Gợi ý đã dùng</div>
            </div>
            <div className="p-3 bg-surface-subtle rounded-xl">
              <div className="text-2xl font-bold text-text-primary">
                {attempt.totalReplays}
              </div>
              <div className="text-xs text-text-tertiary">Lần nghe lại</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {attempt.aiAnalysis && (
        <Card className="mb-6 bg-primary-5 border-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="sparkles" className="text-primary" size={18} />
              <span className="font-semibold text-text-primary">
                Phân tích AI
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-3">
              {attempt.aiAnalysis.suggestions[0]}
            </p>
            {attempt.aiAnalysis.weakAreas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attempt.aiAnalysis.weakAreas.map((area) => (
                  <span
                    key={area}
                    className="text-xs px-2 py-1 bg-primary-10 text-primary rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        <Button
          onClick={onReview}
          className="w-full bg-primary hover:bg-primary-hover"
        >
          <Icon name="clipboard-check" size={16} />
          Xem lại lỗi sai
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onRetry}
            className="flex-1 border-border"
          >
            <Icon name="rotate-ccw" size={16} />
            Luyện lại
          </Button>
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 border-border"
          >
            <Icon name="home" size={16} />
            Quay về
          </Button>
        </div>
      </div>
    </main>
  );
}

function ReviewView({
  exercise,
  attempt,
  onBack,
  onContinue,
}: {
  exercise: ListeningExercise;
  attempt: ListeningAttempt;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
        >
          <Icon name="arrow-left" size={20} />
          <span className="font-medium">Quay lại</span>
        </button>
        <h2 className="text-lg font-semibold text-text-primary">
          Xem lại lỗi sai
        </h2>
        <div />
      </div>

      <div className="space-y-4">
        {exercise.segments.map((segment, index) => {
          const segmentAnswer = attempt.segmentAnswers.find(
            (a) => a.segmentId === segment.id
          );
          const hasErrors = segmentAnswer?.blankResults.some(
            (r) => !r.isCorrect
          );

          return (
            <Card
              key={segment.id}
              className={
                hasErrors
                  ? "border-error bg-error-5"
                  : "border-success bg-success-5"
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-text-primary">
                    Câu {index + 1}
                  </div>
                  {hasErrors ? (
                    <span className="text-xs px-2 py-1 bg-error-soft text-error rounded-full">
                      Cần ôn tập
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-success-soft text-success rounded-full">
                      Tốt
                    </span>
                  )}
                </div>

                <p className="text-text-primary mb-2">{segment.textEn}</p>
                {segment.textVi && (
                  <p className="text-sm text-text-tertiary mb-3">
                    {segment.textVi}
                  </p>
                )}

                {segmentAnswer?.blankResults.map((blankRes) => {
                  const blank = segment.blanks.find(
                    (b) => b.id === blankRes.blankId
                  );
                  if (!blank) return null;

                  return (
                    <div
                      key={blankRes.blankId}
                      className={`p-2 rounded-lg mb-2 ${
                        blankRes.isCorrect ? "bg-success-10" : "bg-error-10"
                      }`}
                    >
                      <div className="text-xs text-text-tertiary mb-1">
                        {blank.answer}
                      </div>
                      {!blankRes.isCorrect && (
                        <div className="text-sm">
                          <span className="text-error line-through">
                            {blankRes.userAnswer || "(trống)"}
                          </span>
                          <span className="text-success ml-2">
                            → {blank.answer}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={onContinue}
        className="w-full mt-6 bg-primary hover:bg-primary-hover"
      >
        Tiếp tục học
        <Icon name="arrow-right" size={16} />
      </Button>
    </main>
  );
}
