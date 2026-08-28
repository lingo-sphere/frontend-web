import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/dashboard/SectionHeading";
import { Icon } from "@/components/icons/icon-map";
import {
  vowels,
  diphthongs,
  consonants,
  type IPASymbol,
} from "@/data/ipa-data";

interface IPAPageProps {
  onAction: (message: string) => void;
}

export function IPAPage({ onAction }: IPAPageProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [playingSymbol, setPlayingSymbol] = useState<string | null>(null);

  const handlePlaySound = (symbol: IPASymbol) => {
    setPlayingSymbol(symbol.id);
    onAction(`${isVietnamese ? 'Phát âm' : 'Playing'}: ${symbol.symbol} (${symbol.soundName})`);

    setTimeout(() => setPlayingSymbol(null), 300);
  };

  const handlePractice = () => {
    onAction(isVietnamese ? "Đã mở Luyện tập IPA" : "Opened IPA Practice");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "text-success";
      case "MEDIUM":
        return "text-warning";
      case "HARD":
        return "text-error";
      default:
        return "text-text-secondary";
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-success-soft";
      case "MEDIUM":
        return "bg-warning-soft";
      case "HARD":
        return "bg-error-soft";
      default:
        return "bg-surface-subtle";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return isVietnamese ? "Dễ" : "Easy";
      case "MEDIUM":
        return isVietnamese ? "Trung bình" : "Medium";
      case "HARD":
        return isVietnamese ? "Khó" : "Hard";
      default:
        return difficulty;
    }
  };

  const renderSymbolCard = (symbol: IPASymbol) => {
    const isPlaying = playingSymbol === symbol.id;

    return (
      <Card
        key={symbol.id}
        className={`
          dashboard-card cursor-pointer transition-all duration-200
          hover:-translate-y-0.5 hover:bg-surface-hover
          ${isPlaying ? "ring-2 ring-primary scale-105" : ""}
        `}
        onClick={() => handlePlaySound(symbol)}
      >
        <CardContent className="p-4">

          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-5xl font-bold text-text-primary transition-transform ${
                isPlaying ? "scale-110" : ""
              }`}
            >
              {symbol.symbol}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${getDifficultyBg(
                symbol.difficulty
              )} ${getDifficultyColor(symbol.difficulty)}`}
            >
              {getDifficultyLabel(symbol.difficulty)}
            </span>
          </div>

          <p className="text-sm font-medium text-text-primary mb-1">
            {symbol.soundName}
          </p>
          <p className="text-xs text-text-secondary mb-3">
            {symbol.descriptionVi}
          </p>

          <div className="flex justify-center mb-3">
            <span className="text-sm px-3 py-1.5 bg-surface-subtle rounded text-text-secondary font-medium">
              {symbol.examples[0]?.word}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-text-tertiary">
              <span>{isVietnamese ? 'Tiến độ' : 'Progress'}</span>
              <span>{symbol.progress || 0}%</span>
            </div>
            <div className="h-1.5 bg-surface-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${symbol.progress || 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <SectionHeading
          eyebrow={t('ipa.title')}
          title={isVietnamese ? 'IPA - Phiên âm quốc tế' : 'IPA - International Phonetic Alphabet'}
          description={isVietnamese ? 'Học cách phát âm chuẩn IPA' : 'Learn to pronounce IPA symbols correctly'}
        />
        <Button
          className="bg-primary hover:bg-primary-hover text-white"
          onClick={handlePractice}
        >
          {isVietnamese ? 'Luyện tập IPA' : 'Practice IPA'}
        </Button>
      </div>

      <section className="mb-10">
        <h3 className="mb-4 text-lg font-semibold text-text-primary flex items-center gap-2">
          <Icon name="languages" className="text-primary" size={20} />
          {isVietnamese ? 'Nguyên âm & Âm đôi' : 'Vowels & Diphthongs'}
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          {isVietnamese ? '12 nguyên âm đơn + 8 âm đôi (diphthongs)' : '12 monophthongs + 8 diphthongs'}
        </p>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-text-tertiary uppercase tracking-wide mb-3">
            {isVietnamese ? 'Nguyên âm (Vowels)' : 'Vowels'}
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {vowels.map((symbol) => renderSymbolCard(symbol))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-text-tertiary uppercase tracking-wide mb-3">
            {isVietnamese ? 'Âm đôi (Diphthongs)' : 'Diphthongs'}
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {diphthongs.map((symbol) => renderSymbolCard(symbol))}
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-text-primary flex items-center gap-2">
          <Icon name="type" className="text-info" size={20} />
          {isVietnamese ? 'Phụ âm' : 'Consonants'}
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          {isVietnamese ? '20 phụ âm cơ bản trong tiếng Anh' : '20 basic consonants in English'}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {consonants.map((symbol) => renderSymbolCard(symbol))}
        </div>
      </section>

      <div className="mt-10 p-4 bg-surface-subtle rounded-xl">
        <h4 className="text-sm font-semibold text-text-primary mb-2">
          {isVietnamese ? 'Mẹo học IPA' : 'IPA Learning Tips'}
        </h4>
        <ul className="text-xs text-text-secondary space-y-1">
          <li>• {isVietnamese ? 'Ấn vào mỗi ký hiệu để nghe phát âm mẫu' : 'Click on each symbol to hear the pronunciation'}</li>
          <li>• {isVietnamese ? 'Theo dõi thanh tiến độ để biết bạn đã luyện tập bao nhiêu' : 'Track your progress bar to see how much you have practiced'}</li>
          <li>• {isVietnamese ? 'Bắt đầu với các âm Dễ trước, sau đó nâng dần lên Khó' : 'Start with Easy sounds first, then gradually move to Hard'}</li>
          <li>• {isVietnamese ? 'Luyện tập thường xuyên để cải thiện khả năng phát âm' : 'Practice regularly to improve your pronunciation'}</li>
        </ul>
      </div>
    </main>
  );
}
