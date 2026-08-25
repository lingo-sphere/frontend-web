
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/dashboard/SectionHeading";
import { Pagination } from "@/components/common/Pagination";
import { topics } from "@/data/topics-data";
import type { Topic } from "@/data/topics-data";

interface TopicsPageProps {
  onAction: (message: string) => void;
}

const ITEMS_PER_PAGE = 6;

export function TopicsPage({ onAction }: TopicsPageProps) {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTopics = useMemo(() => {
    return topics
      .filter(
        (topic) =>
          topic.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.nameVi.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.accessCount - a.accessCount); 
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredTopics.length / ITEMS_PER_PAGE);
  const paginatedTopics = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTopics.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTopics, currentPage]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const featuredTopics = topics.filter((t) => t.isFeatured);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <SectionHeading
        eyebrow={t('topics.title')}
        title={isVietnamese ? "Chủ đề từ vựng" : "Vocabulary Topics"}
        description={isVietnamese ? "Khám phá các chủ đề phổ biến để mở rộng vốn từ vựng" : "Explore popular topics to expand your vocabulary"}
      />

      {/* Featured Topics */}
      <section className="mt-6">
        <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold uppercase tracking-wide text-text-tertiary">
          <Star className="h-4 w-4 text-warning" />
          {isVietnamese ? "Nổi bật" : "Featured"}
        </h3>
        <div className="flex flex-wrap gap-3">
          {featuredTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onAction(`${isVietnamese ? "Đã mở" : "Opened"} "${topic.nameVi}"`)}
              className="rounded-full bg-warning-soft px-4 py-2 text-[13px] font-medium text-warning transition-all hover:bg-warning/20 hover:scale-105"
            >
              {topic.nameVi}
            </button>
          ))}
        </div>
      </section>

      {/* Search */}
      <div className="mt-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder={isVietnamese ? "Tìm kiếm chủ đề..." : "Search topics..."}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="mt-4 text-[13px] text-text-secondary">
        {isVietnamese ? "Tìm thấy" : "Found"}{" "}
        <span className="font-semibold text-text-primary">
          {filteredTopics.length}
        </span>{" "}
        {isVietnamese ? "chủ đề" : "topics"}
      </p>

      {/* Topics Grid */}
      {paginatedTopics.length > 0 ? (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedTopics.map((topic: Topic) => (
              <Card
                key={topic.id}
                className={`dashboard-card cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  topic.isFeatured ? "ring-2 ring-warning/30" : ""
                }`}
                onClick={() => onAction(`${isVietnamese ? "Đã mở" : "Opened"} "${topic.nameVi}"`)}
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[16px] font-semibold text-text-primary">
                        {topic.nameVi}
                      </h4>
                      <p className="text-[12px] text-text-secondary">
                        {topic.nameEn}
                      </p>
                    </div>
                    {topic.isFeatured && (
                      <Star className="h-4 w-4 text-warning shrink-0" />
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-[12px] text-text-secondary line-clamp-2">
                    {topic.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
                      {topic.cefrLevel}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[12px] text-text-tertiary">
                      {topic.wordCount} {isVietnamese ? "từ" : "words"}
                    </span>
                    <span className="text-[12px] text-text-tertiary">
                      {topic.accessCount.toLocaleString()} {isVietnamese ? "lượt truy cập" : "views"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination - using shared component */}
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredTopics.length}
            />
          </div>
        </>
      ) : (
        <div className="mt-12 text-center">
          <p className="text-[14px] text-text-secondary">
            {isVietnamese ? "Không tìm thấy chủ đề nào" : "No topics found"}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => handleSearch("")}
          >
            {isVietnamese ? "Xóa tìm kiếm" : "Clear search"}
          </Button>
        </div>
      )}
    </main>
  );
}
