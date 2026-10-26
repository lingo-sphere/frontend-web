const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const source = fs.readFileSync(path.join(__dirname, '../src/features/practice/utils/listening.catalog.ts'), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const moduleExports = {}
vm.runInNewContext(compiled, { exports: moduleExports, URLSearchParams })
const { readListeningCatalog: read, listeningCatalogParams: patch } = moduleExports
const params = query => new URLSearchParams(query)
async function eventually(predicate) {
  const deadline = Date.now() + 10000
  while (!(await predicate())) {
    if (Date.now() >= deadline) throw new Error('Expected request/state did not arrive')
    await new Promise(resolve => setTimeout(resolve, 25))
  }
}

test('legacy topic links open Part 1 catalog and retain Context', () => {
  const state = read(params('tab=TOPIC&context_id=work'))
  assert.equal(state.tab, 'PART_1'); assert.equal(state.context, 'work')
  assert.equal(patch(params('tab=TOPIC&context_id=work&topic_name=Work'), {}).toString(), 'tab=PART_1&context_id=work')
})
test('explicit Part wins over legacy exercise type; exercise links map to their own Part', () => {
  assert.equal(read(params('tab=PART_4&exercise_type=PICTURE_DESCRIPTION')).tab, 'PART_4')
  for (const [type, tab] of [['QUESTION_RESPONSE', 'PART_2'], ['SHORT_CONVERSATION', 'PART_3'], ['SHORT_TALK', 'PART_4'], ['DICTATION', 'DICTATION']]) assert.equal(read(params(`exercise_type=${type}`)).tab, tab)
  assert.equal(read(params('part=3')).tab, 'PART_3')
})
test('malformed URL values never reach API filters', () => {
  const state = read(params('tab=__proto__&difficulty=no&cefr_level=C3&subtype=no&page=-1'))
  assert.equal(state.tab, 'PART_1'); assert.equal(state.page, 1); assert.equal(state.subtype, 'ALL'); assert.equal(state.cefr, 'ALL')
})
test('changing Part keeps common filters and resets pagination/subtype', () => {
  const next = patch(params('tab=PART_1&context_id=work&difficulty=EASY&cefr_level=C2&subtype=SCENE&page=5'), { tab: 'PART_2', subtype: 'ALL', page: 1 })
  assert.equal(next.get('context_id'), 'work'); assert.equal(next.get('difficulty'), 'EASY'); assert.equal(next.get('cefr_level'), 'C2'); assert.equal(next.has('page'), false); assert.equal(next.has('subtype'), false)
})
test('unknown link metadata is preserved; obsolete topic metadata is removed', () => {
  const next = patch(params('tab=TOPIC&topic_name=x&utm_source=review'), { context: 'work' })
  assert.equal(next.get('utm_source'), 'review'); assert.equal(next.has('topic_name'), false)
})
test('actual backend subtype values are accepted for all five tabs', () => {
  for (const [tab, subtype] of [['PART_1', 'MULTIPLE_PEOPLE'], ['PART_2', 'SUGGEST'], ['PART_3', 'TECHNICAL'], ['PART_4', 'ADVERTISEMENT']]) assert.equal(read(params(`tab=${tab}&subtype=${subtype}`)).subtype, subtype)
  assert.equal(read(params('tab=DICTATION&subtype=SCENE')).subtype, 'ALL')
})
test('Dictation difficulty filter uses the backend DTO field difficulty_level', async () => {
  const serviceSource = fs.readFileSync(path.join(__dirname, '../src/features/practice/services/listening-practice.service.ts'), 'utf8')
  const code = ts.transpileModule(serviceSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  const exported = {}; let captured
  vm.runInNewContext(code, { exports: exported, require: name => name === '@/services/api.client' ? { api: { get: async (_url, query) => { captured = query; return { items: [] } } } } : { API_CONFIG: { ENDPOINTS: { PRACTICE: { DICTATION_EXERCISES: '/practice/dictation/exercises' } } } } })
  await exported.listeningPracticeService.getDictationExercises({ difficulty: 'EASY', context_id: 'work', cefr_level: 'B1' })
  assert.equal(captured.difficulty_level, 'EASY'); assert.equal(captured.difficulty, undefined)
  assert.equal(captured.context_id, 'work'); assert.equal(captured.cefr_level, 'B1')
})

const url = process.env.LISTENING_WEB_URL
let browser
before(async () => {
  if (!url) return
  const { chromium } = require(process.env.LISTENING_PLAYWRIGHT_MODULE || 'playwright')
  browser = await chromium.launch({ headless: true, executablePath: process.env.LISTENING_BROWSER_EXECUTABLE })
})
after(async () => { await browser?.close() })
const ROOT = '111111111111111111111111', CHILD = '222222222222222222222222', ITEM = '333333333333333333333333'
const learner = { user_id: 'learner', email: 'fixture@example.test', role: 'STUDENT', full_name: 'Fixture', status: 'ACTIVE' }
const contexts = [
  { _id: ROOT, code: 'WORK', name_en: 'Work', name_vi: 'Công việc', level: 0, status: 'ACTIVE' },
  { _id: CHILD, code: 'OFFICE', name_en: 'Office', name_vi: 'Văn phòng', parent_id: ROOT, level: 1, status: 'ACTIVE' },
]
async function fixture(query = '', authenticated = true) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await context.addInitScript(({ learner, authenticated }) => {
    localStorage.setItem('i18nextLng', 'vi')
    if (authenticated) { localStorage.setItem('lingosphere_user_info', JSON.stringify(learner)); localStorage.setItem('lingosphere_user_access_token', 'fixture') }
  }, { learner, authenticated })
const calls = [], state = { failList: false, failContexts: false, failCreate: false, failSubmit: false, failDraft: false, conflictDraft: false, failAudio: false, loseSubmitResponse: false, legacyMedia: false, empty: false }; const sessions = {}, drafts = {}, results = {}
  const page = await context.newPage()
  await page.route('**/*', async route => {
    const request = route.request(), parsed = new URL(request.url()), pathname = parsed.pathname
    if (pathname.includes('/media/stream/') && pathname.endsWith('.wav')) {
      if (state.failAudio) return route.fulfill({ status: 503, body: 'Audio unavailable' })
      const samples = 8000 * 16, wav = Buffer.alloc(44 + samples * 2)
      wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples * 2, 40)
      const range = request.headers().range?.match(/bytes=(\d+)-(\d*)/)
      const start = range ? Number(range[1]) : 0, end = range && range[2] ? Math.min(Number(range[2]), wav.length - 1) : wav.length - 1
      return route.fulfill({ status: range ? 206 : 200, contentType: 'audio/wav', headers: { 'accept-ranges': 'bytes', 'content-length': String(end - start + 1), ...(range ? { 'content-range': `bytes ${start}-${end}/${wav.length}` } : {}) }, body: wav.subarray(start, end + 1) })
    }
    if (pathname.includes('/media/stream/')) return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') })
    if (!['xhr', 'fetch'].includes(request.resourceType()) || pathname.includes('/_next/') || request.headers()['rsc']) return route.continue()
    let body = null
    try { body = request.postDataJSON() } catch { /* Analytics can send compressed payloads. */ }
    calls.push({ path: pathname, params: Object.fromEntries(parsed.searchParams), method: request.method(), body })
    const respond = data => route.fulfill({ contentType: 'application/json', json: { data } })
    const fail = () => route.fulfill({ status: 503, contentType: 'application/json', json: { message: 'Fixture temporary failure' } })
    if (pathname.endsWith('/auth/me')) return respond(learner)
    if (pathname.endsWith('/media/files/444444444444444444444444')) return respond({ storage_key: 'practice/listening/source.wav' })
    if (pathname.endsWith('/media/files/555555555555555555555555')) return respond({ storage_key: 'practice/listening/a.png' })
    if (pathname.endsWith('/dictation/sessions/fixture/hint')) {
      const blank = sessions.dictation.segments.find(row => row.segment_index === body.segment_index).blanks.find(row => row.blank_index === body.blank_index)
      blank.hints_available = Math.max(0, (blank.hints_available ?? 3) - 1); blank.last_hint = 'Gợi ý từ backend'
      return respond({ hint: blank.last_hint, hints_remaining: blank.hints_available })
    }

    if (pathname.endsWith('/ai/quota')) return respond({ is_premium: false, chat: { remaining: 5, limit: 5, used: 0 }, speaking: { remaining: 5 }, writing: { remaining: 5 } })
    if (pathname.endsWith('/courses')) return respond({ result: [], meta: { total: 0, page: 1, limit: 10, pages: 0 } })
    if (pathname.endsWith('/vocabulary/search-history')) return respond({ results: [], total: 0 })
    if (pathname.endsWith('/practice/contexts')) return state.failContexts ? fail() : respond(contexts)
    if (pathname.endsWith('/listening/progress')) return respond(Object.entries(sessions).filter(([kind]) => !results[kind]).map(([kind, session]) => ({ kind, session_id: session.session_id, title: kind === 'dictation' ? 'Dictation' : kind.replace('part', 'Part '), answered: Object.keys(drafts[kind]?.answers || {}).length, total: session.total_questions || session.total_blanks, updated_at: new Date().toISOString() })))
    const progress = pathname.match(/\/listening\/progress\/(part[1-4]|dictation)\/([^/]+)$/)
    if (progress) {
      const kind = progress[1]
      if (request.method() === 'PUT') {
        if (state.failDraft) return fail()
        if (state.conflictDraft || body.expected_revision !== (drafts[kind]?.revision || 0)) return route.fulfill({ status: 409, contentType: 'application/json', json: { message: 'Phiên đã thay đổi ở nơi khác' } })
        drafts[kind] = { ...body, revision: body.expected_revision + 1, status: 'IN_PROGRESS' }
      }
      return respond({ revision: 0, answers: {}, current_index: 0, elapsed_seconds: 0, audio_position: 0, playback_speed: 1, ...drafts[kind], status: results[kind] ? 'COMPLETED' : 'IN_PROGRESS', result: results[kind] || null })
    }
    const partSession = pathname.match(/\/listening\/(part[1-4])\/sessions(?:\/([^/]+))?$/)
    const dictSession = pathname.match(/\/dictation\/sessions(?:\/([^/]+))?(?:\/(submit))?$/)
    const match = partSession || dictSession
    if (match) {
      const kind = partSession ? partSession[1] : 'dictation'
      const action = partSession ? partSession[2] : dictSession[2]
      if (action === 'submit') {
        if (state.failSubmit) return fail()
        const source = sessions[kind]
        results[kind] = kind === 'dictation' ? { score_percent: 100, correct_count: 2, total_blanks: 2, segment_results: [2, 5].map(segment_index => ({ segment_index, text: 'Hello world', answers: [{ blank_index: 0, user_answer: 'Hello', correct_answer: 'Hello', is_correct: true }] })) } : { session_id: source.session_id, total_questions: kind === 'part3' || kind === 'part4' ? 3 : 1, correct_count: kind === 'part3' || kind === 'part4' ? 3 : 1, score_percent: 100, details: (kind === 'part3' || kind === 'part4' ? [0,1,2] : [0]).map(question_index => ({ question_index, question_id: ITEM, user_answer: 'B', correct_answer: 'Option B', transcript: 'A photograph', is_correct: true, explanation_vi: 'Giải thích từ server' })) }
        if (state.loseSubmitResponse) { state.loseSubmitResponse = false; return fail() }
        return respond(results[kind])
      }
      if (request.method() === 'GET') return respond(sessions[kind])
      if (state.failCreate) return fail()
      const options = (kind === 'part2' ? 'ABC' : 'ABCD').split('').map(key => ({ key, text: `Option ${key}` }))
      const raw = { session_id: kind === 'dictation' ? 'dict_fixture' : `session-${kind}`, status: 'IN_PROGRESS', total_time_seconds: kind === 'part1' ? 48 : kind === 'part2' ? 250 : 780, total_questions: kind === 'part3' || kind === 'part4' ? 3 : 1 }
      if (kind === 'part1' || kind === 'part2') raw.questions = [{ question_id: ITEM, question_index: 0, image_url: kind === 'part1' ? 'practice/listening/a.png' : undefined, audio_url: 'practice/listening/source.wav', options }]
      else if (kind === 'dictation') { raw.total_blanks = 2; raw.audio_url = 'practice/listening/source.wav'; raw.segments = [2,5].map(segment_index => ({ segment_index, start_time: segment_index * 2, end_time: segment_index * 2 + 3, preview_text: '[____] world', audio_url: '', blanks: [{ blank_index: 0, is_hidden: true, first_letter: 'H', hints_available: 3 }] })) }
      else raw[kind === 'part3' ? 'conversations' : 'talks'] = [{ [kind === 'part3' ? 'conversation_id' : 'talk_id']: ITEM, title: 'Audio group', audio_url: 'practice/listening/source.wav', questions: [0,1,2].map(question_index => ({ question_index, question_text: `Question ${question_index + 1}`, options })) }]
      if (state.legacyMedia && kind === 'part1') Object.assign(raw.questions[0], { audio_url: '', audio_media_id: '444444444444444444444444', image_url: '', image_media_id: '555555555555555555555555' });
      sessions[kind] = raw; return respond(raw)
    }
    if (pathname.endsWith('/listening/part1') || /\/listening\/part[2-4]\/(questions|conversations|talks)$/.test(pathname) || pathname.endsWith('/dictation/exercises')) {
      if (state.failList) return fail()
      const item = { _id: ITEM, title: 'Fixture exercise', title_vi: 'Bài luyện mẫu', image_url: 'practice/listening/a.png', correct_answer: 'B', question_type: 'WH', transcript: 'Hello', options: 'ABCD'.split('').map(key => ({ key, text: `Option ${key}` })), questions: [], duration_seconds: 10, total_segments: 0, total_words: 0, segments: [] }
      return respond({ items: state.empty ? [] : [item], pagination: { page: Number(parsed.searchParams.get('page') || '1'), limit: 9, total: state.empty ? 0 : 18, totalPages: state.empty ? 0 : 2 } })
    }
    return respond({})
  })
  await page.goto(`${url}/listening${query}`)
  await page.getByRole('combobox', { name: 'Chủ đề', exact: true }).waitFor()
  await page.waitForFunction(() => document.querySelector('select[aria-label="Chủ đề"] option[value="111111111111111111111111"]'), { timeout: 10000 }).catch(async error => { console.error('Fixture requests:', calls); console.error((await page.locator('body').innerText()).slice(-2500)); throw error })
  return { page, context, calls, state, sessions, drafts, results }
}
const ui = (name, fn) => test(`browser: ${name}`, { skip: !url, timeout: 90000 }, async () => {
  const fixtureState = await fixture()
  try { await fn(fixtureState) } finally { await fixtureState.context.close() }
})
ui('five tabs; old topic link maps to Part 1 without opening a session', async ({ page, calls }) => {
  await page.goto(`${url}/listening?tab=TOPIC&context_id=${ROOT}&topic_name=Work`)
  await page.waitForURL(/tab=PART_1/)
  assert.equal(await page.getByRole('button', { name: /Part [1-4]:/ }).count(), 4)
  assert.equal(await page.getByRole('button', { name: /Luyện theo chủ đề/ }).count(), 0)
  assert.equal(calls.filter(call => call.path.includes('/sessions')).length, 0)
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().waitFor()
})
ui('Context is sent to all five lists and subtype filters use real enum values', async ({ page, calls }) => {
  await page.getByRole('combobox', { name: 'Chủ đề', exact: true }).selectOption(ROOT)
  for (const [name, endpoint] of [[/Part 1:/, '/listening/part1'], [/Part 2:/, '/part2/questions'], [/Part 3:/, '/part3/conversations'], [/Part 4:/, '/part4/talks'], [/Nghe chép chính tả/, '/dictation/exercises']]) {
    await page.getByRole('button', { name }).first().click()
    await page.waitForFunction(() => !document.querySelector('main .animate-pulse'))
    await eventually(() => calls.some(call => call.path.endsWith(endpoint) && call.params.context_id === ROOT))
  }
  await page.getByRole('button', { name: /Part 2:/ }).click()
  await page.getByRole('combobox', { name: 'Phân loại' }).selectOption('TAG')
  await page.waitForURL(/subtype=TAG/)
  await eventually(() => calls.some(call => call.params.question_type === 'TAG'))
})
ui('filter changes reset page; reload and browser Back restore the catalog', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Chủ đề', exact: true }).selectOption(CHILD)
  await page.getByRole('button', { name: 'Sau', exact: true }).click()
  await page.waitForURL(/page=2/)
  await page.getByRole('combobox', { name: 'Độ khó', exact: true }).selectOption('EASY')
  await page.waitForURL(/difficulty=EASY/)
  assert.equal(new URL(page.url()).searchParams.has('page'), false)
  await page.reload()
  assert.equal(await page.getByRole('combobox', { name: 'Độ khó', exact: true }).inputValue(), 'EASY')
  await page.goBack()
  await page.waitForURL(/page=2/)
  await page.waitForFunction(() => document.querySelector('select[aria-label="Độ khó"]')?.value === 'ALL')
  assert.equal(await page.getByRole('combobox', { name: 'Độ khó', exact: true }).inputValue(), 'ALL')
})
ui('API failure has retry; empty results have a distinct state; clear removes Context', async ({ page, state }) => {
  state.failList = true
  await page.getByRole('combobox', { name: 'Độ khó', exact: true }).selectOption('HARD')
  await page.getByRole('alert').filter({ hasText: 'Không tải được bài tập' }).waitFor()
  state.failList = false; state.empty = true
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click()
  await page.getByText('Chưa tìm thấy bài tập nào', { exact: true }).waitFor()
  state.empty = false
  await page.getByRole('combobox', { name: 'Chủ đề', exact: true }).selectOption(ROOT)
  await page.getByRole('button', { name: 'Xóa bộ lọc', exact: true }).click()
  await page.waitForURL(current => !current.searchParams.has('context_id') && !current.searchParams.has('difficulty'))
})
ui('selected Part 1 creates the exact exercise session and saves backend result; failed submit retains answer', async ({ page, calls, state }) => {
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.getByRole('button', { name: 'B', exact: true }).waitFor()
  assert.deepEqual(calls.find(call => call.path.endsWith('/part1/sessions')).body.exercise_ids, [ITEM])
  await page.getByRole('button', { name: 'B', exact: true }).click()
  state.failSubmit = true
  await page.getByRole('button', { name: 'Nộp bài', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'Fixture temporary failure' }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'B', exact: true }).getAttribute('aria-pressed'), 'true')
  state.failSubmit = false
  await page.getByRole('button', { name: 'Nộp bài', exact: true }).click()
  await page.getByRole('heading', { name: /Kết quả đã lưu: 100%/ }).waitFor()
  await page.getByText('Giải thích từ server', { exact: true }).waitFor()
})
ui('random Part 1 includes common filters and picture type; start failure can retry', async ({ page, calls, state }) => {
  await page.getByRole('combobox', { name: 'Chủ đề', exact: true }).selectOption(ROOT)
  await page.getByRole('combobox', { name: 'Phân loại' }).selectOption('SCENE')
  await page.getByRole('button', { name: 'Luyện ngẫu nhiên Part 1', exact: true }).click()
  state.failCreate = true
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'Fixture temporary failure' }).waitFor()
  state.failCreate = false
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.getByRole('button', { name: 'B', exact: true }).waitFor()
  const creation = calls.filter(call => call.path.endsWith('/part1/sessions')).at(-1).body
  assert.equal(creation.context_id, ROOT); assert.equal(creation.picture_type, 'SCENE'); assert.equal(creation.exercise_ids, undefined)
})
ui('narrow viewport keeps filters usable and opening/back preserves Context', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('combobox', { name: 'Chủ đề', exact: true }).selectOption(CHILD)
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  await page.getByRole('button', { name: 'Quay lại', exact: true }).click()
  assert.equal(await page.getByRole('combobox', { name: 'Chủ đề', exact: true }).inputValue(), CHILD)
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
  fs.mkdirSync(path.join(__dirname, '../.tmp'), { recursive: true })
  await page.screenshot({ path: path.join(__dirname, '../.tmp/listening-catalog-mobile.png'), fullPage: true })
})
ui('timer expires once and leaves submission available', async ({ page, calls }) => {
  await page.clock.install()
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.getByRole('button', { name: 'B', exact: true }).waitFor()
  await page.clock.runFor(50000)
  assert.equal(await page.getByRole('button', { name: 'B', exact: true }).isDisabled(), true)
  await page.getByRole('status').filter({ hasText: 'Hết thời gian' }).waitFor()
  await page.getByRole('button', { name: 'Nộp bài', exact: true }).click()
  await page.getByRole('heading', { name: /Kết quả đã lưu/ }).waitFor()
  assert.equal(calls.find(call => call.path.endsWith('/sessions/submit')).body.total_time_seconds, 48)
})
ui('Context loading failure offers retry without clearing the selected filter', async ({ page, state }) => {
  await page.getByRole('combobox', { name: 'Chủ đề', exact: true }).selectOption(CHILD)
  state.failContexts = true
  await page.reload()
  await page.getByRole('alert').filter({ hasText: 'Không tải được chủ đề' }).waitFor()
  state.failContexts = false
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('select[aria-label="Chủ đề"] option[value="222222222222222222222222"]')?.textContent.includes('Văn phòng'))
  assert.equal(await page.getByRole('combobox', { name: 'Chủ đề', exact: true }).inputValue(), CHILD)
})
test('browser: guest start asks for login without creating a session', { skip: !url, timeout: 90000 }, async () => {
  const { page, calls, context } = await fixture('', false)
  try {
    await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
    await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
    await page.waitForURL(/\/login/)
    assert.equal(calls.some(call => call.path.endsWith('/part1/sessions')), false)
  } finally { await context.close() }
})

for (const part of [2, 3, 4]) ui(`Part ${part} persists a whole audio group, resumes after reload and grades on server`, async ({ page, calls }) => {
  await page.getByRole('button', { name: new RegExp(`Part ${part}:`) }).click()
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.waitForURL(/session_id=/)
  const groups = page.locator('fieldset')
  assert.equal(await groups.count(), part === 2 ? 1 : 3)
  for (const field of await groups.all()) await field.getByRole('button', { name: /^B(?:\.|$)/ }).click()
  await page.getByText('Đã lưu tiến độ', { exact: true }).waitFor()
  await page.reload()
  await page.locator('fieldset').first().waitFor()
  for (const field of await page.locator('fieldset').all()) assert.equal(await field.getByRole('button', { name: /^B(?:\.|$)/ }).getAttribute('aria-pressed'), 'true')
  await page.getByRole('button', { name: 'Nộp bài', exact: true }).click()
  await page.getByRole('heading', { name: /Kết quả đã lưu: 100%/ }).waitFor()
  const submitted = calls.find(call => call.path.endsWith(`/part${part}/sessions/submit`)).body
  assert.ok(Number.isInteger(submitted.expected_draft_revision) && submitted.expected_draft_revision >= 1)
  assert.deepEqual(Object.keys(submitted.answers).sort(), part === 2 ? ['0'] : ['0_0', '0_1', '0_2'])
})
ui('Dictation plays bounded real audio and preserves noncontiguous segment answers across reload', async ({ page, calls }) => {
  await page.getByRole('button', { name: /Nghe chép chính tả/ }).first().click()
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.getByRole('textbox', { name: 'Ô 1', exact: true }).waitFor()
  await page.waitForFunction(() => { const audio = document.querySelector('main audio'); return audio && audio.readyState >= 1 && audio.currentTime >= 4 }, undefined, { timeout: 8000 }).catch(async error => { console.error('Audio state:', await page.locator('main audio').evaluate(audio => ({ ready: audio.readyState, time: audio.currentTime, duration: audio.duration, error: audio.error?.message, src: audio.src }))); throw error })
  await page.locator('main audio').evaluate(audio => audio.play())
  await page.waitForFunction(() => document.querySelector('main audio')?.currentTime > 4.05)
  await page.locator('main audio').evaluate(audio => { audio.currentTime = 7.2; audio.dispatchEvent(new Event('timeupdate')) })
  assert.ok(await page.locator('main audio').evaluate(audio => audio.paused && audio.currentTime <= 7.01))
  await page.getByRole('textbox', { name: 'Ô 1', exact: true }).fill('Hello')
  await page.getByRole('button', { name: 'Câu tiếp', exact: true }).click()
  await page.getByRole('textbox', { name: 'Ô 1', exact: true }).fill('Hello')
  await page.waitForFunction(() => document.querySelector('main audio')?.readyState >= 1)
  await page.locator('main audio').evaluate(audio => { audio.currentTime = 11.25; audio.dispatchEvent(new Event('timeupdate')) })
  await page.getByRole('combobox', { name: 'Tốc độ', exact: true }).selectOption('0.75')
  await page.getByText('Đã lưu tiến độ', { exact: true }).waitFor()
  await page.reload()
  await page.getByRole('textbox', { name: 'Ô 1', exact: true }).waitFor()
  assert.equal(await page.getByRole('textbox', { name: 'Ô 1', exact: true }).inputValue(), 'Hello')
  assert.equal(await page.getByRole('combobox', { name: 'Tốc độ', exact: true }).inputValue(), '0.75')
  await page.waitForFunction(() => { const audio = document.querySelector('main audio'); return audio?.readyState >= 1 && audio.currentTime >= 11.2 && audio.currentTime <= 11.3 })
  await page.getByRole('button', { name: 'Nộp bài', exact: true }).click()
  await page.getByRole('heading', { name: /Kết quả đã lưu: 100%/ }).waitFor()
  assert.deepEqual(calls.find(call => call.path.endsWith('/dictation/sessions/fixture/submit')).body.final_answers.map(row => [row.segment_index, row.blank_index]), [[2, 0], [5, 0]])
})
ui('save-and-back lists a resumable session and restores selected answers', async ({ page }) => {
  await page.getByRole('button', { name: /Part 2:/ }).click()
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.getByRole('button', { name: 'B', exact: true }).click()
  await page.getByRole('button', { name: 'Lưu và quay lại', exact: true }).click()
  await page.getByRole('region', { name: 'Phiên đang làm', exact: true }).getByRole('button', { name: /Part 2/ }).click()
  await page.getByRole('button', { name: 'B', exact: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'B', exact: true }).getAttribute('aria-pressed'), 'true')
})
ui('draft failure keeps answers, retries explicitly and cannot silently leave', async ({ page, state }) => {
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  state.failDraft = true
  await page.getByRole('button', { name: 'B', exact: true }).click()
  await page.getByText('Chưa đồng bộ được tiến độ', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Lưu và quay lại', exact: true }).click()
  assert.ok(new URL(page.url()).searchParams.has('session_id'))
  assert.equal(await page.getByRole('button', { name: 'B', exact: true }).getAttribute('aria-pressed'), 'true')
  state.failDraft = false
  await page.getByRole('button', { name: 'Lưu lại', exact: true }).click()
  await page.getByText('Đã lưu tiến độ', { exact: true }).waitFor()
})
ui('conflicting draft requires loading the server version without overwriting it', async ({ page, state, drafts }) => {
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.getByRole('button', { name: 'B', exact: true }).click()
  await page.getByText('Đã lưu tiến độ', { exact: true }).waitFor()
  drafts.part1 = { ...drafts.part1, revision: drafts.part1.revision + 1, answers: { '0': 'C' } }
  await page.getByRole('button', { name: 'A', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'Phiên đã thay đổi' }).waitFor()
  await page.getByRole('button', { name: 'Tải bản đã lưu', exact: true }).click()
  await page.getByRole('button', { name: 'C', exact: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'C', exact: true }).getAttribute('aria-pressed'), 'true')
})
ui('reload of completed session displays cached result without resubmitting', async ({ page, calls }) => {
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.getByRole('button', { name: 'B', exact: true }).click()
  await page.getByRole('button', { name: 'Nộp bài', exact: true }).click()
  await page.getByRole('heading', { name: /Kết quả đã lưu/ }).waitFor()
  await page.reload()
  await page.getByRole('heading', { name: /Kết quả đã lưu/ }).waitFor()
  assert.equal(calls.filter(call => call.path.endsWith('/part1/sessions/submit')).length, 1)
})
for (const part of [2,3,4]) ui(`random Part ${part} sends the selected Context and category without mixing Parts`, async ({ page, calls }) => {
  await page.getByRole('button', { name: new RegExp(`Part ${part}:`) }).click()
  await page.getByRole('combobox', { name: 'Chủ đề', exact: true }).selectOption(ROOT)
  const value = part === 2 ? 'TAG' : part === 3 ? 'TECHNICAL' : 'ADVERTISEMENT'
  await page.getByRole('combobox', { name: 'Phân loại', exact: true }).selectOption(value)
  await page.getByRole('button', { name: `Luyện ngẫu nhiên Part ${part}`, exact: true }).click()
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.locator('fieldset').first().waitFor()
  const body = calls.find(call => call.path.endsWith(`/part${part}/sessions`)).body
  assert.equal(body.context_id, ROOT)
  assert.deepEqual(body[part === 2 ? 'question_types' : part === 3 ? 'conversation_types' : 'talk_types'], [value])
  assert.equal(body.exercise_ids, undefined)
})
ui('a lost final response recovers the committed result without sending another submit', async ({ page, state, calls }) => {
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.getByRole('button', { name: 'B', exact: true }).click()
  state.loseSubmitResponse = true
  await page.getByRole('button', { name: 'Nộp bài', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'Fixture temporary failure' }).waitFor()
  await page.getByRole('button', { name: 'Nộp bài', exact: true }).click()
  await page.getByRole('heading', { name: /Kết quả đã lưu/ }).waitFor()
  assert.equal(calls.filter(call => call.path.endsWith('/part1/sessions/submit')).length, 1)
})
ui('an unsynced local draft survives a forced reload and can retry saving', async ({ page, state }) => {
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  state.failDraft = true
  await page.getByRole('button', { name: 'B', exact: true }).click()
  await page.getByText('Chưa đồng bộ được tiến độ', { exact: true }).waitFor()
  page.once('dialog', dialog => dialog.accept())
  await page.reload()
  await page.getByRole('button', { name: 'B', exact: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'B', exact: true }).getAttribute('aria-pressed'), 'true')
  state.failDraft = false
  await page.getByRole('button', { name: 'Lưu và quay lại', exact: true }).click()
  await page.getByRole('region', { name: 'Phiên đang làm', exact: true }).waitFor()
})
ui('audio failure displays a retry and actual metadata loads after recovery', async ({ page, state }) => {
  await page.getByRole('button', { name: /Part 2:/ }).click()
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  state.failAudio = true
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'Không tải được audio' }).waitFor()
  state.failAudio = false
  await page.getByRole('button', { name: 'Thử lại audio', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('main audio')?.readyState >= 1)
  assert.ok(await page.locator('main audio').evaluate(audio => audio.duration === 16))
})
ui('Part 3 practice remains usable at a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: /Part 3:/ }).click()
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.locator('fieldset').first().waitFor()
  assert.equal(await page.locator('fieldset').count(), 3)
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
  fs.mkdirSync(path.join(__dirname, '../.tmp'), { recursive: true })
  await page.screenshot({ path: path.join(__dirname, '../.tmp/listening-lifecycle-mobile.png'), fullPage: true })
})
ui('Dictation hints come from the server and remain visible after reload', async ({ page, calls }) => {
  await page.getByRole('button', { name: /Nghe chép chính tả/ }).first().click()
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.getByRole('button', { name: 'Gợi ý ô 1', exact: true }).click()
  await page.getByText('Gợi ý từ backend', { exact: true }).waitFor()
  assert.deepEqual(calls.find(call => call.path.endsWith('/dictation/sessions/fixture/hint')).body, { segment_index: 2, blank_index: 0 })
  await page.getByRole('textbox', { name: 'Ô 1', exact: true }).fill('Hello')
  await page.getByText('Đã lưu tiến độ', { exact: true }).waitFor()
  await page.reload()
  await page.getByText('Gợi ý từ backend', { exact: true }).waitFor()
  assert.ok((await page.getByRole('button', { name: 'Gợi ý ô 1', exact: true }).innerText()).includes('2'))
})
ui('legacy media IDs resolve metadata to storage keys for image and playable audio', async ({ page, state, calls }) => {
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  state.legacyMedia = true
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('main audio')?.readyState >= 1)
  await page.waitForFunction(() => document.querySelector('main img')?.naturalWidth > 0)
  assert.ok(calls.some(call => call.path.endsWith('/media/files/444444444444444444444444')))
  assert.ok(calls.some(call => call.path.endsWith('/media/files/555555555555555555555555')))
  assert.ok((await page.locator('main audio').getAttribute('src')).endsWith('/media/stream/practice/listening/source.wav'))
})
ui('browser Back leaves the practice workspace and Forward restores the saved session', async ({ page }) => {
  await page.getByRole('button', { name: /Part 2:/ }).click()
  await page.getByRole('button', { name: /Luyện tập ngay/ }).first().click()
  await page.getByRole('button', { name: 'Bắt đầu luyện', exact: true }).click()
  await page.getByRole('button', { name: 'B', exact: true }).click()
  await page.getByText('Đã lưu tiến độ', { exact: true }).waitFor()
  await page.goBack()
  await page.getByRole('combobox', { name: 'Chủ đề', exact: true }).waitFor()
  assert.equal(new URL(page.url()).searchParams.has('session_id'), false)
  await page.goForward()
  await page.getByRole('button', { name: 'B', exact: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'B', exact: true }).getAttribute('aria-pressed'), 'true')
})
