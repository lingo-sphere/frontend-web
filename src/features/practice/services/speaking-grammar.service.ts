import { api } from "@/services/api.client";
import type { GrammarSession } from "../types/grammar-practice";
import type { SpeakingGrammarRemediation } from "../types/speaking-grammar";

const base = (kind: "SPEAKING" | "WRITING") =>
  kind === "WRITING" ? "writing/submissions" : "speaking/attempts";
export const speakingGrammarService = {
  source(attemptId: string, kind: "SPEAKING" | "WRITING" = "SPEAKING") {
    return api.get<SpeakingGrammarRemediation>(
      `/practice/${base(kind)}/${encodeURIComponent(attemptId)}/grammar-remediation`,
    );
  },
  start(
    attemptId: string,
    issueId: string,
    sessionKey: string,
    kind: "SPEAKING" | "WRITING" = "SPEAKING",
  ) {
    return api.post<GrammarSession>(
      `/practice/${base(kind)}/${encodeURIComponent(attemptId)}/grammar-remediation/${encodeURIComponent(issueId)}/sessions`,
      { session_key: sessionKey },
    );
  },
};
