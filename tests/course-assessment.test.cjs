const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const url = process.env.ASSESSMENT_WEB_URL;
let browser;
before(async () => {
  if (!url) return;
  const { chromium } = require(process.env.ASSESSMENT_PLAYWRIGHT_MODULE ||
    "playwright");
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.ASSESSMENT_BROWSER_EXECUTABLE,
  });
});
after(async () => {
  await browser?.close();
});
const ID = "111111111111111111111111",
  SESSION = "222222222222222222222222";
const learner = {
  user_id: "learner",
  email: "assessment@example.test",
  role: "STUDENT",
  full_name: "Assessment learner",
  status: "ACTIVE",
};
const questions = [
  {
    _id: "q1",
    question_text: "Listen and choose.",
    skill_type: "LISTENING",
    options: ["Listening yes", "Listening no"],
  },
  {
    _id: "q2",
    question_text: "Read and choose.",
    skill_type: "READING",
    options: ["Reading yes", "Reading no"],
  },
];
async function fixture() {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1000 },
  });
  await context.addInitScript((learner) => {
    localStorage.setItem("i18nextLng", "vi");
    localStorage.setItem("lingosphere_user_info", JSON.stringify(learner));
    localStorage.setItem("lingosphere_user_access_token", "fixture");
  }, learner);
  const state = {
    submissions: [],
    failures: { WRITING: true, SPEAKING: true },
    finalError: false,
    finalPending: false,
    finalCalls: 0,
    skillCalls: [],
  };
  const errors = [],
    page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.on("pageerror", (error) => errors.push(error.message));
  const course = {
    _id: ID,
    id: ID,
    title: "Assessment fixture",
    slug: "assessment-fixture",
    category: "TOEIC_4_SKILLS",
    skills: ["LISTENING", "READING", "SPEAKING", "WRITING"],
    price: 0,
    is_published: true,
    final_test_questions: questions,
    final_test_speaking_prompt: "Explain why teamwork is useful.",
    final_test_writing_prompt: "Write your opinion about teamwork.",
    curriculum: [],
    modules: [],
  };
  await page.route("**/*", async (route) => {
    const request = route.request(),
      path = new URL(request.url()).pathname;
    if (
      !["xhr", "fetch"].includes(request.resourceType()) ||
      path.includes("/_next/") ||
      request.headers()["rsc"]
    )
      return route.continue();
    const respond = (data) =>
      route.fulfill({ contentType: "application/json", json: { data } });
    if (path.endsWith(`/courses/${ID}/enrollment-status`))
      return respond({ is_enrolled: true });
    if (
      path.endsWith(`/courses/${ID}`) ||
      path.endsWith(`/courses/${ID}/curriculum`)
    )
      return respond(course);
    if (path.includes("/session/start"))
      return respond({
        session_id: SESSION,
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 600000).toISOString(),
        duration_minutes: 10,
        status: state.finalPending ? "AWAITING_GRADING" : "IN_PROGRESS",
        interim_answers: [],
        questions,
        skill_submissions: state.submissions,
        skill_profiles: {
          speaking: { task_prompt: course.final_test_speaking_prompt },
          writing: { task_prompt: course.final_test_writing_prompt },
        },
      });
    if (path.endsWith("/speaking") || path.endsWith("/writing")) {
      const skill = path.endsWith("/speaking") ? "SPEAKING" : "WRITING",
        body = request.postDataJSON();
      state.skillCalls.push({ skill, body });
      assert.equal(body.session_id, SESSION);
      const failed = state.failures[skill];
      const score = skill === "WRITING" ? 0 : 80;
      const submission = {
        _id: skill,
        skill,
        session_id: SESSION,
        status: failed ? "GRADING_FAILED" : "AI_GRADED",
        ai_score: failed ? null : score,
        final_score: failed ? null : score,
        essay_text: body.essay_text,
        audio_url: body.audio_url,
        grading_error: failed
          ? "Chưa chấm được bài. Bài chưa được ghi nhận điểm."
          : undefined,
        ai_evaluation: failed
          ? undefined
          : {
              grading_version: `${skill.toLowerCase()}-v2`,
              grading_standard: "PRACTICAL",
              overall_score: score,
              criteria_scores: {
                task_achievement: score,
                grammatical_accuracy: score,
                lexical_resource: score,
              },
              detailed_feedback: "Nhận xét dựa trên bài làm.",
              actionable_tips: ["Phát triển thêm ví dụ."],
            },
      };
      state.submissions = [
        ...state.submissions.filter((item) => item.skill !== skill),
        submission,
      ];
      return respond(submission);
    }
    if (path.endsWith("/final-test")) {
      state.finalCalls++;
      if (state.finalError)
        return route.fulfill({
          status: 503,
          contentType: "application/json",
          json: { message: "Chưa lưu được kết quả; thử lại." },
        });
      if (state.finalPending)
        return respond({
          assessment_status: "AWAITING_GRADING",
          score: null,
          final_test_score: null,
          missing_skills: ["SPEAKING"],
          skill_scores: { LISTENING: 100, READING: 100, WRITING: 0 },
          message: "Đã nộp bài. Chưa đủ kết quả chấm.",
        });
      return respond({
        assessment_status: "COMPLETED",
        final_test_score: 70,
        score: 70,
        is_passed: true,
        correct_count: 2,
        total_questions: 2,
        skill_scores: {
          LISTENING: 100,
          READING: 100,
          SPEAKING: 80,
          WRITING: 0,
        },
        graded_questions: questions.map((q, i) => ({
          question_index: i,
          correct_index: 0,
          correct_answer: q.options[0],
          is_correct: true,
        })),
        wrong_questions: [],
        final_test_attempts: [],
      });
    }
    if (path.endsWith("/ai/quota"))
      return respond({
        is_premium: false,
        chat: { remaining: 5, limit: 5, used: 0 },
      });
    if (path.includes("/users/profile")) return respond({ profile: learner });
    if (path.includes("/auth/")) return respond(learner);
    return respond(
      path.includes("progress")
        ? { course_progress: {}, module_progress: [] }
        : [],
    );
  });
  await page.goto(`${url}/course/${ID}/exam?type=final-test`);
  await page.getByRole("button", { name: "Viết luận (Writing)" }).waitFor();
  return { page, context, state, errors };
}

test(
  "failed writing survives tab changes/reload, retries frozen input, and keeps a valid zero",
  { skip: !url },
  async () => {
    const f = await fixture();
    try {
      await f.page.getByRole("button", { name: "Viết luận (Writing)" }).click();
      await f.page
        .locator("textarea")
        .fill("I prefer teamwork because we can share ideas.");
      await f.page
        .getByRole("button", { name: "Nộp bài viết để AI chấm", exact: true })
        .click();
      await f.page
        .getByRole("button", { name: "Thử chấm lại bài đã nộp", exact: true })
        .waitFor();
      assert.equal(await f.page.locator("textarea").isDisabled(), true);
      await f.page
        .getByRole("button", { name: "Luyện Nói (Speaking)" })
        .click();
      await f.page.getByRole("button", { name: "Viết luận (Writing)" }).click();
      assert.equal(
        await f.page.locator("textarea").inputValue(),
        "I prefer teamwork because we can share ideas.",
      );
      await f.page.reload();
      await f.page.getByRole("button", { name: "Viết luận (Writing)" }).click();
      f.state.failures.WRITING = false;
      await f.page
        .getByRole("button", { name: "Thử chấm lại bài đã nộp", exact: true })
        .click();
      await f.page
        .getByText("Kết quả Writing: 0/100", { exact: true })
        .waitFor();
      assert.equal(f.state.skillCalls.length, 2);
      assert.equal(
        f.state.skillCalls[1].body.essay_text,
        f.state.skillCalls[0].body.essay_text,
      );
      assert.deepEqual(f.errors, []);
    } finally {
      await f.context.close();
    }
  },
);

test(
  "failed speaking never displays default points and retries the same audio",
  { skip: !url },
  async () => {
    const f = await fixture();
    try {
      await f.page
        .getByRole("button", { name: "Luyện Nói (Speaking)" })
        .click();
      await f.page.locator('input[type=file][accept="audio/*"]').setInputFiles({
        name: "answer.wav",
        mimeType: "audio/wav",
        buffer: Buffer.alloc(800, 1),
      });
      await f.page
        .getByRole("button", { name: "Nộp bài nói để AI chấm", exact: true })
        .click();
      await f.page
        .getByRole("button", { name: "Thử chấm lại bài đã nộp", exact: true })
        .waitFor();
      assert.equal(await f.page.getByText(/Kết quả Speaking:/).count(), 0);
      f.state.failures.SPEAKING = false;
      await f.page
        .getByRole("button", { name: "Thử chấm lại bài đã nộp", exact: true })
        .click();
      await f.page
        .getByText("Kết quả Speaking: 80/100", { exact: true })
        .waitFor();
      assert.equal(
        f.state.skillCalls[0].body.audio_url,
        f.state.skillCalls[1].body.audio_url,
      );
      assert.deepEqual(f.errors, []);
    } finally {
      await f.context.close();
    }
  },
);

test(
  "pending grades lock answers without displaying false correctness or course completion",
  { skip: !url },
  async () => {
    const f = await fixture();
    try {
      f.state.finalPending = true;
      f.state.submissions = ["SPEAKING", "WRITING"].map((skill) => ({
        _id: skill,
        skill,
        status: "GRADING_FAILED",
        ai_score: null,
        final_score: null,
        essay_text: "I prefer teamwork.",
        audio_url: "data:audio/wav;base64,AA==",
      }));
      await f.page.reload();
      await f.page
        .getByText("Đã nộp bài — chưa đủ kết quả chấm", { exact: true })
        .waitFor();
      const answer = f.page.getByRole("button", { name: /Listening yes/ });
      assert.equal(await answer.isDisabled(), true);
      assert.equal(
        await answer.evaluate((element) =>
          element.className.includes("line-through"),
        ),
        false,
      );
      await f.page
        .getByRole("button", { name: "Cập nhật kết quả tổng", exact: true })
        .click();
      await f.page
        .getByText("Chưa ghi nhận điểm tổng hoặc xét đạt.", { exact: false })
        .waitFor();
      assert.equal(await f.page.getByText(/Nộp bài thành công/).count(), 0);
      assert.deepEqual(f.errors, []);
    } finally {
      await f.context.close();
    }
  },
);

test(
  "a final-submit API error preserves answers and never fabricates a course result",
  { skip: !url },
  async () => {
    const f = await fixture();
    try {
      f.state.submissions = ["SPEAKING", "WRITING"].map((skill) => ({
        _id: skill,
        skill,
        status: "AI_GRADED",
        ai_score: 80,
        final_score: 80,
      }));
      f.state.finalError = true;
      await f.page.reload();
      await f.page.getByRole("button", { name: /Listening yes/ }).click();
      await f.page.getByRole("button", { name: /Reading yes/ }).click();
      await f.page
        .getByRole("button", { name: "Nộp bài", exact: true })
        .first()
        .click();
      await f.page
        .getByRole("button", { name: "Nộp bài ngay", exact: true })
        .last()
        .click();
      await f.page
        .getByText("Chưa lưu được kết quả; thử lại.", { exact: true })
        .waitFor();
      assert.equal(
        await f.page.getByRole("button", { name: /Listening yes/ }).isEnabled(),
        true,
      );
      assert.equal(await f.page.getByText(/Nộp bài thành công/).count(), 0);
      assert.ok(
        await f.page.evaluate(() =>
          localStorage.getItem(
            "lingo_course_test_draft_111111111111111111111111_final-test_final",
          ),
        ),
      );
      assert.deepEqual(f.errors, []);
    } finally {
      await f.context.close();
    }
  },
);
