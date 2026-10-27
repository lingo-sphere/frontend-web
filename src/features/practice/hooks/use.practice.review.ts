import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api.client";

export type ReviewSkill = "SPEAKING" | "WRITING";
export interface PracticeReviewResult {
  id: string;
  skill: ReviewSkill;
  overall_score: number;
  ai_score: number;
  raw_score: number | null;
  original_ai_raw_score: number | null;
  max_score: number;
  grading_standard: string;
  can_request: boolean;
  revision: number;
  review: {
    status: "REQUESTED" | "RESOLVED";
    reason?: string;
    feedback?: string;
    reviewer_name?: string;
    requested_at?: string;
    reviewed_at?: string;
  } | null;
}
export function usePracticeReview(
  skill: ReviewSkill,
  id: string | undefined,
  hasScore = true,
) {
  const client = useQueryClient();
  const key = ["practice-review", skill, id];
  const enabled = !!id && /^[a-f\d]{24}$/i.test(id) && hasScore;
  const query = useQuery({
    queryKey: key,
    enabled,
    queryFn: () =>
      api.get<PracticeReviewResult>(`/practice/review-results/${skill}/${id}`),
    refetchOnWindowFocus: true,
    refetchInterval: (query) =>
      query.state.data?.review?.status === "REQUESTED" ? 30000 : false,
    retry: 1,
  });
  const request = useMutation({
    mutationFn: (reason: string) =>
      api.post<PracticeReviewResult>(
        `/practice/review-results/${skill}/${id}/request`,
        { reason: reason.trim() },
      ),
    onSuccess: (result) => {
      client.setQueryData(key, result);
    },
  });
  return { query, request, enabled };
}
