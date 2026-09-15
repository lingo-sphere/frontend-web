/**
 * @file page.tsx
 * @description Trang giao diện người dùng (Next.js App Router) cho tuyến (study)/ipa
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/card";
import { Button } from "@/components/button";
import { SectionHeading } from "@/features/dashboard/components/section.heading";
import { Icon } from "@/components/icon.map";
import { useApp } from "@/contexts/app.context";
import {
  vocabularyService,
  type BackendIpaSymbol,
} from "@/features/vocabulary/services/vocabulary.service";
import { playAudio } from "@/utils/media.utils";

export default function IpaAppPage() {
  const { t, i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";
  const { showAction } = useApp();
  const [playingSymbol, setPlayingSymbol] = useState<string | null>(null);
  const [ipaSymbols, setIpaSymbols] = useState<BackendIpaSymbol[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchIpa = async () => {
      try {
        setIsLoading(true);
        const symbols = await vocabularyService.getIpaSymbols();
        if (isMounted && Array.isArray(symbols)) {
          setIpaSymbols(symbols);
        }
      } catch (err) {
        console.error("Failed to load IPA symbols:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchIpa();
    return () => {
      isMounted = false;
    };
  }, []);

  const vowels = ipaSymbols.filter((s) => s.symbol_type === "VOWEL");
  const diphthongs = ipaSymbols.filter((s) => s.symbol_type === "DIPHTHONG");
  const consonants = ipaSymbols.filter((s) => s.symbol_type === "CONSONANT");

  const handlePlaySound = async (symbol: BackendIpaSymbol) => {
    setPlayingSymbol(symbol.id);

    // Play IPA symbol audio
    if (symbol.audio_url) {
      playAudio(symbol.audio_url);
    }

    // After IPA audio, play example word audio (if available)
    setTimeout(() => {
      if (symbol.example_audio_url) {
        playAudio(symbol.example_audio_url);
      }
    }, symbol.audio_url ? 600 : 0);

    showAction(
      `${isVietnamese ? "Phát âm" : "Pronouncing"}: /${symbol.symbol}/ (${
        symbol.example_word
      })`
    );

    // Clear playing state based on whether we have audio files
    const delay = (symbol.audio_url ? 600 : 0) + (symbol.example_audio_url ? 800 : 0) + 200;
    setTimeout(() => setPlayingSymbol(null), delay);
  };

  // Play only IPA symbol audio
  const handlePlayIpaOnly = (symbol: BackendIpaSymbol, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingSymbol(symbol.id);
    if (symbol.audio_url) {
      playAudio(symbol.audio_url);
    }
    showAction(
      `${isVietnamese ? "Phát âm IPA" : "Play IPA"}: /${symbol.symbol}/`
    );
    setTimeout(() => setPlayingSymbol(null), 600);
  };

  // Play only example word audio
  const handlePlayExampleOnly = (
    symbol: BackendIpaSymbol,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setPlayingSymbol(symbol.id);
    if (symbol.example_audio_url) {
      playAudio(symbol.example_audio_url);
    }
    showAction(
      `${isVietnamese ? "Phát từ mẫu" : "Play example"}: ${symbol.example_word}`
    );
    setTimeout(() => setPlayingSymbol(null), 800);
  };

  const handlePractice = () => {
    showAction(
      isVietnamese
        ? "Đã mở chế độ Luyện tập ngữ âm IPA"
        : "Opened IPA Practice Mode"
    );
  };

  const renderSymbolCard = (item: BackendIpaSymbol) => {
    const isPlaying = playingSymbol === item.id;

    return (
      <Card
        key={item.id}
        className={`transition-all hover:scale-105 hover:shadow-md ${
          isPlaying ? "border-primary ring-2 ring-primary/20" : "border-slate-200 dark:border-slate-700"
        }`}
      >
        <CardContent className="flex flex-col items-center p-3 text-center">
          {/* IPA Symbol with play button */}
          <div className="relative group">
            <span className="font-mono text-[22px] font-bold text-primary">
              /{item.symbol}/
            </span>
            {/* IPA play button */}
            {item.audio_url && (
              <button
                onClick={(e) => handlePlayIpaOnly(item, e)}
                className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
                title={isVietnamese ? "Nghe IPA" : "Play IPA"}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                </svg>
              </button>
            )}
          </div>

          {/* Example word with play button */}
          <div className="relative group mt-1">
            <span className="text-[13px] font-semibold text-text-primary">
              {item.example_word}
            </span>
            {/* Example play button */}
            {item.example_audio_url && (
              <button
                onClick={(e) => handlePlayExampleOnly(item, e)}
                className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600"
                title={isVietnamese ? "Nghe từ mẫu" : "Play example"}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                </svg>
              </button>
            )}
          </div>

          {/* IPA pronunciation of example */}
          <span className="text-[11px] font-mono text-text-tertiary">
            {item.example_word_ipa}
          </span>

          {/* Description */}
          {item.description_en && (
            <span className="text-[10px] text-text-tertiary mt-1 line-clamp-2">
              {isVietnamese && item.description_vi ? item.description_vi : item.description_en}
            </span>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeading
            eyebrow={t("practice.title")}
            title={
              isVietnamese
                ? "Bảng phiên âm quốc tế IPA (44 âm)"
                : "International Phonetic Alphabet (44 Sounds)"
            }
            description={
              isVietnamese
                ? "Nắm vững 44 âm trong tiếng Anh chuẩn quốc tế để phát âm chuẩn xác"
                : "Master the 44 International Phonetic Alphabet sounds for accurate pronunciation"
            }
          />
          <Button
            className="self-start gap-2 bg-primary hover:bg-primary-hover"
            onClick={handlePractice}
          >
            <Icon name="mic" size={16} />
            {isVietnamese ? "Luyện phát âm" : "Practice Pronunciation"}
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-12 flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <section className="mt-8">
              <h3 className="mb-3 text-[16px] font-bold text-text-primary">
                {isVietnamese
                  ? "1. Nguyên âm đơn (Monophthongs)"
                  : "1. Monophthongs"}{" "}
                ({vowels.length})
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {vowels.map(renderSymbolCard)}
              </div>
            </section>

            <section className="mt-8">
              <h3 className="mb-3 text-[16px] font-bold text-text-primary">
                {isVietnamese
                  ? "2. Nguyên âm đôi (Diphthongs)"
                  : "2. Diphthongs"}{" "}
                ({diphthongs.length})
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {diphthongs.map(renderSymbolCard)}
              </div>
            </section>

            <section className="mt-8">
              <h3 className="mb-3 text-[16px] font-bold text-text-primary">
                {isVietnamese ? "3. Phụ âm (Consonants)" : "3. Consonants"} (
                {consonants.length})
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {consonants.map(renderSymbolCard)}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
