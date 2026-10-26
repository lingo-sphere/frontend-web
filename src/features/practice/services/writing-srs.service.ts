import { api } from "@/services/api.client";
import type {
  WritingSrsList,
  WritingSrsDetail,
  WritingSrsFilter,
  WritingReviewSession,
} from "../types/writing-srs";
const base = "/practice/writing/srs";
export const writingSrsService = {
  list: (filters: WritingSrsFilter) => api.get<WritingSrsList>(base, filters),
  sync: () =>
    api.post<{ processed: number; remaining: number; retry_needed: boolean }>(
      `${base}/sync`,
      {},
    ),
  detail: (id: string) => api.get<WritingSrsDetail>(`${base}/targets/${id}`),
  start: (id: string, mode: "REWRITE" | "TRANSFER", exercise_id?: string) =>
    api.post<{ review_session_id: string; exercise_id: string }>(
      `${base}/targets/${id}/start`,
      { mode, exercise_id },
    ),
  pause: (id: string, paused: boolean) =>
    apiClientPatch(`${base}/targets/${id}/pause`, { paused }),
  session: (id: string) =>
    api.get<WritingReviewSession>(`${base}/sessions/${id}`),
  hint: (id: string) =>
    api.post<WritingReviewSession>(`${base}/sessions/${id}/hint`, {}),
};
// Keep API response unwrapping consistent with api.get/post.
import { apiClient } from "@/services/api.client";
async function apiClientPatch(url: string, body: unknown) {
  const response = await apiClient.patch(url, body);
  return response.data?.data ?? response.data;
}
