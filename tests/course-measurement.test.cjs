const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const url = process.env.ASSESSMENT_WEB_URL;
let browser;
before(async () => {
  if (!url) return;
  const { chromium } = require(process.env.ASSESSMENT_PLAYWRIGHT_MODULE || 'playwright');
  browser = await chromium.launch({ headless: true, executablePath: process.env.ASSESSMENT_BROWSER_EXECUTABLE });
});
after(async () => { await browser?.close(); });
const ID = '111111111111111111111111';
const skills = ['LISTENING', 'READING', 'SPEAKING', 'WRITING'];
function report(calibrated) {
  const timeline = [60, 70].map((score, i) => ({ attempt_id: String(i), stage: i ? 'Cuối khóa' : 'Chương 1', test_type: i ? 'final-test' : 'challenge', assessed_at: `2026-10-${20+i}T00:00:00Z`, score, skill_scores: Object.fromEntries(skills.map(skill => [skill, skill === 'WRITING' ? 0 : score])) }));
  return { version: '1', timeline, declared_baseline: { score: 650, scale: 'TOEIC_LR_990' }, recommendations: [],
    internal: { baseline: timeline[0], latest: timeline[1], comparable: true, delta: 10, reason: null, skills: skills.map(skill => ({ skill, baseline: skill === 'WRITING' ? 0 : 60, current: skill === 'WRITING' ? 0 : 70, delta: skill === 'WRITING' ? 0 : 10 })) },
    toeic: { rows: ['LISTENING_READING', 'SPEAKING', 'WRITING'].map(skill => ({ skill, baseline: null, current: calibrated ? { score: skill === 'LISTENING_READING' ? 650 : 140, max: skill === 'LISTENING_READING' ? 990 : 200, lower: skill === 'LISTENING_READING' ? 600 : 120, upper: skill === 'LISTENING_READING' ? 700 : 160, profile_version: 'synthetic-browser-fixture' } : null, comparable: false, delta: null, reason: 'Chưa có cặp cùng phương pháp.', baseline_source: null })) } };
}
for (const calibrated of [false, true]) test(`course dashboard separates native scales and preserves zero (calibrated=${calibrated})`, { skip: !url }, async () => {
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  try {
    await context.addInitScript(() => {
      localStorage.setItem('lingosphere_user_info', JSON.stringify({ user_id: 'learner', email: 'fixture@example.test', full_name: 'Learner', role: 'STUDENT', status: 'ACTIVE' }));
      localStorage.setItem('lingosphere_user_access_token', 'fixture');
      localStorage.setItem('i18nextLng', 'vi');
    });
    const page = await context.newPage(), errors = [];
    page.setDefaultTimeout(60000);
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', async route => {
      const request = route.request(), path = new URL(request.url()).pathname;
      if (!['xhr', 'fetch'].includes(request.resourceType()) || path.includes('/_next/') || request.headers().rsc) return route.continue();
      const respond = data => route.fulfill({ contentType: 'application/json', json: { data } });
      if (path.endsWith('/growth-chart')) return respond({ is_baseline_established: true, baseline_evidence: { kind: 'SELF_REPORTED' }, measurement_report: report(calibrated) });
      if (path.endsWith('/enrollment-status')) return respond({ is_enrolled: true });
      if (path.endsWith(`/courses/${ID}`) || path.endsWith(`/courses/${ID}/curriculum`)) return respond({ _id: ID, id: ID, title: 'Measurement fixture', category: 'TOEIC_4_SKILLS', price: 0, skills, modules: [{ _id: 'chapter', title: 'Chapter', order_index: 1, lessons: [{ _id: 'lesson', title: 'Lesson', lesson_type: 'TEXT', content: { text: 'Fixture' } }] }] });
      if (path.includes('/progress/')) return respond({ course_progress: { is_baseline_established: true, progress_percentage: 10 }, module_progress: [], completed_lesson_ids: [] });
      if (path.endsWith('/ai/quota')) return respond({ is_premium: false, chat: { remaining: 5, limit: 5, used: 0 } });
      if (path.includes('/users/profile')) return respond({ profile: { user_id: 'learner', role: 'STUDENT', full_name: 'Learner' } });
      if (path.includes('/auth/')) return respond({ user_id: 'learner', email: 'fixture@example.test', full_name: 'Learner', role: 'STUDENT', status: 'ACTIVE' });
      return respond([]);
    });
    await page.goto(`${url}/course/${ID}`);
    await page.getByRole('button', { name: 'Tiến độ & Tăng trưởng', exact: true }).click();
    await page.getByRole('heading', { name: 'Tiến bộ học tập & TOEIC ước tính' }).waitFor();
    await page.getByText('Mốc TOEIC L&R tự khai: 650/990.', { exact: false }).waitFor();
    assert.equal(await page.getByText(/-580/).count(), 0);
    if (calibrated) {
      assert.equal(await page.getByText('140/200', { exact: true }).count(), 2);
      assert.equal(await page.getByText('650/990', { exact: true }).count(), 1);
    } else assert.equal(await page.getByText('Chưa đủ dữ liệu hiệu chuẩn để ước tính.', { exact: true }).count(), 3);
    await page.getByRole('button', { name: 'Writing', exact: true }).click();
    const chart = page.getByLabel('Biểu đồ Writing', { exact: true });
    assert.equal(await chart.getByText('0/100', { exact: true }).count(), 2);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});
