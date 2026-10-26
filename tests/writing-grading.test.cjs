const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')
const url = process.env.WRITING_WEB_URL
let browser
before(async () => {
  if (!url) return
  const { chromium } = require(process.env.WRITING_PLAYWRIGHT_MODULE || 'playwright')
  browser = await chromium.launch({ headless: true, executablePath: process.env.WRITING_BROWSER_EXECUTABLE })
})
after(async () => { await browser?.close() })
const ID = '111111111111111111111111', SUB = '222222222222222222222222'
const learner = { user_id: 'learner', email: 'writing@example.test', role: 'STUDENT', full_name: 'Writing learner', status: 'ACTIVE' }
const keys = ['task_achievement', 'grammatical_accuracy', 'lexical_resource', 'coherence', 'naturalness', 'register']
async function fixture({ max = 4, legacy = false, fail = false, narrow = false, language = 'vi' } = {}) {
  const context = await browser.newContext({ viewport: { width: narrow ? 430 : 1440, height: 1000 } })
  await context.addInitScript(({ learner, language }) => {
    localStorage.setItem('i18nextLng', language)
    localStorage.setItem('lingosphere_user_info', JSON.stringify(learner))
    localStorage.setItem('lingosphere_user_access_token', 'fixture')
  }, { learner, language })
  const exercise = { _id: ID, title: 'Writing quality fixture', exercise_type: max === 3 ? 'DESCRIBE_PICTURE' : max === 5 ? 'EXPRESS_OPINION' : 'WRITE_EMAIL', grading_standard: 'TOEIC', prompt_text: 'Confirm the time and ask for an agenda.', source_text: 'Can you attend on Monday?', task_requirements: ['Confirm the time.', 'Ask for the agenda.'], cefr_level: 'B1', min_words: 0, max_words: 0, status: 'PUBLISHED' }
  const na = max === 3
  const submission = { _id: SUB, user_id: learner.user_id, exercise_id: ID, content: 'I can attend on Monday. Please send the agenda.', word_count: 10, status: 'COMPLETED', overall_score: 75, created_at: new Date().toISOString(), writing_time_seconds: 12,
    ...(legacy ? {} : { grading_standard: 'TOEIC', grading_version: 'writing-v2', raw_score: Math.min(3, max), max_score: max }),
    ai_evaluation: legacy ? {} : { score_reason: 'Đã phản hồi đúng thời gian; cần thêm chi tiết.', criteria_feedback: Object.fromEntries(keys.map(key => [key, { comment: `Feedback ${key}`, evidence: ['Monday'] }])), grammar_errors: [], improved_version: 'I can attend on Monday. Please send the agenda.', strengths: ['Phản hồi rõ.'], weaknesses: ['Thiếu chi tiết.'], actionable_tips: ['Thêm thời gian cụ thể.'] },
  }
  if (!legacy) for (const key of keys) submission[`${key}_score`] = na && ['coherence', 'register'].includes(key) ? null : 80
  const page = await context.newPage(), state = { fail, attempts: [], saved: false }, errors = []
  page.setDefaultTimeout(20000)
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', async route => {
    const request = route.request(), path = new URL(request.url()).pathname
    if (!['xhr', 'fetch'].includes(request.resourceType()) || path.includes('/_next/') || request.headers()['rsc']) return route.continue()
    const respond = data => route.fulfill({ contentType: 'application/json', json: { data } })
    if (path.endsWith('/ai/quota')) return respond({ is_premium: false, chat: { remaining: 5, limit: 5, used: 0 }, speaking: { remaining: 5 }, writing: { remaining: 5 } })
    if (path.endsWith('/auth/me') || path.includes('/profile')) return respond(learner)
    if (path.endsWith('/writing/submissions/submit')) {
      state.attempts.push(request.postDataJSON())
      if (state.fail) return route.fulfill({ status: 503, contentType: 'application/json', json: { message: 'Grading temporarily unavailable' } })
      state.saved = true
      return respond(submission)
    }
    if (path.endsWith('/writing/submissions/my')) return respond({ items: state.saved || legacy ? [submission] : [], total: state.saved ? 1 : 0, score_groups: [] })
    if (path.endsWith(`/writing/submissions/${SUB}`)) return respond(submission)
    if (path.endsWith('/writing/exercises')) return respond([exercise])
    if (path.endsWith(`/writing/exercises/${ID}`)) return respond(exercise)
    if (path.includes('/recommendations')) return respond({ recommendations: [], user_analysis: {} })
    return respond([])
  })
  return { context, page, state, errors }
}
for (const max of [3, 4, 5]) test(`browser: TOEIC native 0–${max}, six diagnostics, and result reload`, { skip: !url }, async () => {
  const f = await fixture({ max })
  try {
    await f.page.goto(`${url}/writing/result/${SUB}`)
    assert.equal(await f.page.getByLabel('Điểm bài viết', { exact: true }).innerText(), `${Math.min(3, max)}/${max}`)
    const criteria = f.page.getByRole('region', { name: 'Sáu tiêu chí Writing' })
    await criteria.getByText('Feedback naturalness', { exact: true }).waitFor()
    assert.equal(await criteria.getByRole('heading', { level: 3 }).count(), 6)
    if (max === 3) assert.equal(await criteria.getByText('Không áp dụng', { exact: true }).count(), 2)
    await f.page.reload()
    await f.page.getByText(`Feedback register`, { exact: true }).waitFor()
    assert.equal(await f.page.getByLabel('Điểm bài viết', { exact: true }).innerText(), `${Math.min(3, max)}/${max}`)
    assert.deepEqual(f.errors, [])
  } finally { await f.context.close() }
})
test('browser: failed grading preserves text, retries with same request ID, and history uses native score', { skip: !url }, async () => {
  const f = await fixture({ fail: true, narrow: true })
  try {
    await f.page.goto(`${url}/writing/workspace/${ID}`)
    const textarea = f.page.getByPlaceholder('Bắt đầu viết bài của bạn ở đây...')
    await textarea.fill('I can attend on Monday. Please send the agenda.')
    await f.page.getByRole('button', { name: 'Nộp bài', exact: true }).click()
    await f.page.getByRole('alert').filter({ hasText: 'Nội dung được giữ nguyên' }).waitFor()
    assert.equal(await textarea.inputValue(), 'I can attend on Monday. Please send the agenda.')
    f.state.fail = false
    await f.page.getByRole('button', { name: 'Nộp bài', exact: true }).click()
    await f.page.getByLabel('Điểm bài viết', { exact: true }).waitFor()
    assert.equal(f.state.attempts.length, 2)
    assert.equal(f.state.attempts[0].request_id, f.state.attempts[1].request_id)
    assert.match(f.state.attempts[0].request_id, /^[a-f\d-]{36}$/i)
    assert.ok(f.state.attempts[0].time_spent_seconds < 600)
    await f.page.getByRole('button', { name: 'Lịch sử', exact: true }).click()
    await f.page.getByText('3/4', { exact: true }).waitFor()
    assert.deepEqual(f.errors, [])
  } finally { await f.context.close() }
})
test('browser: legacy missing diagnostics remain unavailable in English', { skip: !url }, async () => {
  const f = await fixture({ legacy: true })
  try {
    await f.page.goto(`${url}/writing/result/${SUB}`)
    await f.page.getByLabel('Điểm bài viết', { exact: true }).waitFor()
    await f.page.getByRole('button', { name: 'Switch to English', exact: true }).click()
    await f.page.getByLabel('Writing score', { exact: true }).waitFor()
    assert.equal(await f.page.getByText('Unavailable', { exact: true }).count(), 6)
    assert.equal(await f.page.getByLabel('Writing score', { exact: true }).innerText(), '75/100')
    assert.deepEqual(f.errors, [])
  } finally { await f.context.close() }
})
test('browser: timer expiry submits once with actual elapsed seconds', { skip: !url }, async () => {
  const f = await fixture()
  try {
    await f.page.clock.install()
    await f.page.goto(`${url}/writing/workspace/${ID}`)
    await f.page.getByPlaceholder('Bắt đầu viết bài của bạn ở đây...').fill('I can attend on Monday. Please send the agenda.')
    await f.page.clock.runFor(600000)
    await f.page.getByLabel('Điểm bài viết', { exact: true }).waitFor()
    assert.equal(f.state.attempts.length, 1)
    assert.equal(f.state.attempts[0].time_spent_seconds, 600)
    assert.deepEqual(f.errors, [])
  } finally { await f.context.close() }
})
test('browser: TOEIC-only history does not invent practical averages or weakest skills', { skip: !url }, async () => {
  const f = await fixture()
  try {
    f.state.saved = true
    await f.page.goto(`${url}/writing`)
    await f.page.getByText('Điểm thực tế gần đây', { exact: true }).waitFor()
    assert.ok(await f.page.getByText('—', { exact: true }).count() >= 6)
    assert.equal(await f.page.getByText('Điểm yếu nhất', { exact: false }).count(), 0)
    assert.deepEqual(f.errors, [])
  } finally { await f.context.close() }
})
