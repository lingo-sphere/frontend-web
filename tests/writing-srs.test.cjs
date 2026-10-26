const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')
const url = process.env.WRITING_WEB_URL
let browser
before(async () => { if (!url) return; const { chromium } = require(process.env.WRITING_PLAYWRIGHT_MODULE || 'playwright'); browser = await chromium.launch({headless:true,executablePath:process.env.WRITING_BROWSER_EXECUTABLE}) })
after(async () => { await browser?.close() })
const USER={user_id:'learner',email:'writing@example.test',role:'STUDENT',full_name:'Writing learner',status:'ACTIVE'}
const EX='111111111111111111111111', REVIEW='222222222222222222222222', SUB='333333333333333333333333'
const target=(index,kind='GRAMMAR')=>({_id:(index+10).toString(16).padStart(24,'0'),content_id:`GRAMMAR:TARGET_${index}`,status:'PENDING',due_at:new Date(Date.now()-86400000).toISOString(),interval_days:1,writing:{kind,label:kind==='VOCABULARY'?'Thảo luận công việc':`Hòa hợp chủ ngữ ${index}`,label_en:`Subject agreement ${index}`,state:'NEEDS_PRACTICE',original:'She go to work.',corrected:'She goes to work.',explanation:'Chủ ngữ số ít cần động từ phù hợp.',error_count:2,applied_count:0,independent_successes:0,last_exercise_title:'Routine',last_submission_id:SUB,last_observed_at:new Date().toISOString(),context_stats:[{context_id:EX,name:'Công việc',name_en:'Work',errors:2,applications:0,independent_successes:0}]}})
async function fixture(options={}) {
 const context=await browser.newContext({viewport:{width:1440,height:1000}})
 await context.addInitScript(user=>{localStorage.setItem('i18nextLng','vi');localStorage.setItem('lingosphere_user_info',JSON.stringify(user));localStorage.setItem('lingosphere_user_access_token','fixture')},USER)
 const page=await context.newPage();page.setDefaultTimeout(20000)
 const state={rows:options.empty?[]:Array.from({length:15},(_,i)=>target(i,i===1?'VOCABULARY':'GRAMMAR')),failList:false,failPause:false,failSubmit:false,failHint:false,pending:0,failSync:false,expired:false,noCandidate:false,assisted:false,attempts:[],calls:[],...options}
 const exercise={_id:EX,title:'New work routine',exercise_type:'EXPRESS_OPINION',grading_standard:'PRACTICAL',cefr_level:'B1',prompt_text:'Describe her work routine.',min_words:0,max_words:0,status:'PUBLISHED'}
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 const respond=(route,data)=>route.fulfill({contentType:'application/json',json:{data}})
 await page.route('**/*',async route=>{
  const req=route.request(),parsed=new URL(req.url()),path=parsed.pathname
  if(!['fetch','xhr'].includes(req.resourceType())||path.includes('/_next/')||req.headers()['rsc'])return route.continue()
  let body;try{body=req.postDataJSON()}catch{}
  state.calls.push({path,body,method:req.method(),params:Object.fromEntries(parsed.searchParams)})
  const ok=data=>respond(route,data),fail=message=>route.fulfill({status:503,contentType:'application/json',json:{message}})
  if(path.endsWith('/ai/quota'))return ok({is_premium:false,chat:{remaining:5,limit:5,used:0},speaking:{remaining:5},writing:{remaining:5}})
  if(path.endsWith('/auth/me')||path.includes('/profile'))return ok(USER)
  if(path.endsWith('/writing/srs/sync')){if(state.failSync)return fail('Sync unavailable');state.pending=0;return ok({processed:3,remaining:0,retry_needed:false})}
  if(path.endsWith('/writing/srs')){
   if(state.failList)return fail('Review list unavailable')
   let rows=state.rows;const p=parsed.searchParams,status=p.get('status')||'DUE'
   if(status==='DUE')rows=rows.filter(row=>row.status==='PENDING'&&new Date(row.due_at)<=new Date())
   if(status==='PAUSED')rows=rows.filter(row=>row.status==='PAUSED')
   if(status==='STABLE')rows=rows.filter(row=>row.writing.state==='STABLE')
   if(p.get('kind'))rows=rows.filter(row=>row.writing.kind===p.get('kind'))
   if(p.get('search'))rows=rows.filter(row=>row.writing.label.includes(p.get('search')))
   const pageNo=Number(p.get('page')||1),total=rows.length
   return ok({items:rows.slice((pageNo-1)*12,pageNo*12),total,page:pageNo,limit:12,summary:{total:state.rows.length,due:state.rows.filter(row=>row.status==='PENDING').length,stable:0,paused:state.rows.filter(row=>row.status==='PAUSED').length},contexts:state.rows.length?[{_id:EX,name:'Công việc',name_en:'Work',errors:2,applications:0,independent_successes:0}]:[],pending_submissions:state.pending})
  }
  if(path.includes('/writing/srs/targets/')){
   const id=path.split('/targets/')[1].split('/')[0],item=state.rows.find(row=>row._id===id)
   if(path.endsWith('/pause')){if(state.failPause)return fail('Pause unavailable');item.status=body.paused?'PAUSED':'PENDING';return ok({success:true})}
   if(path.endsWith('/start'))return ok({review_session_id:REVIEW,exercise_id:EX})
   return ok({item,can_rewrite:!state.noCandidate,candidates:state.noCandidate?[]:[{id:EX,title:'New work routine',cefr_level:'B1',match:'CONTEXT'}],history:[{submission_id:SUB,exercise_id:EX,created_at:new Date().toISOString(),observations:[{key:item.content_id,outcome:'ERROR',explanation:item.writing.explanation,evidence:[item.writing.original],credited:false,reason:'ERROR'}]}]})
  }
  if(path.includes('/writing/srs/sessions/')){
   if(state.expired)return route.fulfill({status:404,contentType:'application/json',json:{message:'Lượt ôn đã hết hạn'}})
   if(path.endsWith('/hint')){if(state.failHint)return fail('Hint unavailable');state.assisted=true}
   return ok({_id:REVIEW,exercise_id:EX,mode:'TRANSFER',assisted:state.assisted,can_submit:true,expires_at:new Date(Date.now()+86400000).toISOString(),targets:[{id:state.rows[0]._id,key:'GRAMMAR:SUBJECT_VERB_AGREEMENT',kind:'GRAMMAR',label:'Hòa hợp chủ ngữ và động từ',label_en:'Subject–verb agreement',...(state.assisted?{original:'She go',corrected:'She goes',explanation:'Chủ ngữ số ít cần động từ phù hợp.'}:{})}]})
  }
  if(path.endsWith('/writing/submissions/submit')){
   state.attempts.push(body);if(state.failSubmit)return fail('Grading unavailable')
   const scores=Object.fromEntries(['task_achievement','grammatical_accuracy','lexical_resource','coherence','naturalness','register'].map(key=>[`${key}_score`,80]))
   return ok({_id:SUB,user_id:USER.user_id,exercise_id:EX,content:body.user_content,overall_score:80,raw_score:80,max_score:100,grading_version:'writing-v2',grading_standard:'PRACTICAL',status:'COMPLETED',word_count:5,created_at:new Date().toISOString(),writing_srs_version:1,writing_srs_summary:[{key:'GRAMMAR:SUBJECT_VERB_AGREEMENT',outcome:'APPLIED',credited:!state.assisted,reason:state.assisted?'ASSISTED':'INDEPENDENT_TRANSFER'}],...scores,ai_evaluation:{score_reason:'Bài viết rõ.',grammar_errors:[],improved_version:body.user_content}})
  }
  if(path.endsWith('/writing/submissions/my'))return ok({items:[],score_groups:[]})
  if(path.endsWith('/writing/exercises'))return ok([exercise])
  if(path.endsWith(`/writing/exercises/${EX}`))return ok(exercise)
  if(path.includes('/recommendations'))return ok({recommendations:[]})
  return ok([])
 })
 return {context,page,state,errors,open:()=>page.goto(`${url}/practice/mistakes?section=WRITING`)}
}
const browserTest=(name,fn)=>test(name,{skip:!url},fn)
browserTest('Writing tab contains real targets, details, history and persisted filters/pagination',async()=>{
 const f=await fixture();try{
  await f.open();await f.page.getByRole('heading',{name:'Ôn Writing theo lỗi và ngữ cảnh',exact:true}).waitFor()
  assert.equal(await f.page.getByText('Sắp ra mắt',{exact:true}).count(),0)
  await f.page.getByRole('heading',{name:'Hòa hợp chủ ngữ 0',exact:true}).waitFor()
  await f.page.getByRole('button',{name:'Sau',exact:true}).click();await f.page.getByRole('heading',{name:'Hòa hợp chủ ngữ 12',exact:true}).waitFor()
  await f.page.reload();await f.page.getByRole('heading',{name:'Hòa hợp chủ ngữ 12',exact:true}).waitFor()
  await f.page.getByLabel('Nhóm mục tiêu',{exact:true}).selectOption('VOCABULARY');await f.page.getByRole('heading',{name:'Thảo luận công việc',exact:true}).waitFor()
  assert.ok(f.page.url().includes('w_page=1'))
  await f.page.getByRole('button',{name:'Chi tiết & luyện lại',exact:true}).click();const dialog=f.page.getByRole('dialog');await dialog.getByText('Lịch sử bằng chứng gần đây',{exact:true}).waitFor();await dialog.getByText('She goes to work.',{exact:false}).waitFor()
  assert.deepEqual(f.errors,[])
 }finally{await f.context.close()}
})
browserTest('pause errors preserve state; pause/resume persists and due count updates',async()=>{
 const f=await fixture();try{
  await f.open();await f.page.getByRole('heading',{name:'Hòa hợp chủ ngữ 0',exact:true}).waitFor();f.state.failPause=true
  await f.page.getByRole('button',{name:'Tạm dừng',exact:true}).first().click();await f.page.getByRole('alert').filter({hasText:'Pause unavailable'}).waitFor();assert.equal(f.state.rows[0].status,'PENDING')
  f.state.failPause=false;await f.page.getByRole('button',{name:'Tạm dừng',exact:true}).first().click();await f.page.getByRole('heading',{name:'Hòa hợp chủ ngữ 0',exact:true}).waitFor({state:'hidden'})
  await f.page.getByLabel('Trạng thái',{exact:true}).selectOption('PAUSED');await f.page.getByRole('button',{name:'Tiếp tục theo dõi',exact:true}).click();await f.page.reload();await f.page.getByText('Không có mục phù hợp bộ lọc',{exact:true}).waitFor()
  assert.equal(f.state.rows[0].status,'PENDING');assert.deepEqual(f.errors,[])
 }finally{await f.context.close()}
})
browserTest('transfer session records hints, preserves failed submissions and forwards review ID on retry',async()=>{
 const f=await fixture();try{
  await f.open();await f.page.getByRole('button',{name:'Chi tiết & luyện lại',exact:true}).first().click();await f.page.getByRole('button',{name:'Viết bài mới',exact:true}).click()
  await f.page.getByRole('complementary',{name:'Mục tiêu lượt ôn Writing'}).waitFor();const text=f.page.getByPlaceholder('Bắt đầu viết bài của bạn ở đây...');await text.fill('She goes to work every day.')
  f.state.failHint=true;await f.page.getByRole('button',{name:'Xem gợi ý · ghi nhận có hỗ trợ',exact:true}).click();await f.page.getByRole('alert').filter({hasText:'Hint unavailable'}).waitFor();assert.equal(f.state.assisted,false)
  f.state.failHint=false;await f.page.getByRole('button',{name:'Xem gợi ý · ghi nhận có hỗ trợ',exact:true}).click();await f.page.getByRole('button',{name:'Đã dùng gợi ý trong lượt ôn',exact:true}).waitFor()
  await f.page.reload();await f.page.getByRole('button',{name:'Đã dùng gợi ý trong lượt ôn',exact:true}).waitFor();assert.equal(await text.inputValue(),'She goes to work every day.');
  f.state.failSubmit=true;await f.page.getByRole('button',{name:'Nộp bài',exact:true}).click();await f.page.getByRole('alert').filter({hasText:'Nội dung được giữ nguyên'}).waitFor();assert.equal(await text.inputValue(),'She goes to work every day.')
  f.state.failSubmit=false;await f.page.getByRole('button',{name:'Nộp bài',exact:true}).click();await f.page.getByRole('button',{name:'Mở sổ tay Writing',exact:true}).waitFor()
  assert.equal(await f.page.evaluate(key=>localStorage.getItem(key),`writing-review-draft:${USER.user_id}:${REVIEW}:${EX}`),null);
  assert.equal(f.state.attempts.length,2);assert.equal(f.state.attempts[0].review_session_id,REVIEW);assert.equal(f.state.attempts[0].request_id,f.state.attempts[1].request_id)
  assert.deepEqual(f.errors,[])
 }finally{await f.context.close()}
})
browserTest('expired sessions prevent submission and keep writing text',async()=>{
 const f=await fixture({expired:true});try{
  await f.page.goto(`${url}/writing/workspace/${EX}?review_session=${REVIEW}`);await f.page.getByRole('alert').filter({hasText:'Lượt ôn đã hết hạn'}).waitFor()
  await f.page.getByPlaceholder('Bắt đầu viết bài của bạn ở đây...').fill('Keep this response.')
  assert.equal(await f.page.getByRole('button',{name:'Nộp bài',exact:true}).isDisabled(),true);assert.equal(f.state.attempts.length,0);assert.deepEqual(f.errors,[])
 }finally{await f.context.close()}
})
browserTest('empty state is honest; unavailable source/alternatives cannot start a fake review',async()=>{
 const empty=await fixture({empty:true});try{await empty.open();await empty.page.getByText('Chưa có lỗi Writing cần theo dõi',{exact:true}).waitFor();await empty.page.getByText('Mục tiêu được ghi nhận từ bài viết đã chấm.',{exact:false}).waitFor();assert.deepEqual(empty.errors,[])}finally{await empty.context.close()}
 const f=await fixture({noCandidate:true});try{await f.open();await f.page.getByRole('button',{name:'Chi tiết & luyện lại',exact:true}).first().click();await f.page.getByText('Chưa có bài khác phù hợp trong ngân hàng hiện tại.',{exact:false}).waitFor();assert.equal(await f.page.getByRole('button',{name:'Sửa lại bài gốc',exact:true}).isDisabled(),true);assert.deepEqual(f.errors,[])}finally{await f.context.close()}
})
browserTest('list failure shows retry; pending evidence sync can recover without regrading',async()=>{
 const f=await fixture({failList:true,pending:3,failSync:true});try{
  await f.open();await f.page.getByRole('alert').filter({hasText:'Review list unavailable'}).waitFor();f.state.failList=false;await f.page.getByRole('button',{name:'Thử lại',exact:true}).click();await f.page.getByRole('alert').filter({hasText:'Sync unavailable'}).waitFor()
  f.state.failSync=false;await f.page.getByRole('button',{name:'Đồng bộ tiếp',exact:true}).click();await f.page.getByRole('button',{name:'Đồng bộ tiếp',exact:true}).waitFor({state:'hidden'});assert.equal(f.state.attempts.length,0);assert.equal(f.state.pending,0);assert.deepEqual(f.errors,[])
 }finally{await f.context.close()}
})
browserTest('English mobile notebook retains accessible filters and readable details',async()=>{
 const f=await fixture();try{await f.open();await f.page.getByRole('heading',{name:'Ôn Writing theo lỗi và ngữ cảnh',exact:true}).waitFor();await f.page.getByRole('button',{name:'Switch to English',exact:true}).click();await f.page.setViewportSize({width:430,height:900});await f.page.getByRole('heading',{name:'Writing review by error and context',exact:true}).waitFor();await f.page.getByRole('button',{name:'Details & practice',exact:true}).first().click();await f.page.getByRole('dialog').getByText('Recent evidence',{exact:true}).waitFor();const box=await f.page.getByRole('dialog').boundingBox();assert.ok(box.width<=430);assert.deepEqual(f.errors,[])}finally{await f.context.close()}
})
