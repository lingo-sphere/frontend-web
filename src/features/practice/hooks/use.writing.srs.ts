'use client'

import { useMounted } from "@/hooks/use.mounted";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useQuery } from "@tanstack/react-query";
import { writingSrsService } from "../services/writing-srs.service";
import type { WritingSrsFilter } from "../types/writing-srs";
export const writingSrsKey = ["writing-srs"] as const;
export function useWritingSrsQuery(filters: WritingSrsFilter, enabled = true) {
  const mounted = useMounted();
  const user = useAuthStore((state) => state.user?.user_id);
  return useQuery({
    queryKey: [...writingSrsKey, user, "list", filters],
    queryFn: () => writingSrsService.list(filters),
    staleTime: 15000,
    enabled: mounted && enabled && !!user,
  });
}
export function useWritingSrsDetail(id: string | null) {
  const mounted = useMounted();
  const user = useAuthStore((state) => state.user?.user_id);
  return useQuery({
    queryKey: [...writingSrsKey, user, "detail", id],
    queryFn: () => writingSrsService.detail(id!),
    enabled: mounted && !!id && !!user,
  });
}
export function useWritingReviewSession(id?: string | null) {
  const mounted = useMounted();
  const user = useAuthStore((state) => state.user?.user_id);
  return useQuery({
    queryKey: [...writingSrsKey, user, "session", id],
    queryFn: () => writingSrsService.session(id!),
    enabled: mounted && !!id && !!user,
    staleTime: 0,
    retry: false,
  });
}
