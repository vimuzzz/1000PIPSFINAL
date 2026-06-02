
import React,{useEffect,useState} from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'

const API_URL='https://one000pips-backend.onrender.com'
const PAYPAL_EMAIL='vimu1113@gmail.com'
const SKRILL_EMAIL='vimu1113@gmail.com'
const BINANCE_PAY_ID='41356322'
const TELEGRAM_FREE='https://t.me/ForexHubbSignals'
const WHATSAPP_CONTACT='https://wa.me/94781170977'
const TELEGRAM_CONTACT='https://t.me/pips1000x'
const TRUSTPILOT_LINK='https://www.trustpilot.com/review/1000pipsfx.com'
const INSTAGRAM_LINK='https://www.instagram.com/1000pips?igsh=MTE3Nm85bHlubWFheg=='
const FACEBOOK_LINK='https://www.facebook.com/share/1Crxa8YCs8/'

function getToken(){ return localStorage.getItem('token') }
async function api(path, options={}){
  const isForm = options.body instanceof FormData
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers:{ ...(isForm?{}:{'Content-Type':'application/json'}), ...(getToken()?{Authorization:`Bearer ${getToken()}`}:{}) , ...(options.headers||{}) }
  })
  const data = await res.json().catch(()=>({}))
  if(!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

function getPlanPrice(plan){
  if(String(plan).includes('$400')) return 400
  if(String(plan).includes('$100')) return 100
  if(String(plan).includes('$45')) return 45
  return 0
}

function formatDate(d){ return d?new Date(d).toLocaleDateString():'Lifetime' }
function vipDaysNumber(days){ if(days==='Lifetime' || days===undefined || days===null || days==='') return null; const n=Number(days); return Number.isFinite(n)?n:null }
function isExpiringSoon(days){ const n=vipDaysNumber(days); return n!==null && n>=0 && n<=3 }
function isExpiringThisWeek(days){ const n=vipDaysNumber(days); return n!==null && n>=0 && n<=7 }
function formatDateTime(d){ return d?new Date(d).toLocaleString():'Not available' }
function startOfWeek(d=new Date()){
  const date=new Date(d)
  const day=date.getDay()
  const diff=(day===0?-6:1-day)
  date.setHours(0,0,0,0)
  date.setDate(date.getDate()+diff)
  return date
}
function getWeeklyWindow(){
  const currentStart=startOfWeek(new Date())
  const lastStart=new Date(currentStart)
  lastStart.setDate(currentStart.getDate()-7)
  const nextStart=new Date(currentStart)
  nextStart.setDate(currentStart.getDate()+7)
  return {currentStart,lastStart,nextStart}
}
function isDateThisOrLastWeek(dateValue){
  if(!dateValue) return false
  const d=new Date(dateValue)
  if(Number.isNaN(d.getTime())) return false
  const {lastStart,nextStart}=getWeeklyWindow()
  return d>=lastStart && d<nextStart
}
function isRunningTrade(trade){
  const label=signalStatusLabel(trade.status, trade.resultPips).toLowerCase()
  return label==='running' || ['active','running','open'].includes(String(trade.status||'').toLowerCase())
}
function isTradeVisibleThisOrLastWeek(trade){
  if(isRunningTrade(trade)) return true
  return isDateThisOrLastWeek(trade.updatedAt || trade.closedAt || trade.createdAt)
}
function weekGroupLabel(dateValue){
  if(!dateValue) return 'Older'
  const d=new Date(dateValue)
  const {currentStart,lastStart,nextStart}=getWeeklyWindow()
  if(d>=currentStart && d<nextStart) return 'This Week'
  if(d>=lastStart && d<currentStart) return 'Last Week'
  return 'Older'
}
function visibleWeeklyAnalysis(posts=[]){
  return (Array.isArray(posts)?posts:[]).filter(p=>isDateThisOrLastWeek(p.createdAt || p.updatedAt))
}

function signalStatusLabel(status, resultPips){
  const s=String(status||'active').toLowerCase()
  if(['active','running','open'].includes(s)) return 'RUNNING'
  if(s==='tp1') return 'TP1 HIT'
  if(['tp2','tp'].includes(s)) return 'TP2 HIT'
  if(s==='sl') return 'SL HIT'
  if(s==='breakeven') return 'BREAK EVEN'
  if(s==='closed') return 'CLOSED'
  const n=Number(resultPips||0)
  if(n>0) return 'TP2 HIT'
  if(n<0) return 'SL HIT'
  return 'RUNNING'
}
function signalStatusClass(status, resultPips){
  const label=signalStatusLabel(status,resultPips).toLowerCase().replace(/\s+/g,'-')
  return label
}
function tradeFilterMatch(trade, filter){
  if(!filter || filter==='all') return true
  const key=String(filter).toLowerCase()
  const statusLabel=signalStatusLabel(trade.status, trade.resultPips).toLowerCase().replace(/\s+/g,'-')
  const category=String(trade.category||'').toLowerCase()
  const pair=String(trade.pair||'').toLowerCase()
  const marketMap={
    gold: category.includes('gold') || pair.includes('xau') || pair.includes('gold'),
    forex: category.includes('forex') || ['gbp','eur','usd','jpy','aud','nzd','cad','chf'].some(x=>pair.includes(x)) && !pair.includes('xau'),
    us30: category.includes('indices') || pair.includes('us30') || pair.includes('dow'),
    oil: category.includes('oil') || pair.includes('oil') || pair.includes('ukoil') || pair.includes('usoil'),
    crypto: category.includes('crypto') || ['btc','eth','sol','xrp','doge','bnb'].some(x=>pair.includes(x))
  }
  if(marketMap[key]!==undefined) return marketMap[key]
  if(key==='running') return statusLabel==='running'
  if(key==='tp1') return statusLabel==='tp1-hit'
  if(key==='tp2') return statusLabel==='tp2-hit'
  if(key==='sl') return statusLabel==='sl-hit'
  if(key==='be') return statusLabel==='break-even'
  if(key==='closed') return statusLabel==='closed'
  return true
}
function filterCount(trades, key){ return trades.filter(t=>tradeFilterMatch(t,key)).length }
function tradeStatusFromPips(pips){ const n=Number(pips); if(n>0) return 'tp2'; if(n<0) return 'sl'; return 'breakeven' }
function formatPercent(value){ const n=Number(value||0); if(!Number.isFinite(n)||n===0) return '0%'; return `${n>0?'+':''}${n}%` }
function optionalPercent(value){ const n=Number(value||0); if(!Number.isFinite(n)||n===0) return ''; return `${n>0?'+':''}${n}%` }
function VipBadge({user}){ if(!user) return null; if(user.vip && isExpiringSoon(user.daysRemaining)) return <div className="warningBadge">VIP expires in {user.daysRemaining} day{Number(user.daysRemaining)===1?'':'s'} · Renew soon</div>; if(user.vip) return <div className="vipBadge">VIP Active · {user.daysRemaining==='Lifetime'?'Lifetime':`${user.daysRemaining} days left`}</div>; if(user.status==='expired') return <div className="expiredBadge">VIP Expired</div>; return <div className="pendingBadge">Status: {user.status||'Not Paid'}</div> }
function imgSrcFromPost(post){ return post.chartImageData ? `data:${post.chartImageMime};base64,${post.chartImageData}` : '' }
function imgSrcFromProof(proof){ return proof.proofImageData ? `data:${proof.proofImageMime};base64,${proof.proofImageData}` : '' }
function analysisUpdateStatusLabel(status='updated'){
  const map={running:'Running According To Analysis',target_hit:'Target Hit',invalidated:'Invalidated By News / Market Change',failed:'Analysis Failed',updated:'Analysis Updated'}
  return map[String(status||'updated')] || 'Analysis Updated'
}
function analysisUpdateStatusIcon(status='updated'){
  const map={running:'🟡',target_hit:'✅',invalidated:'⚠️',failed:'🔴',updated:'📌'}
  return map[String(status||'updated')] || '📌'
}


function pickWeeklyHighlightTrades(trades=[], limit=5){
  return [...(Array.isArray(trades)?trades:[])]
    .filter(t=>String(t.status||'').toLowerCase()!=='active' && String(t.status||'').toLowerCase()!=='running')
    .sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0))
    .slice(0,limit)
}
function drawCanvasRoundRect(ctx,x,y,w,h,r,fill){
  const radius=Math.min(r,w/2,h/2)
  ctx.beginPath()
  ctx.moveTo(x+radius,y)
  ctx.arcTo(x+w,y,x+w,y+h,radius)
  ctx.arcTo(x+w,y+h,x,y+h,radius)
  ctx.arcTo(x,y+h,x,y,radius)
  ctx.arcTo(x,y,x+w,y,radius)
  ctx.closePath()
  if(fill) ctx.fill()
}
function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines=4){
  const words=String(text||'').split(/\s+/).filter(Boolean)
  let line=''
  let lines=[]
  words.forEach(word=>{
    const test=line?line+' '+word:word
    if(ctx.measureText(test).width>maxWidth && line){
      lines.push(line)
      line=word
    }else line=test
  })
  if(line) lines.push(line)
  const finalLines=lines.slice(0,maxLines)
  if(lines.length>maxLines && finalLines.length){
    let last=finalLines[finalLines.length-1]
    while(ctx.measureText(last+'…').width>maxWidth && last.length>0) last=last.slice(0,-1)
    finalLines[finalLines.length-1]=last+'…'
  }
  finalLines.forEach((ln,i)=>ctx.fillText(ln,x,y+(i*lineHeight)))
  return y + (finalLines.length*lineHeight)
}

function cleanReportText(text=''){
  return String(text||'')
    .replace(/<br\s*\/?>/gi,'\n')
    .replace(/<\/p>/gi,'\n')
    .replace(/<[^>]+>/g,'')
    .replace(/&nbsp;/g,' ')
    .replace(/&amp;/g,'&')
    .replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'")
}

function buildWeeklyReportText(report,trades=[]){
  if(report?.reportText) return cleanReportText(report.reportText)
  const stats=report?.stats||{}
  const highlights=pickWeeklyHighlightTrades(trades,5)
  const lines=[
    '1000PIPS PERFORMANCE REPORT',
    `Weekly Pips: ${stats.weeklyPips ?? 0}`,
    `Weekly Account Growth: ${formatPercent(stats.weeklyGainPercent)}`,
    `Total Risk Taken: ${Number(stats.weeklyRiskPercent || 0)}%`,
    `Win Rate: ${stats.winRate ?? 0}%`,
    `Wins: ${stats.wins ?? 0}`,
    `Losses: ${stats.losses ?? 0}`,
    `Total Pips: ${stats.totalPips ?? 0}`,
    ''
  ]
  if(highlights.length){
    lines.push('Recent Trade Updates:')
    highlights.forEach(t=>{
      const p=Number(t.resultPips||0)
      lines.push(`• ${t.pair} ${t.direction} - ${signalStatusLabel(t.status,t.resultPips)} (${p>0?'+':''}${p} pips${optionalPercent(t.resultPercent)?`, ${optionalPercent(t.resultPercent)}`:''})`)
    })
  }
  lines.push('', 'Trade with proper risk management.')
  return lines.join('\n')
}
async function copyTextToClipboard(text){
  if(navigator?.clipboard?.writeText) return navigator.clipboard.writeText(text)
  const area=document.createElement('textarea')
  area.value=text
  document.body.appendChild(area)
  area.select()
  document.execCommand('copy')
  document.body.removeChild(area)
}
function downloadWeeklyPerformancePoster(report,trades=[],format='portrait'){
  if(!report) return
  const stats=report.stats||{}
  const presets={
    square:{width:1080,height:1080,label:'instagram-square',highlights:3,summaryLines:7},
    portrait:{width:1080,height:1350,label:'telegram-portrait',highlights:4,summaryLines:10},
    status:{width:1080,height:1920,label:'whatsapp-status',highlights:5,summaryLines:14}
  }
  const preset=presets[format] || presets.portrait
  const highlights=pickWeeklyHighlightTrades(trades,preset.highlights)
  const canvas=document.createElement('canvas')
  canvas.width=preset.width
  canvas.height=preset.height
  const ctx=canvas.getContext('2d')
  const W=canvas.width, H=canvas.height
  const margin=Math.round(W*0.065)
  const contentWidth=W-(margin*2)
  const gap=Math.round(W*0.018)
  const cardW=Math.floor((contentWidth-gap)/2)
  const cardH=format==='status'?130:118
  const gradient=ctx.createLinearGradient(0,0,W,H)
  gradient.addColorStop(0,'#050816')
  gradient.addColorStop(0.55,'#0b1223')
  gradient.addColorStop(1,'#04120b')
  ctx.fillStyle=gradient
  ctx.fillRect(0,0,W,H)
  ctx.fillStyle='rgba(0,255,163,0.08)'
  ctx.beginPath(); ctx.arc(W-120,170,160,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='rgba(255,215,0,0.06)'
  ctx.beginPath(); ctx.arc(130,H-170,150,0,Math.PI*2); ctx.fill()

  let y=86
  ctx.fillStyle='#00f59b'
  ctx.font='700 34px Arial'
  ctx.fillText('1000PIPS',margin,y)
  y+=38
  ctx.fillStyle='#ffffff'
  ctx.font=format==='square'?'700 56px Arial':'700 62px Arial'
  ctx.fillText('WEEKLY PERFORMANCE',margin,y+36)
  y+=72
  ctx.fillStyle='#aab3c5'
  ctx.font='28px Arial'
  ctx.fillText(new Date(report.createdAt||Date.now()).toLocaleDateString(),margin,y)
  y+=42

  const statItems=[
    ['Weekly Pips', String(stats.weeklyPips ?? 0)],
    ['Weekly Growth', formatPercent(stats.weeklyGainPercent)],
    ['Risk Taken', `${Number(stats.weeklyRiskPercent || 0)}%`],
    ['Win Rate', `${stats.winRate ?? 0}%`],
    ['Wins', String(stats.wins ?? 0)],
    ['Losses', String(stats.losses ?? 0)],
    ['Total Pips', String(stats.totalPips ?? 0)],
    ['Active Trades', String(stats.activeTrades ?? 0)]
  ]
  statItems.forEach((item,i)=>{
    const x=margin + (i%2)*(cardW+gap)
    const cy=y + Math.floor(i/2)*(cardH+gap)
    ctx.fillStyle='rgba(255,255,255,0.06)'
    drawCanvasRoundRect(ctx,x,cy,cardW,cardH,22,true)
    ctx.fillStyle='#7efcc6'
    ctx.font='24px Arial'
    ctx.fillText(item[0],x+22,cy+36)
    ctx.fillStyle='#ffffff'
    ctx.font='700 42px Arial'
    ctx.fillText(item[1],x+22,cy+82)
  })
  y += (cardH*3) + (gap*2) + 26

  const updateBoxH = format==='status' ? 290 : format==='portrait' ? 240 : 210
  ctx.fillStyle='rgba(255,255,255,0.06)'
  drawCanvasRoundRect(ctx,margin,y,contentWidth,updateBoxH,24,true)
  ctx.fillStyle='#ffd54f'
  ctx.font='700 30px Arial'
  ctx.fillText('Top Trade Updates',margin+28,y+42)
  if(!highlights.length){
    ctx.fillStyle='#d8e0ef'
    ctx.font='26px Arial'
    ctx.fillText('No closed trades yet.',margin+28,y+92)
  }else{
    highlights.forEach((t,idx)=>{
      const lineY=y+88+(idx*42)
      const p=Number(t.resultPips||0)
      ctx.fillStyle='#ffffff'
      ctx.font='700 24px Arial'
      ctx.fillText(`${t.pair} ${t.direction}`,margin+28,lineY)
      ctx.fillStyle='#aab3c5'
      ctx.font='22px Arial'
      ctx.fillText(signalStatusLabel(t.status,t.resultPips),margin+340,lineY)
      ctx.fillStyle=p>0?'#00f59b':p<0?'#ff6a6a':'#ffd54f'
      ctx.font='700 22px Arial'
      ctx.textAlign='right'
      ctx.fillText(`${p>0?'+':''}${p} pips`,W-margin-30,lineY)
      ctx.textAlign='left'
    })
  }
  y += updateBoxH + 22

  const summaryBoxH = H - y - 110
  ctx.fillStyle='rgba(255,255,255,0.06)'
  drawCanvasRoundRect(ctx,margin,y,contentWidth,summaryBoxH,24,true)
  ctx.fillStyle='#7efcc6'
  ctx.font='700 30px Arial'
  ctx.fillText('Weekly Summary',margin+28,y+42)
  ctx.fillStyle='#dfe7f5'
  ctx.font='25px Arial'
  wrapCanvasText(ctx, buildWeeklyReportText(report,trades), margin+28, y+92, contentWidth-56, 34, preset.summaryLines)

  ctx.fillStyle='rgba(0,0,0,0.24)'
  drawCanvasRoundRect(ctx,margin,H-84,contentWidth,56,18,true)
  ctx.fillStyle='#e9eef8'
  ctx.font='22px Arial'
  ctx.fillText('1000PIPS • Premium Weekly Performance',margin+22,H-48)
  ctx.textAlign='right'
  ctx.fillStyle='#8ea0bd'
  ctx.fillText('Trade with proper risk management',W-margin-20,H-48)
  ctx.textAlign='left'

  const link=document.createElement('a')
  link.href=canvas.toDataURL('image/png')
  link.download=`1000pips-weekly-performance-${preset.label}-${new Date().toISOString().slice(0,10)}.png`
  link.click()
}
function WeeklyPerformanceStudio({report,trades=[],showActions=true,compact=false}){
  const stats=report?.stats || {weeklyPips:report?.totalPips||0, weeklyGainPercent:report?.weeklyGainPercent||report?.totalGainPercent||0, totalGainPercent:report?.totalGainPercent||0, weeklyRiskPercent:report?.weeklyRiskPercent||0, winRate:report?.winRate||0, wins:report?.wins||0, losses:report?.losses||0, totalPips:report?.totalPips||0, activeTrades:report?.activeTrades||0}
  const normalizedReport={...report,stats}
  const highlights=pickWeeklyHighlightTrades(trades, compact?3:5)
  const title=report?.title || (report?.period?`${report.period} Performance Report`:'Weekly Performance Report')
  const subDate=new Date(report?.createdAt||Date.now()).toLocaleDateString()
  return <div className={compact?'weeklyPosterCard compact':'weeklyPosterCard'}>
    <div className="weeklyPosterHeader">
      <div>
        <span className="weeklyPosterKicker">1000PIPS PERFORMANCE</span>
        <h3>{title}</h3>
        <p>{report?.period || 'Weekly'} · {subDate}</p>
      </div>
      <div className="weeklyPosterBrand">1000PIPS</div>
    </div>
    <div className="weeklyPosterStatGrid">
      <div><span>Weekly Pips</span><strong>{stats.weeklyPips ?? 0}</strong></div>
      <div><span>Weekly Growth</span><strong>{formatPercent(stats.weeklyGainPercent)}</strong></div>
      <div><span>Risk Taken</span><strong>{Number(stats.weeklyRiskPercent || 0)}%</strong></div>
      <div><span>Win Rate</span><strong>{stats.winRate ?? 0}%</strong></div>
      <div><span>Wins</span><strong>{stats.wins ?? 0}</strong></div>
      <div><span>Losses</span><strong>{stats.losses ?? 0}</strong></div>
      <div><span>Total Pips</span><strong>{stats.totalPips ?? 0}</strong></div>
      <div><span>Active Trades</span><strong>{stats.activeTrades ?? 0}</strong></div>
    </div>
    {!!highlights.length && !compact && <div className="weeklyPosterHighlights">
      <h4>Top Trade Updates</h4>
      <div className="weeklyHighlightList">
        {highlights.map(t=>{ const p=Number(t.resultPips||0); return <div className="weeklyHighlightRow" key={t._id||`${t.pair}-${t.createdAt}`}><strong>{t.pair} {t.direction}</strong><span>{signalStatusLabel(t.status,t.resultPips)}</span><b className={p>0?'positive':p<0?'negative':'neutral'}>{p>0?'+':''}{p} pips {optionalPercent(t.resultPercent)}</b></div> })}
      </div>
    </div>}
    <div className="weeklyPosterNarrative">
      <h4>Report Summary</h4>
      <pre>{buildWeeklyReportText(normalizedReport,trades)}</pre>
    </div>
    {showActions && <div className="weeklyPosterActions"><button onClick={()=>downloadWeeklyPerformancePoster(normalizedReport,trades,'square')}>Download Instagram Square</button><button onClick={()=>downloadWeeklyPerformancePoster(normalizedReport,trades,'portrait')}>Download Telegram Portrait</button><button onClick={()=>downloadWeeklyPerformancePoster(normalizedReport,trades,'status')}>Download WhatsApp Status</button><button onClick={()=>copyTextToClipboard(buildWeeklyReportText(normalizedReport,trades))}>Copy Report Text</button></div>}
  </div>
}


function AnnouncementsPanel({mode='public', user=null}){
  const [items,setItems]=useState([])
  const [msg,setMsg]=useState('')
  useEffect(()=>{ load() },[mode,user])
  async function load(){
    try{
      if(mode==='vip' && !user) return
      const path=mode==='vip'?'/api/vip/announcements':'/api/announcements/public'
      const data=await api(path)
      setItems(data)
    }catch(e){ setMsg(e.message) }
  }
  if(!items.length && !msg) return null
  return <section className={mode==='vip'?'announcementSection vipAnnouncements':'announcementSection'}>
    <div className="announcementHead">
      <div><p className="green">1000PIPS ANNOUNCEMENTS</p><h2>{mode==='vip'?'VIP Member Updates':'Latest Updates'}</h2></div>
      <button className="refresh" onClick={load}>Refresh</button>
    </div>
    {msg&&<p className="error">{msg}</p>}
    <div className="announcementGrid">
      {items.map(a=><div key={a._id} className={`announcementCard ${a.visibility}`}>
        <div><span>{String(a.visibility||'public').toUpperCase()}</span><small>{formatDateTime(a.createdAt)}</small></div>
        <h3>{a.title}</h3>
        <p>{a.message}</p>
      </div>)}
    </div>
  </section>
}

function App(){
  const [page,setPage]=useState('home')
  const [user,setUser]=useState(null)
  useEffect(()=>{ const u=localStorage.getItem('user'); if(u){ try{ setUser(JSON.parse(u)); refreshMe() }catch{ localStorage.removeItem('user'); localStorage.removeItem('token') } } },[])
  async function refreshMe(){ if(!getToken()) return; try{ const fresh=await api('/api/me'); localStorage.setItem('user', JSON.stringify(fresh)); setUser(fresh) }catch{} }
  function saveSession(token,userData){ localStorage.setItem('token',token); localStorage.setItem('user',JSON.stringify(userData)); setUser(userData) }
  function logout(){ localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); setPage('home') }
  return <div>
    <nav className="nav">
      <button className="brand" onClick={()=>setPage('home')}><img src="/logo.jpg"/><span>1000PIPS</span></button>
      <div className="navLinks">
        <button onClick={()=>setPage('home')}>Home</button>
        <button onClick={()=>setPage('plans')}>VIP Plans</button>
        <button onClick={()=>setPage('analysis')}>Analysis</button>
        <button onClick={()=>setPage('archive')}>Archive</button>
        <button onClick={()=>setPage('dashboard')}>Dashboard</button>
        <button onClick={()=>setPage('vip')}>VIP Area</button>
        <button onClick={()=>setPage('rules')}>Signal Rules</button>
        <button onClick={()=>setPage('referrals')}>Referrals</button>
        {user?.role==='admin' && <button onClick={()=>setPage('admin')}>Admin</button>}
        {user ? <button onClick={logout}>Logout</button> : <button onClick={()=>setPage('login')}>Login</button>}
      </div>
    </nav>
    {user && <div className="userBar"><span>{user.email}</span><VipBadge user={user}/></div>}
    {page==='home' && <Home setPage={setPage}/>} 
    {page==='plans' && <Plans setPage={setPage}/>} 
    {page==='login' && <Login saveSession={saveSession} setPage={setPage}/>} 
    {page==='payment' && <Payment user={user} setUser={setUser} setPage={setPage}/>} 
    {page==='dashboard' && <SignalDashboard user={user} setPage={setPage}/>} 
    {page==='vip' && <Vip user={user} setPage={setPage}/>} 
    {page==='rules' && <SignalRules user={user} setPage={setPage}/>} 
    {page==='archive' && <Archive user={user} setPage={setPage}/>} 
    {page==='referrals' && <ReferralCenter user={user} setPage={setPage}/>} 
    {page==='analysis' && <AnalysisPage user={user} setPage={setPage}/>} 
    {page==='risk' && <RiskWarningPage setPage={setPage}/>}
    {page==='terms' && <TermsPage setPage={setPage}/>}
    {page==='privacy' && <PrivacyPolicyPage setPage={setPage}/>}
    {page==='admin' && <Admin user={user} setPage={setPage}/>} 
    <ProofLightboxController/><FloatingContactButtons/><Footer setPage={setPage}/>
  </div>
}

function Home({setPage}){ 
  return <>
    <header className="premiumHero">
      <div className="heroGlow"></div>
      <div className="premiumHeroInner">
        <div className="heroContent">
          <p className="eyebrow">1000PIPS VIP FOREX SIGNALS</p>
          <h1>Professional Forex Signals, Market Analysis & Performance Tracking</h1>
          <p className="heroText">
            Join a premium trading community built for Gold, Forex, Indices, Crypto and Oil traders.
            Get clear signals, chart-based analysis, VIP reports, pips tracking and Telegram updates from one platform.
          </p>
          <div className="heroActions">
            <button onClick={()=>setPage('plans')}>Join VIP Now</button>
            <button className="outlineBtn" onClick={()=>setPage('analysis')}>View Market Analysis</button>
            <a href={TELEGRAM_FREE} target="_blank">Free Telegram Channel</a>
          </div>
          <div className="heroTrust">
            <span>✅ VIP Dashboard</span>
            <span>✅ Telegram Signals</span>
            <span>✅ Chart Analysis</span>
            <span>✅ Pips Reports</span>
          </div>
        </div>
        <div className="heroPanel">
          <img src="/logo.jpg" className="heroPanelLogo"/>
          <div className="signalPreview">
            <p className="green">LIVE SIGNAL STYLE</p>
            <h3>XAUUSD BUY Setup</h3>
            <p>Entry: 3350</p>
            <p>SL: 3340</p>
            <p>TP1: 3370</p>
            <p>TP2: 3385</p>
            <div className="rrBadge">Risk/Reward 1:3</div>
          </div>
        </div>
      </div>
    </header>


    <AnnouncementsPanel mode="public"/>

    <section className="section rulesPromoSection">
      <div>
        <p className="green">TRADE WITH DISCIPLINE</p>
        <h2>Learn How To Follow 1000PIPS Signals Correctly</h2>
        <p>Before entering any VIP trade, understand Entry, SL, TP1, TP2, BE, invalidation and risk management rules.</p>
      </div>
      <button onClick={()=>setPage('rules')}>Read Signal Rules</button>
    </section>

    <section className="section">
      <p className="green">WHY 1000PIPS</p>
      <h2>Built For Serious Traders</h2>
      <div className="featureGrid">
        <div className="featureCard">
          <h3>📊 VIP Signals</h3>
          <p>Clear trade ideas with entry, stop loss, take profit and risk/reward planning.</p>
        </div>
        <div className="featureCard">
          <h3>🖼️ Chart Analysis</h3>
          <p>Daily market analysis with chart screenshots, key levels and trading bias.</p>
        </div>
        <div className="featureCard">
          <h3>📈 Performance Dashboard</h3>
          <p>Track active trades, closed trades, total pips, weekly pips and win rate.</p>
        </div>
        <div className="featureCard">
          <h3>🤖 Telegram Automation</h3>
          <p>Signals, analysis charts and weekly reports can be posted directly to Telegram.</p>
        </div>
      </div>
    </section>

    <section className="section proofSection">
      <div className="proofText">
        <p className="green">TRANSPARENT PERFORMANCE</p>
        <h2>Members Can See The Trading Report</h2>
        <p>
          1000PIPS includes a proper VIP dashboard with exact pips tracking, weekly reports,
          archived performance history and market analysis posts. This helps members trust the process.
        </p>
        <div className="proofActions">
          <button onClick={()=>setPage('dashboard')}>View Dashboard</button>
          <button className="outlineBtn" onClick={()=>setPage('archive')}>View Archive</button>
        </div>
      </div>
      <div className="proofStats">
        <div><h3>Exact</h3><p>Pips Tracking</p></div>
        <div><h3>Weekly</h3><p>Report Generator</p></div>
        <div><h3>VIP</h3><p>Performance Archive</p></div>
        <div><h3>Chart</h3><p>Based Analysis</p></div>
      </div>
    </section>

    <section className="section">
      <p className="green">VIP MEMBERSHIP</p>
      <h2>Choose Your Trading Access</h2>
      <div className="landingPlans">
        <div className="landingPlan">
          <h3>1 Month VIP</h3>
          <h4>$45</h4>
          <p>Best for testing the service and joining the VIP dashboard.</p>
          <button onClick={()=>setPage('payment')}>Start 1 Month</button>
        </div>
        <div className="landingPlan featuredPlan">
          <span className="tag">MOST POPULAR</span>
          <h3>3 Months VIP</h3>
          <h4>$100</h4>
          <p>Best value for serious traders who want consistent signals and analysis.</p>
          <button onClick={()=>setPage('payment')}>Join 3 Months</button>
        </div>
        <div className="landingPlan">
          <h3>Lifetime VIP</h3>
          <h4>$400</h4>
          <p>One-time access for long-term traders who want lifetime membership.</p>
          <button onClick={()=>setPage('payment')}>Get Lifetime</button>
        </div>
      </div>
    </section>

    <section className="section ctaSection">
      <p className="green">READY TO JOIN?</p>
      <h2>Start Trading With A More Professional Signal System</h2>
      <p>Join 1000PIPS VIP, submit your payment proof, get admin approval and access the VIP dashboard.</p>
      <div className="heroActions">
        <button onClick={()=>setPage('plans')}>View VIP Plans</button>
        <button className="outlineBtn" onClick={()=>setPage('payment')}>Submit Payment</button>
      </div>
    </section>

    <section className="section proofWallSection">
      <p className="green">MEMBER TRUST</p>
      <h2>Why Traders Choose 1000PIPS</h2>
      <p className="centerText">
        1000PIPS is built to give members more than random signals. Members can see chart analysis,
        trade updates, weekly pips reports, performance archive and Telegram alerts in one place.
      </p>
      <div className="proofWallGrid">
        <div className="proofWallCard">
          <h3>⭐ Clear Trade Plans</h3>
          <p>Each signal can include entry, SL, TP levels, risk/reward and notes so members understand the idea.</p>
        </div>
        <div className="proofWallCard">
          <h3>📊 Performance Tracking</h3>
          <p>Trades can be closed with exact pips, and the dashboard updates win rate, weekly pips and total pips.</p>
        </div>
        <div className="proofWallCard">
          <h3>🖼️ Chart-Based Analysis</h3>
          <p>Market analysis can include chart screenshots, key levels and trade plans, posted to website and Telegram.</p>
        </div>
      </div>
    </section>


    <section className="section trustpilotSection">
      <div className="trustpilotInner">
        <div>
          <p className="green">VERIFIED REVIEW PROFILE</p>
          <h2>1000PIPSFX Is On Trustpilot</h2>
          <p>
            We believe in transparency and real customer feedback. Visit our Trustpilot profile to read and share honest reviews about 1000PIPSFX.
          </p>
        </div>
        <a href={TRUSTPILOT_LINK} target="_blank" rel="noreferrer" className="trustpilotCard">
          <span>Trustpilot</span>
          <strong>Review 1000PIPSFX</strong>
          <small>Open our public Trustpilot profile</small>
        </a>
      </div>
    </section>

    <section className="section testimonialSection">
      <p className="green">SOCIAL PROOF</p>
      <h2>What Members Can Expect</h2>
      <div className="testimonialGrid">
        <div className="testimonialCard">
          <div className="stars">★★★★★</div>
          <p>“The best thing is the clear structure: signals, chart analysis, pips tracking and Telegram updates.”</p>
          <strong>VIP Member</strong>
        </div>
        <div className="testimonialCard">
          <div className="stars">★★★★★</div>
          <p>“I like that every trade can be tracked with exact pips and the weekly report is easy to understand.”</p>
          <strong>Gold Trader</strong>
        </div>
        <div className="testimonialCard">
          <div className="stars">★★★★★</div>
          <p>“The analysis with chart images helps me understand the market better before taking a trade.”</p>
          <strong>Forex Member</strong>
        </div>
      </div>
      <p className="smallNote">
        Note: Trading involves risk. Results depend on market conditions, discipline and risk management.
      </p>
    </section>

    
    <section className="section contactSalesSection">
      <div className="contactSalesInner">
        <div>
          <p className="green">NEED HELP BEFORE JOINING?</p>
          <h2>Contact 1000PIPS Directly</h2>
          <p>
            Have questions about VIP plans, payment proof, Telegram access or signals? 
            Message 1000PIPS directly on WhatsApp or Telegram before joining.
          </p>
        </div>
        <div className="contactCards">
          <a href={WHATSAPP_CONTACT} target="_blank" rel="noreferrer" className="contactCard whatsappCard">
            <span>WhatsApp</span>
            <strong>+94 78 117 0977</strong>
            <small>Fast support for VIP joining</small>
          </a>
          <a href={TELEGRAM_CONTACT} target="_blank" rel="noreferrer" className="contactCard telegramCard">
            <span>Telegram</span>
            <strong>@pips1000x</strong>
            <small>Message directly on Telegram</small>
          </a>
        </div>
      </div>
    </section>

    <ProofGallery limit={6}/>
    
    <section className="section referralSalesSection">
      <p className="green">GROW WITH US</p>
      <h2>Referral / Affiliate Program</h2>
      <p className="centerText">1000PIPS members can share their personal referral link. When a new trader joins through that link and becomes VIP, admin can track and manage the referral status.</p>
      <div className="referralSalesGrid"><div><h3>1</h3><p>Share your referral link</p></div><div><h3>2</h3><p>New trader registers through your link</p></div><div><h3>3</h3><p>Admin tracks approved VIP referrals</p></div></div>
      <div className="heroActions"><button onClick={()=>setPage('referrals')}>Open Referral Dashboard</button></div>
    </section>

    <section className="section faqSection">
      <p className="green">FAQ</p>
      <h2>Frequently Asked Questions</h2>
      <div className="faqGrid">
        <div className="faqItem">
          <h3>How do I join VIP?</h3>
          <p>Create an account, choose a plan, send payment, upload payment proof, and wait for admin approval.</p>
        </div>
        <div className="faqItem">
          <h3>How will I receive signals?</h3>
          <p>You can view signals in the VIP dashboard and receive updates through the Telegram channel.</p>
        </div>
        <div className="faqItem">
          <h3>What markets do you cover?</h3>
          <p>1000PIPS can cover Gold, Forex pairs, US30, Crypto and Oil depending on market conditions.</p>
        </div>
        <div className="faqItem">
          <h3>Do you provide chart analysis?</h3>
          <p>Yes. Analysis posts can include chart images, market bias, key levels, summary and trade plan.</p>
        </div>
        <div className="faqItem">
          <h3>Can I see past performance?</h3>
          <p>VIP members can view the performance archive, weekly reports, total pips and win rate dashboard.</p>
        </div>
        <div className="faqItem">
          <h3>Is profit guaranteed?</h3>
          <p>No. Trading has risk. Always use proper lot size, stop loss and risk management.</p>
        </div>
      </div>
    </section>

    
    <section className="section dailyBlogStrategy">
      <p className="green">MARKET INSIGHTS</p>
      <h2>Daily Market Analysis & Trading Outlook</h2>
      <p className="centerText">
        Stay updated with professional Gold, Forex, Indices, Crypto and Oil breakdowns. Read chart-based analysis, key levels, market bias and trading plans before the next trading session.
      </p>
      <div className="blogStrategyGrid">
        <div><h3>1</h3><p>Read daily chart-based analysis</p></div>
        <div><h3>2</h3><p>Get updates on website and Telegram</p></div>
        <div><h3>3</h3><p>Upgrade to VIP for signals and reports</p></div>
      </div>
    </section>

    

    <section className="section socialMediaSection">
      <div className="socialMediaInner">
        <div>
          <p className="green">FOLLOW 1000PIPS</p>
          <h2>Connect With Us On Social Media</h2>
          <p>Follow our Instagram and Facebook page for updates, market insights, proof posts, announcements and 1000PIPS brand content.</p>
        </div>
        <div className="socialMediaCards">
          <a href={INSTAGRAM_LINK} target="_blank" rel="noreferrer" className="socialMediaCard instagramSocial">
            <span>Instagram</span>
            <strong>@1000pips</strong>
            <small>Follow market updates, proof posts and announcements.</small>
          </a>
          <a href={FACEBOOK_LINK} target="_blank" rel="noreferrer" className="socialMediaCard facebookSocial">
            <span>Facebook</span>
            <strong>1000PIPS Page</strong>
            <small>Follow our Facebook page for public updates and community trust.</small>
          </a>
        </div>
      </div>
    </section>

    <section className="section finalSalesCta">
      <p className="green">START TODAY</p>
      <h2>Join 1000PIPS VIP And Trade With More Structure</h2>
      <p>Get access to VIP signals, chart analysis, performance dashboard and Telegram updates.</p>
      <div className="heroActions">
        <button onClick={()=>setPage('plans')}>Choose VIP Plan</button>
        <button className="outlineBtn" onClick={()=>setPage('payment')}>Submit Payment Proof</button>
      </div>
    </section>

  </> 
}

function SignalRules({user,setPage}){
  const isVip=user?.vip || user?.role==='admin'
  return <section className="section signalRulesPage">
    <div className="rulesHero">
      <p className="green">1000PIPS MEMBER GUIDE</p>
      <h2>VIP Signal Rules & Risk Management</h2>
      <p>Use this page before following any signal. The goal is not only to catch pips, but to trade with discipline, protect capital, and avoid emotional mistakes.</p>
      <div className="rulesHeroActions">
        <button onClick={()=>setPage(isVip?'dashboard':'plans')}>{isVip?'Open VIP Dashboard':'Join VIP'}</button>
        <button className="outlineBtn" onClick={()=>setPage('analysis')}>View Daily Analysis</button>
      </div>
    </div>

    <div className="rulesGrid">
      <div className="ruleCard importantRule"><span>01</span><h3>Risk Per Trade</h3><p>Risk only a small amount per signal. Suggested risk is 0.5% to 2% maximum per trade depending on your account size and experience.</p></div>
      <div className="ruleCard"><span>02</span><h3>Entry Rule</h3><p>Do not enter blindly if price is far away from the entry zone. Wait for price to come near the given entry or wait for admin update.</p></div>
      <div className="ruleCard"><span>03</span><h3>Stop Loss Is Mandatory</h3><p>Always place the given SL. Never remove SL hoping the market will come back. One protected loss is better than one account-damaging trade.</p></div>
      <div className="ruleCard"><span>04</span><h3>TP1 Management</h3><p>When TP1 hits, secure partial profit if your trading plan allows. Conservative members can close part of the trade and move SL to safer level.</p></div>
      <div className="ruleCard"><span>05</span><h3>Break Even Meaning</h3><p>BE means break even. If admin updates BE 0, the trade should be protected around entry so the trade does not become a loss.</p></div>
      <div className="ruleCard"><span>06</span><h3>Invalidated Setup</h3><p>If an analysis or setup is invalidated due to news, key level break, or market structure change, avoid new entries and follow admin updates.</p></div>
      <div className="ruleCard"><span>07</span><h3>No Revenge Trading</h3><p>After SL or missed entry, do not jump into random trades. Wait for the next official setup. Overtrading destroys discipline.</p></div>
      <div className="ruleCard"><span>08</span><h3>News Protection</h3><p>During high-impact news, spreads and volatility can increase. Reduce risk, avoid late entries, and follow the latest analysis update.</p></div>
    </div>

    <div className="rulesTimeline">
      <h3>How To Follow A Signal</h3>
      <div className="timelineSteps">
        <div><b>1</b><span>Read pair, direction, entry, SL, TP1, TP2.</span></div>
        <div><b>2</b><span>Check the chart and current price before entry.</span></div>
        <div><b>3</b><span>Use correct lot size based on your risk.</span></div>
        <div><b>4</b><span>Set SL immediately. Do not trade without protection.</span></div>
        <div><b>5</b><span>Follow TP1 / TP2 / BE / Closed updates.</span></div>
      </div>
    </div>

    <div className="rulesStatusGuide">
      <h3>Signal Status Meaning</h3>
      <div className="statusGuideGrid">
        <div><strong>RUNNING</strong><p>Trade is active or waiting around the setup area.</p></div>
        <div><strong>TP1 HIT</strong><p>First target reached. Consider securing partial profit.</p></div>
        <div><strong>TP2 HIT</strong><p>Main target reached. Trade result is strongly positive.</p></div>
        <div><strong>SL HIT</strong><p>Stop loss reached. Accept and wait for next setup.</p></div>
        <div><strong>BREAK EVEN</strong><p>Trade protected near entry. No major profit/loss expected.</p></div>
        <div><strong>TRADE MANUALLY CLOSED</strong><p>Admin closed the trade with exact pips because market conditions changed or enough profit was secured.</p></div>
      </div>
    </div>

    <div className="rulesDisclaimer">
      <h3>Important Risk Disclaimer</h3>
      <p>Forex, Gold, Crypto, Oil and Indices trading involve risk. 1000PIPS provides analysis and trade ideas, but every member is responsible for their own account, lot size, risk and execution. Never risk money you cannot afford to lose.</p>
    </div>
  </section>
}

function Plans({setPage}){ 
  const plans=[
    ['1 Month VIP','$45','30 days VIP access. Good for testing signals, analysis and dashboard features.'],
    ['3 Months VIP','$100','90 days VIP access. Best value for serious traders.'],
    ['Lifetime VIP','$400','One-time payment for lifetime VIP access.']
  ]; 
  return <section className="section">
    <p className="green">VIP MEMBERSHIP</p>
    <h2>Choose Your 1000PIPS Plan</h2>
    <p className="centerText">All plans include VIP dashboard access, premium signals, chart analysis, Telegram updates and performance reports.</p>
    <div className="landingPlans">
      {plans.map(([n,p,t],i)=>
        <div className={i===1?'landingPlan featuredPlan':'landingPlan'} key={n}>
          {i===1&&<span className="tag">MOST POPULAR</span>}
          <h3>{n}</h3>
          <h4>{p}</h4>
          <p>{t}</p>
          <ul>
            <li>VIP signals</li>
            <li>Chart analysis</li>
            <li>Performance dashboard</li>
            <li>Telegram updates</li>
          </ul>
          <button onClick={()=>setPage('payment')}>Join Now</button>
        </div>
      )}
    </div>
  </section> 
}
function Login({saveSession,setPage}){
  const[mode,setMode]=useState('login')
  const[form,setForm]=useState({name:'',email:'',password:'',referralCode:new URLSearchParams(window.location.search).get('ref')||''})
  const[msg,setMsg]=useState('')
  const[loading,setLoading]=useState(false)
  async function submit(e){
    e.preventDefault(); setMsg(''); setLoading(true)
    try{
      const path=mode==='login'?'/api/auth/login':'/api/auth/register'
      const payload=mode==='login'?{email:form.email,password:form.password}:{name:form.name,email:form.email,password:form.password,referralCode:form.referralCode}
      const data=await api(path,{method:'POST',body:JSON.stringify(payload)})
      saveSession(data.token,data.user)
      setPage(data.user.role==='admin'?'admin':'payment')
    }catch(err){ setMsg(err.message) } finally{ setLoading(false) }
  }
  return <section className="section narrow"><p className="green">{mode==='login'?'LOGIN':'REGISTER'}</p><h2>{mode==='login'?'Member Login':'Create VIP Account'}</h2><form className="form" onSubmit={submit}>{mode==='register'&&<input required placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>} {mode==='register'&&<input placeholder="Referral code (optional)" value={form.referralCode} onChange={e=>setForm({...form,referralCode:e.target.value.toUpperCase()})}/>}<input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input required type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button disabled={loading}>{loading?'Please wait...':mode==='login'?'Login':'Register'}</button>{msg&&<p className="error">{msg}</p>}<p className="switchText">{mode==='login'?'No account? ':'Already have an account? '}<button type="button" className="textBtn" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'Register':'Login'}</button></p></form></section>
}
function Payment({user,setUser,setPage}){ const[plan,setPlan]=useState('3 Months VIP - $100'),[method,setMethod]=useState('PayPal'),[transactionId,setTransactionId]=useState(''),[note,setNote]=useState(''),[screenshot,setScreenshot]=useState(null),[preview,setPreview]=useState(''),[msg,setMsg]=useState(''),[loading,setLoading]=useState(false),[coupon,setCoupon]=useState(''),[couponResult,setCouponResult]=useState(null); function onFile(e){ const f=e.target.files[0]; setScreenshot(f||null); setPreview(f?URL.createObjectURL(f):'') } async function applyCoupon(){ setMsg(''); setCouponResult(null); if(!coupon){ setMsg('Enter coupon code first.'); return } try{ const data=await api('/api/coupons/validate',{method:'POST',body:JSON.stringify({code:coupon,planPrice:getPlanPrice(plan)})}); setCouponResult(data); setMsg(`Coupon applied: ${data.code}. Final price: $${data.finalPrice}`) }catch(err){ setMsg(err.message) } } async function submit(e){ e.preventDefault(); setMsg(''); if(!user){ setPage('login'); return } const fd=new FormData(); fd.append('plan',plan); fd.append('method',method); fd.append('transactionId',transactionId); fd.append('note',note); if(couponResult){ fd.append('couponCode',couponResult.code); fd.append('originalPrice',String(couponResult.originalPrice)); fd.append('discountedPrice',String(couponResult.finalPrice)); fd.append('discountNote',`Discount ${couponResult.discount}`); } if(screenshot) fd.append('screenshot',screenshot); setLoading(true); try{ await api('/api/payments/proof',{method:'POST',body:fd}); const updated={...user,plan,status:'pending_payment'}; localStorage.setItem('user',JSON.stringify(updated)); setUser(updated); setMsg('Payment proof submitted successfully. Admin will review and approve your VIP access.'); setTransactionId(''); setNote(''); setScreenshot(null); setPreview('') }catch(err){ setMsg(err.message) } finally{ setLoading(false) } } return <section className="section"><p className="green">PAYMENT DETAILS</p><h2>Activate Your VIP Access</h2><div className="payGrid"><div><h3>PayPal</h3><p>{PAYPAL_EMAIL}</p></div><div><h3>Skrill</h3><p>{SKRILL_EMAIL}</p></div><div><h3>Binance Pay</h3><p>ID: {BINANCE_PAY_ID}</p></div></div><form className="form" onSubmit={submit}><select value={plan} onChange={e=>setPlan(e.target.value)}><option>1 Month VIP - $45</option><option>3 Months VIP - $100</option><option>Lifetime VIP - $400</option></select><select value={method} onChange={e=>setMethod(e.target.value)}><option>PayPal</option><option>Skrill</option><option>Binance Pay</option></select><input required placeholder="Transaction ID / Payment Reference" value={transactionId} onChange={e=>setTransactionId(e.target.value)}/><textarea placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)}/>
        <div className="couponApplyBox">
          <input placeholder="Coupon code (optional)" value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())}/>
          <button type="button" onClick={applyCoupon}>Apply Coupon</button>
        </div>
        {couponResult&&<div className="couponResultBox">
          <strong>{couponResult.code}</strong> applied — Original: ${couponResult.originalPrice} | Discount: ${couponResult.discount} | Final: ${couponResult.finalPrice}
        </div>}<label className="uploadBox">Upload payment screenshot<input type="file" accept="image/*" onChange={onFile}/></label>{preview&&<img className="preview" src={preview}/>}<button disabled={loading}>{loading?'Submitting...':'Submit Payment Proof'}</button>{msg&&<p className={msg.includes('successfully')?'success':'error'}>{msg}</p>}</form></section> }
function StatsCards({stats}){ return <div className="statsGrid"><div><h3>{stats.activeTrades}</h3><p>Active Trades</p></div><div><h3>{stats.winRate}%</h3><p>Win Rate</p></div><div><h3>{stats.totalPips}</h3><p>Total Pips</p></div><div><h3>{stats.weeklyPips}</h3><p>Weekly Pips</p></div><div><h3>{formatPercent(stats.weeklyGainPercent)}</h3><p>Weekly Growth</p></div><div><h3>{formatPercent(stats.totalGainPercent)}</h3><p>Total Growth</p></div><div><h3>{Number(stats.weeklyRiskPercent||0)}%</h3><p>Weekly Risk</p></div><div><h3>{stats.wins}</h3><p>Wins</p></div><div><h3>{stats.losses}</h3><p>Losses</p></div></div> }
function TradeCard({trade}){
  const statusLabel=signalStatusLabel(trade.status, trade.resultPips)
  const statusClass=signalStatusClass(trade.status, trade.resultPips)
  const direction=String(trade.direction||'').toUpperCase()
  const isBuy=direction==='BUY'
  const pips=Number(trade.resultPips||0)
  const pipsText=pips>0?`+${pips}`:String(pips)
  return <div className={`premiumSignalCard ${statusClass} ${isBuy?'buySignal':'sellSignal'}`}>
    <div className="premiumSignalTop">
      <div>
        <div className="premiumSignalPair">
          <span className="marketIcon">{isBuy?'↗':'↘'}</span>
          <h3>{trade.pair}</h3>
          <span className={`directionBadge ${isBuy?'buy':'sell'}`}>{direction||'SIGNAL'}</span>
        </div>
        <p className="premiumMeta">{trade.category} · {weekGroupLabel(trade.updatedAt || trade.closedAt || trade.createdAt)} · Signal Given: {formatDateTime(trade.createdAt)}</p>
      </div>
      <span className={`premiumStatusBadge ${statusClass}`}>{statusLabel}</span>
    </div>

    <div className="premiumSignalLevels">
      <div><span>Entry</span><strong>{trade.entry}</strong></div>
      <div><span>Stop Loss</span><strong>{trade.stopLoss}</strong></div>
      <div><span>TP 1</span><strong>{trade.takeProfit1}</strong></div>
      <div><span>TP 2</span><strong>{trade.takeProfit2}</strong></div>
    </div>

    <div className={`premiumPips ${pips>0?'positive':pips<0?'negative':'neutral'}`}>
      <span>Result</span>
      <strong>{pipsText} pips {optionalPercent(trade.resultPercent)}</strong>
      <small>{trade.riskReward?`Risk/Reward ${trade.riskReward}`:'Risk managed signal'}{Number(trade.riskPercent||0)?` · Risk ${trade.riskPercent}%`:''}</small>
    </div>

    {trade.notes&&<div className="premiumSignalNotes"><strong>Trade Notes</strong><pre>{trade.notes}</pre></div>}
  </div>
}

function TextSignalCard({signal}){
  return <div className="premiumTextSignalCard">
    <div className="premiumSignalTop">
      <div>
        <div className="premiumSignalPair">
          <span className="marketIcon">⚡</span>
          <h3>{signal.title}</h3>
        </div>
        <p className="premiumMeta">Signal Given: {formatDateTime(signal.createdAt)}</p>
      </div>
      <span className="premiumStatusBadge running">VIP SIGNAL</span>
    </div>
    <pre className="premiumSignalMessage">{signal.message}</pre>
  </div>
}
function SignalDashboard({user,setPage}){
  const [stats,setStats]=useState(null)
  const [trades,setTrades]=useState([])
  const [msg,setMsg]=useState('')
  const [filter,setFilter]=useState('all')
  const filters=[
    ['all','All'],['running','Running'],['tp1','TP1 Hit'],['tp2','TP2 Hit'],['sl','SL Hit'],['be','Break Even'],['closed','Closed'],
    ['gold','Gold'],['forex','Forex'],['us30','US30'],['oil','Oil'],['crypto','Crypto']
  ]
  useEffect(()=>{ load() },[user])
  async function load(){
    if(!user){ setMsg('Please login first.'); return }
    try{ setStats(await api('/api/vip/stats')); setTrades(await api('/api/vip/trades')) }catch(e){ setMsg(e.message) }
  }
  if(!user) return <section className="section narrow"><h2>Please login first</h2><button onClick={()=>setPage('login')}>Login</button></section>
  if(!user.vip&&user.role!=='admin') return <section className="section narrow"><p className="green">VIP LOCKED</p><h2>Dashboard is only for approved VIP members</h2></section>
  const weeklyTrades=trades.filter(isTradeVisibleThisOrLastWeek)
  const filteredTrades=weeklyTrades.filter(t=>tradeFilterMatch(t,filter))
  return <section className="section">
    <p className="green">SIGNAL DASHBOARD</p>
    <h2>Trading Performance</h2>
    <div className="dashboardTopActions"><button className="refresh" onClick={load}>Refresh Dashboard</button><span>{filteredTrades.length} of {weeklyTrades.length} current/last week signals showing</span></div><div className="weeklyAutoNotice"><strong>Weekly Auto Display:</strong> Running trades, this week trades and last week trades only. Older history stays in reports/archive.</div>
    <AnnouncementsPanel mode="vip" user={user}/>
    {msg&&<p className="error">{msg}</p>}
    {stats&&<StatsCards stats={stats}/>}
    <div className="signalFilterPanel">
      <div><h3>Filter Signals</h3><p>Quickly view running trades, closed results, or specific markets.</p></div>
      <div className="signalFilterButtons">
        {filters.map(([key,label])=><button key={key} className={filter===key?'active':''} onClick={()=>setFilter(key)}>{label} <small>{filterCount(weeklyTrades,key)}</small></button>)}
      </div>
    </div>
    <div className="listGrid">{filteredTrades.map(t=><TradeCard key={t._id} trade={t}/>)}{trades.length===0&&<p>No trades yet.</p>}{trades.length>0&&weeklyTrades.length===0&&<p>No current or last week trades yet.</p>}{weeklyTrades.length>0&&filteredTrades.length===0&&<p>No signals found for this filter.</p>}</div>
  </section>
}
function Vip({user,setPage}){ const[signals,setSignals]=useState([]),[analysis,setAnalysis]=useState([]),[msg,setMsg]=useState(''); useEffect(()=>{ async function load(){ if(!user) return; try{ setSignals(await api('/api/vip/signals')); setAnalysis(await api('/api/vip/analysis')) }catch(e){ setMsg(e.message) } } load() },[user]); if(!user) return <section className="section narrow"><h2>Please login first</h2><button onClick={()=>setPage('login')}>Login</button></section>; if(!user.vip&&user.role!=='admin') return <section className="section narrow"><p className="green">{user.status==='expired'?'VIP EXPIRED':'VIP LOCKED'}</p><h2>{user.status==='expired'?'Your VIP Access Has Expired':'Waiting For Admin Approval'}</h2><p>Status: {user.status}</p><button onClick={()=>setPage('payment')}>Renew / Submit Payment</button></section>; return <section className="section"><p className="green">VIP AREA</p><h2>Premium Signals & VIP Analysis</h2><AnnouncementsPanel mode='vip' user={user}/>{isExpiringSoon(user.daysRemaining)&&<div className="expiryWarningBox"><h3>⚠️ VIP Renewal Reminder</h3><p>Your VIP access expires in <strong>{user.daysRemaining} day{Number(user.daysRemaining)===1?'':'s'}</strong>. Renew early to avoid losing VIP signals and analysis access.</p><button onClick={()=>setPage('payment')}>Renew VIP Now</button></div>}<div className="vipInfo"><strong>Access:</strong> {user.daysRemaining==='Lifetime'?'Lifetime':`${user.daysRemaining} days remaining`}<br/><strong>Expiry:</strong> {formatDate(user.vipExpiryDate)}<br/><button className="miniRulesBtn" onClick={()=>setPage('rules')}>Read VIP Signal Rules</button></div>{msg&&<p className="error">{msg}</p>}<div className="premiumTextSignalGrid">{signals.length===0?<p>No text signals posted yet.</p>:signals.map(s=><TextSignalCard key={s._id} signal={s}/>)}</div><div className="weeklyAutoNotice"><strong>Analysis Auto Display:</strong> Showing this week and last week analysis only.</div><div className="analysisGrid">{visibleWeeklyAnalysis(analysis).map(post=><AnalysisCard key={post._id} post={post}/>)}{analysis.length===0&&<p>No VIP analysis yet.</p>}{analysis.length>0&&visibleWeeklyAnalysis(analysis).length===0&&<p>No analysis from this week or last week.</p>}</div></section> }
function ReferralCenter({user,setPage}){
  const [data,setData]=useState(null)
  const [msg,setMsg]=useState('')
  useEffect(()=>{ load() },[user])
  async function load(){ if(!user) return; try{ setData(await api('/api/referrals/me')) }catch(e){ setMsg(e.message) } }
  async function copyLink(){ if(!data?.referralLink) return; await navigator.clipboard.writeText(data.referralLink); setMsg('Referral link copied.') }
  if(!user) return <section className="section narrow"><h2>Please login first</h2><button onClick={()=>setPage('login')}>Login</button></section>
  return <section className="section referralSection">
    <p className="green">REFERRAL / AFFILIATE</p>
    <h2>Invite Traders And Grow With 1000PIPS</h2>
    <p className="centerText">Share your referral link. When someone registers and becomes VIP through your code, it appears in your referral dashboard.</p>
    <button className="refresh" onClick={load}>Refresh Referrals</button>
    {msg&&<p className={msg.includes('copied')?'success':'error'}>{msg}</p>}
    {data&&<div className="referralPanel">
      <div className="referralCodeBox"><p>Your Referral Code</p><h3>{data.referralCode}</h3><button onClick={copyLink}>Copy Referral Link</button></div>
      <div className="referralStats"><div><h3>{data.totalReferrals}</h3><p>Total Referrals</p></div><div><h3>{data.approvedReferrals}</h3><p>Approved VIP</p></div><div><h3>{data.paidReferrals}</h3><p>Paid Commission</p></div></div>
      <div className="referralLinkBox"><strong>Your link:</strong><input readOnly value={data.referralLink}/></div>
      <div className="referralList"><h3>Your Referral History</h3>{data.referrals.length===0&&<p>No referrals yet.</p>}{data.referrals.map(r=><div className="referralRow" key={r._id}><strong>{r.referredName || r.referredEmail}</strong><p>{r.referredEmail}</p><span className={`refStatus ${r.status}`}>{r.status}</span></div>)}</div>
    </div>}
  </section>
}

function Archive({user,setPage}){
  const[reports,setReports]=useState([]),[msg,setMsg]=useState('')
  useEffect(()=>{ load() },[])
  async function load(){
    try{ setReports(await api('/api/reports/public')) }catch(e){ setMsg(e.message) }
  }
  return <section className="section publicArchivePage">
    <p className="green">PUBLIC PERFORMANCE ARCHIVE</p>
    <h2>Past Weekly & Monthly Trading Reports</h2>
    <p className="centerText">Review 1000PIPS archived trading reports before joining VIP. Live signals and full VIP dashboard access remain members-only.</p>
    <div className="archiveTopActions"><button className="refresh" onClick={load}>Refresh Archive</button><button className="outlineBtn" onClick={()=>setPage(user?'dashboard':'plans')}>{user?'Open Dashboard':'Join VIP'}</button></div>
    {msg&&<p className="error">{msg}</p>}
    <div className="archivePosterGrid">
      {reports.length===0&&<p>No archived reports yet.</p>}
      {reports.map(r=><WeeklyPerformanceStudio key={r._id} report={r} trades={[]} showActions={false} compact={true}/>) }
    </div>
  </section>
}

function ProofGallery({limit=6}){
  const [proofs,setProofs]=useState([])
  const [msg,setMsg]=useState('')
  useEffect(()=>{ load() },[])
  async function load(){
    try{ setProofs(await api('/api/proofs/public')) }catch(e){ setMsg(e.message) }
  }

  const shown = limit ? proofs.slice(0,limit) : proofs
  const shouldSlide = shown.length > 1
  const loopItems = shouldSlide ? [...shown, ...shown] : shown
  const slideDistance = shown.length * 340
  const slideDuration = Math.max(18, shown.length * 6)

  return <section className="section realProofSection">
    <p className="green">REAL PROOF</p>
    <h2>Trading Results, Feedback & Proof Screenshots</h2>
    <p className="centerText">
      View real screenshots shared by 1000PIPS, including trading results, feedback, performance proof and analysis examples.
    </p>
    <div className="proofTopBar">
      <button className="refresh" onClick={load}>Refresh Proof</button>
      {shown.length>1 && <small className="proofSliderHelp">Auto sliding gallery · hover or touch to pause</small>}
    </div>
    {msg&&<p className="error">{msg}</p>}
    {shown.length===0 ? <p>No proof screenshots posted yet.</p> : <div className="proofSliderOuter" style={{'--proof-slide-distance': `${slideDistance}px`, '--proof-slide-duration': `${slideDuration}s`}}>
      <div className={`proofSliderTrack ${shouldSlide?'animate':''}`}>
        {loopItems.map((p,index)=><div key={`${p._id}-${index}`} className="proofScreenshotCard proofSlideCard">
          <button type="button" className="proofImageButton">
            {p.proofImageData&&<img src={imgSrcFromProof(p)} alt={p.title}/>}
            <span className="zoomHint">Click to enlarge</span>
          </button>
          <div className="proofScreenshotBody">
            <span>{p.category}</span>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <small>{new Date(p.createdAt).toLocaleDateString()}</small>
          </div>
        </div>)}
      </div>
    </div>}
  </section>
}

function AnalysisCard({post}){
  const updates = Array.isArray(post.updates) ? post.updates : []
  const visibleUpdates = updates.filter(u=>post.visibility==='public' ? u.visibility==='public' : true)
  const latest = visibleUpdates[0]
  return <div className="analysisCard">
    <div className="analysisHeader"><div><h3>{post.title}</h3><p>{post.market} · {post.bias} · {weekGroupLabel(post.createdAt)} · {new Date(post.createdAt).toLocaleDateString()}</p></div><span className="chip">{post.visibility}</span></div>
    {latest&&<div className={`analysisLatestUpdate ${latest.status}`}><strong>{analysisUpdateStatusIcon(latest.status)} Latest Update: {analysisUpdateStatusLabel(latest.status)}</strong><p>{latest.comment}</p><small>{formatDateTime(latest.createdAt)}</small></div>}
    {post.chartImageData && <img className="analysisChart" src={imgSrcFromPost(post)} alt={post.chartImageName||post.title}/>} {post.summary&&<p className="analysisSummary">{post.summary}</p>} {post.keyLevels&&<p><strong>Key Levels:</strong> {post.keyLevels}</p>} {post.tradePlan&&<p><strong>Trade Plan:</strong> {post.tradePlan}</p>} {post.content&&<pre>{post.content}</pre>}
    {visibleUpdates.length>0&&<div className="analysisUpdateTimeline"><h4>Update History</h4>{visibleUpdates.map((u,i)=><div className={`analysisUpdateItem ${u.status}`} key={u._id||i}><span>{analysisUpdateStatusIcon(u.status)}</span><div><strong>{analysisUpdateStatusLabel(u.status)}</strong><p>{u.comment}</p><small>{formatDateTime(u.createdAt)} · {u.visibility}</small></div></div>)}</div>}
  </div>
}
function AnalysisPage(){ const[posts,setPosts]=useState([]),[msg,setMsg]=useState(''); useEffect(()=>{ load() },[]); async function load(){ try{ setPosts(await api('/api/analysis/public')) }catch(e){ setMsg(e.message) } } return <section className="section"><p className="green">DAILY MARKET ANALYSIS</p><h2>Gold, Forex, Crypto & Indices Breakdown</h2><button className="refresh" onClick={load}>Refresh Analysis</button>{msg&&<p className="error">{msg}</p>}<div className="weeklyAutoNotice"><strong>Daily Analysis Auto Display:</strong> Showing this week and last week analysis only.</div><div className="analysisGrid">{posts.length===0&&<p>No public analysis posted yet.</p>}{posts.length>0&&visibleWeeklyAnalysis(posts).length===0&&<p>No public analysis from this week or last week.</p>}{visibleWeeklyAnalysis(posts).map(post=><AnalysisCard key={post._id} post={post}/> )}</div></section> }
function Admin({user,setPage}){
  const [users,setUsers]=useState([]),[payments,setPayments]=useState([]),[trades,setTrades]=useState([]),[textSignals,setTextSignals]=useState([]),[report,setReport]=useState(null),[reports,setReports]=useState([]),[analysis,setAnalysis]=useState([]),[adminReferrals,setAdminReferrals]=useState([]),[msg,setMsg]=useState(''),[viewer,setViewer]=useState(null),[renewPlan,setRenewPlan]=useState('1 Month VIP - $45')
  const [signal,setSignal]=useState({title:'XAUUSD BUY Setup',message:'BUY XAUUSD\nEntry: 3350\nSL: 3340\nTP1: 3370\nTP2: 3385',sendTelegram:true})
  const [trade,setTrade]=useState({pair:'XAUUSD',category:'Gold',direction:'BUY',entry:'3350',stopLoss:'3340',takeProfit1:'3370',takeProfit2:'3385',riskReward:'1:2',riskPercent:'1',resultPercent:'',notes:'Trend continuation setup',sendTelegram:true})
  const [analysisForm,setAnalysisForm]=useState({title:'Gold Analysis - London Session',market:'Gold',bias:'Bullish',summary:'Price is holding above support and showing bullish continuation potential.',content:'Look for bullish continuation if price holds above the marked support zone. Wait for confirmation on lower timeframe before entry.',keyLevels:'Support 3340, Resistance 3370',tradePlan:'Buy dips above support. Invalidation below 3340.',visibility:'public',sendTelegram:true})
  const [analysisChart,setAnalysisChart]=useState(null),[analysisPreview,setAnalysisPreview]=useState(''),[customPips,setCustomPips]=useState({}),[customRRR,setCustomRRR]=useState({}),[customResultPercent,setCustomResultPercent]=useState({})
  const [activeAnalysisUpdate,setActiveAnalysisUpdate]=useState(null),[analysisUpdateForm,setAnalysisUpdateForm]=useState({status:'running',comment:'Running according to our analysis. Waiting for next confirmation.',visibility:'public',sendTelegram:true})
  const [editingTrade,setEditingTrade]=useState(null)
  const [coupons,setCoupons]=useState([]),[couponForm,setCouponForm]=useState({code:'',discountType:'percentage',discountValue:'10',active:true,note:''})
  const [proofs,setProofs]=useState([]),[proofForm,setProofForm]=useState({title:'VIP Result Proof',category:'Trading Result',description:'Real trading result from 1000PIPS.',visibility:'public'}),[proofImage,setProofImage]=useState(null),[proofPreview,setProofPreview]=useState('')
  const [memberSearch,setMemberSearch]=useState(''),[memberFilter,setMemberFilter]=useState('all')
  const [announcements,setAnnouncements]=useState([]),[announcementForm,setAnnouncementForm]=useState({title:'Important Market Update',message:'High impact news today. Trade carefully and follow risk management.',visibility:'vip',sendTelegram:false})
  const [adminView,setAdminView]=useState('overview'),[showAllAdmin,setShowAllAdmin]=useState({})
  const [adminTradeSearch,setAdminTradeSearch]=useState(''),[adminTradeFilter,setAdminTradeFilter]=useState('all')
  const [adminAnalysisSearch,setAdminAnalysisSearch]=useState(''),[adminAnalysisFilter,setAdminAnalysisFilter]=useState('all')
  const [adminReportSearch,setAdminReportSearch]=useState(''),[adminReportFilter,setAdminReportFilter]=useState('all')
  const [adminProofSearch,setAdminProofSearch]=useState(''),[adminProofFilter,setAdminProofFilter]=useState('all')

  const tradeTemplates=[
    {label:'Gold BUY', pair:'XAUUSD', category:'Gold', direction:'BUY', notes:'Gold bullish setup. Enter only after confirmation. Manage risk properly.'},
    {label:'Gold SELL', pair:'XAUUSD', category:'Gold', direction:'SELL', notes:'Gold bearish setup. Enter only after confirmation. Manage risk properly.'},
    {label:'US30 BUY', pair:'US30', category:'Indices', direction:'BUY', notes:'US30 bullish setup. Wait for confirmation and use proper risk management.'},
    {label:'US30 SELL', pair:'US30', category:'Indices', direction:'SELL', notes:'US30 bearish setup. Wait for confirmation and use proper risk management.'},
    {label:'Oil BUY', pair:'UKOIL', category:'Oil', direction:'BUY', notes:'Oil bullish setup. Watch momentum and confirm entry before execution.'},
    {label:'Oil SELL', pair:'UKOIL', category:'Oil', direction:'SELL', notes:'Oil bearish setup. Watch momentum and confirm entry before execution.'},
    {label:'BTC BUY', pair:'BTCUSD', category:'Crypto', direction:'BUY', notes:'BTC bullish setup. Use percentage-based risk and wait for confirmation.'},
    {label:'BTC SELL', pair:'BTCUSD', category:'Crypto', direction:'SELL', notes:'BTC bearish setup. Use percentage-based risk and wait for confirmation.'},
    {label:'GBPUSD BUY', pair:'GBPUSD', category:'Forex', direction:'BUY', notes:'GBPUSD bullish setup. Trade only after price confirms the level.'},
    {label:'GBPUSD SELL', pair:'GBPUSD', category:'Forex', direction:'SELL', notes:'GBPUSD bearish setup. Trade only after price confirms the level.'}
  ]
  function useTradeTemplate(t){
    const next={...trade,pair:t.pair,category:t.category,direction:t.direction,entry:'',stopLoss:'',takeProfit1:'',takeProfit2:'',riskReward:'1:2',riskPercent:trade.riskPercent||'1',resultPercent:'',notes:t.notes,sendTelegram:true}
    setTrade(next)
    setSignal({title:`${t.pair} ${t.direction} Setup`,message:`${t.direction} ${t.pair}
Entry: 
SL: 
TP1: 
TP2: 

${t.notes}`,sendTelegram:true})
    setMsg(`${t.label} template loaded. Add Entry, SL and TP levels before posting.`)
  }
  async function loadAdmin(){ setMsg(''); try{ const [u,p,rpt,rep,an,tr,sig,pr,cp,refs,anns]=await Promise.all([api('/api/admin/users'),api('/api/admin/payments'),api('/api/admin/report'),api('/api/vip/reports'),api('/api/vip/analysis'),api('/api/vip/trades'),api('/api/vip/signals'),api('/api/vip/proofs'),api('/api/admin/coupons'),api('/api/admin/referrals'),api('/api/admin/announcements')]); setUsers(u); setPayments(p); setReport(rpt); setReports(rep); setAnalysis(an); setTrades(tr); setTextSignals(sig); setProofs(pr); setCoupons(cp); setAdminReferrals(refs); setAnnouncements(anns); setMsg('Admin data refreshed.') }catch(e){ setMsg(e.message) } }
  useEffect(()=>{ if(user?.role==='admin') loadAdmin() },[user])
  if(!user) return <section className="section narrow"><h2>Admin Login Required</h2><button onClick={()=>setPage('login')}>Login</button></section>
  if(user.role!=='admin') return <section className="section narrow"><h2>Admin Access Required</h2></section>
  const expiringMembers = users.filter(u=>u.vip && isExpiringThisWeek(u.daysRemaining)).sort((a,b)=>Number(a.daysRemaining||0)-Number(b.daysRemaining||0))
  const expiredMembers = users.filter(u=>u.status==='expired' || (!u.vip && Number(u.daysRemaining)===0))
  const pendingMembers = users.filter(u=>String(u.status||'').toLowerCase().includes('pending'))
  const activeVipMembers = users.filter(u=>u.vip)
  const nonVipMembers = users.filter(u=>!u.vip && String(u.status||'').toLowerCase()!=='expired')
  const memberSearchText = memberSearch.trim().toLowerCase()
  const filteredUsers = users.filter(u=>{
    const matchesSearch = !memberSearchText || [u.name,u.email,u.status,u.plan].some(v=>String(v||'').toLowerCase().includes(memberSearchText))
    const status = String(u.status||'').toLowerCase()
    const matchesFilter = memberFilter==='all' ||
      (memberFilter==='vip' && u.vip) ||
      (memberFilter==='pending' && status.includes('pending')) ||
      (memberFilter==='expired' && (status==='expired' || (!u.vip && Number(u.daysRemaining)===0))) ||
      (memberFilter==='notvip' && !u.vip && status!=='expired') ||
      (memberFilter==='expiring' && u.vip && isExpiringThisWeek(u.daysRemaining))
    return matchesSearch && matchesFilter
  })
  const memberFilterButtons=[
    ['all','All Members',users.length],
    ['vip','VIP Active',activeVipMembers.length],
    ['pending','Pending',pendingMembers.length],
    ['expiring','Expiring Soon',expiringMembers.length],
    ['expired','Expired',expiredMembers.length],
    ['notvip','Not VIP',nonVipMembers.length]
  ]
  const adminTabs=[
    ['overview','Overview'],['signals','Signals & Trades'],['analysis','Analysis Blog'],['members','Payments & Users'],['reports','Reports'],['proofs','Proofs'],['marketing','Coupons & Announcements'],['referrals','Referrals']
  ]
  function showAdminTab(key){ setAdminView(key); setTimeout(()=>document.getElementById(`admin-${key}`)?.scrollIntoView({behavior:'smooth',block:'start'}),50) }
  function adminItems(items,key,limit=10){ const list=Array.isArray(items)?items:[]; return showAllAdmin[key]?list:list.slice(0,limit) }
  function AdminShowToggle({itemsKey,total,limit=10}){ if((total||0)<=limit) return null; return <div className="adminShowToggle"><button onClick={()=>setShowAllAdmin({...showAllAdmin,[itemsKey]:!showAllAdmin[itemsKey]})}>{showAllAdmin[itemsKey]?'Show Latest 10 Only':`Show All ${total}`}</button><span>{showAllAdmin[itemsKey]?`Showing all ${total}`:`Showing latest ${Math.min(limit,total)} of ${total}`}</span></div> }
  function adminSearchMatch(item, query, fields){ const q=String(query||'').trim().toLowerCase(); if(!q) return true; return fields.some(f=>String(item?.[f]||'').toLowerCase().includes(q)) }
  const filteredAdminTrades = trades.filter(t=>adminSearchMatch(t,adminTradeSearch,['pair','category','direction','entry','stopLoss','takeProfit1','takeProfit2','riskReward','riskPercent','resultPercent','notes']) && (adminTradeFilter==='all' || signalStatusLabel(t.status,t.resultPips).toLowerCase().replace(/\s+/g,'-').includes(adminTradeFilter)))
  const filteredAdminAnalysis = analysis.filter(a=>adminSearchMatch(a,adminAnalysisSearch,['title','market','bias','summary','content','keyLevels','tradePlan','visibility']) && (adminAnalysisFilter==='all' || String(a.visibility||'').toLowerCase()===adminAnalysisFilter))
  const filteredAdminReports = reports.filter(r=>adminSearchMatch(r,adminReportSearch,['title','period','reportText']) && (adminReportFilter==='all' || String(r.period||'').toLowerCase()===adminReportFilter))
  const filteredAdminProofs = proofs.filter(pr=>adminSearchMatch(pr,adminProofSearch,['title','category','description','visibility']) && (adminProofFilter==='all' || String(pr.visibility||'').toLowerCase()===adminProofFilter))
  function AdminFilterBar({search,setSearch,filter,setFilter,filters,placeholder,total,shown}){ return <div className="adminFilterBar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={placeholder}/><select value={filter} onChange={e=>setFilter(e.target.value)}>{filters.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select><span>{shown} of {total} found</span></div> }

  async function createAnnouncement(e){
    e.preventDefault()
    try{
      await api('/api/admin/announcements',{method:'POST',body:JSON.stringify(announcementForm)})
      setMsg('Announcement posted successfully.')
      setAnnouncementForm({...announcementForm,title:'',message:'',sendTelegram:false})
      await loadAdmin()
    }catch(err){ setMsg(err.message) }
  }
  async function deleteAnnouncement(id){
    if(!window.confirm('Delete this announcement?')) return
    try{ await api(`/api/admin/announcements/${id}`,{method:'DELETE'}); setMsg('Announcement deleted.'); await loadAdmin() }catch(err){ setMsg(err.message) }
  }
  async function approve(id){ await api(`/api/admin/payments/${id}/approve`,{method:'PUT'}); await loadAdmin() }
  async function viewShot(id){ try{ const d=await api(`/api/admin/payments/${id}/screenshot`); setViewer(`data:${d.screenshotMime};base64,${d.screenshotData}`) }catch(e){ setMsg(e.message) } }
  async function createCoupon(e){ e.preventDefault(); try{ await api('/api/admin/coupons',{method:'POST',body:JSON.stringify(couponForm)}); setMsg('Coupon created successfully.'); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function toggleCoupon(id,active){ try{ await api(`/api/admin/coupons/${id}`,{method:'PUT',body:JSON.stringify({active})}); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function deleteCoupon(id){ try{ await api(`/api/admin/coupons/${id}`,{method:'DELETE'}); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function updateReferral(id,status){ try{ await api(`/api/admin/referrals/${id}`,{method:'PUT',body:JSON.stringify({status})}); setMsg('Referral updated.'); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function removeVip(id){ await api(`/api/admin/users/${id}/remove-vip`,{method:'PUT'}); await loadAdmin() }
  async function renewVip(id){ await api(`/api/admin/users/${id}/renew-vip`,{method:'PUT',body:JSON.stringify({plan:renewPlan})}); await loadAdmin() }
  async function postSignal(e){ e.preventDefault(); try{ await api('/api/admin/signals',{method:'POST',body:JSON.stringify(signal)}); setMsg('Text signal posted successfully.'); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function deleteTextSignal(id){ if(!window.confirm('Delete this text signal permanently? This is best for demo/test signals only.')) return; try{ await api(`/api/admin/signals/${id}`,{method:'DELETE'}); setMsg('Text signal deleted successfully.'); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function deleteArchiveReport(id){ if(!window.confirm('Delete this archived report permanently?')) return; try{ await api(`/api/admin/reports/${id}`,{method:'DELETE'}); setMsg('Archived report deleted successfully.'); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function addTrade(e){ e.preventDefault(); try{ await api('/api/admin/trades',{method:'POST',body:JSON.stringify(trade)}); setMsg('Trade signal added successfully.'); await loadAdmin() }catch(err){ setMsg(err.message) } }
  function tradeUpdatePayload(id,status,pips=null,rrr='',resultPercent=''){
    const payload={status}
    if(pips!==null && pips!=='' && pips!==undefined) payload.resultPips=Number(pips)
    if(rrr!=='' && rrr!==undefined && rrr!==null) payload.riskReward=String(rrr)
    if(resultPercent!=='' && resultPercent!==undefined && resultPercent!==null) payload.resultPercent=Number(resultPercent)
    return payload
  }
  async function updateTrade(id, pips, rrr='', resultPercent=''){
    try{
      await api(`/api/admin/trades/${id}`,{method:'PUT',body:JSON.stringify(tradeUpdatePayload(id,tradeStatusFromPips(pips),pips,rrr,resultPercent))})
      setMsg('Trade result updated with exact pips, R:R and account %.')
      await loadAdmin()
    }catch(err){ setMsg(err.message) }
  }
  async function setTradeStatus(id, status, resultPips=null, rrr='', resultPercent=''){
    try{
      const payload=tradeUpdatePayload(id,status,resultPips,rrr,resultPercent)
      await api(`/api/admin/trades/${id}`,{method:'PUT',body:JSON.stringify(payload)})
      setMsg(`Signal status updated: ${signalStatusLabel(status, resultPips??0)}`)
      await loadAdmin()
    }catch(err){ setMsg(err.message) }
  }
  function startEditTrade(t){ setEditingTrade({ _id:t._id, pair:t.pair||'', category:t.category||'Forex', direction:t.direction||'BUY', entry:t.entry||'', stopLoss:t.stopLoss||'', takeProfit1:t.takeProfit1||'', takeProfit2:t.takeProfit2||'', riskReward:t.riskReward||'', riskPercent:t.riskPercent||'', resultPercent:t.resultPercent||'', notes:t.notes||'', status:t.status||'active', resultPips:t.resultPips||0 }) }
  async function saveTradeEdit(e){ e.preventDefault(); if(!editingTrade?._id) return; try{ const {_id,...payload}=editingTrade; payload.resultPips=Number(payload.resultPips||0); payload.riskPercent=Number(payload.riskPercent||0); payload.resultPercent=Number(payload.resultPercent||0); await api(`/api/admin/trades/${_id}`,{method:'PUT',body:JSON.stringify(payload)}); setEditingTrade(null); setMsg('Trade signal edited successfully.'); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function deleteTrade(id){ if(!window.confirm('Hide this trade from dashboard? It will stay in report history and pips tracking.')) return; try{ await api(`/api/admin/trades/${id}`,{method:'DELETE'}); setMsg('Trade hidden from dashboard. Report history and pips tracking are kept.'); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function testEmail(){ try{ await api('/api/admin/test-email',{method:'POST',body:JSON.stringify({})}); setMsg('Test email sent. Check inbox/spam.'); }catch(err){ setMsg(err.message) } }
  async function sendReportTelegram(){ try{ await api('/api/admin/report/send-telegram',{method:'POST'}); setMsg('Weekly report sent to Telegram.'); }catch(err){ setMsg(err.message) } }
  async function archiveCurrent(period, sendVipEmail=false){
    try{
      const data = await api('/api/admin/reports/archive-current',{method:'POST',body:JSON.stringify({period,title:`${period} Performance Report`, sendVipEmail})})
      if(sendVipEmail){
        const summary = data?.emailSummary
        setMsg(`${period} report saved and emailed to VIP members.${summary ? ` Sent: ${summary.sent}, Skipped: ${summary.skipped}, Failed: ${summary.failed}` : ''}`)
      }else{
        setMsg(`${period} report saved to archive.`)
      }
      await loadAdmin()
    }catch(err){ setMsg(err.message) }
  }
  function onAnalysisChart(e){ const f=e.target.files[0]; setAnalysisChart(f||null); setAnalysisPreview(f?URL.createObjectURL(f):'') }

  function onProofImage(e){ const f=e.target.files[0]; setProofImage(f||null); setProofPreview(f?URL.createObjectURL(f):'') }
  async function addProof(e){ e.preventDefault(); try{ const fd=new FormData(); Object.entries(proofForm).forEach(([k,v])=>fd.append(k,String(v))); if(proofImage) fd.append('proofImage',proofImage); await api('/api/admin/proofs',{method:'POST',body:fd}); setMsg('Proof screenshot added successfully.'); setProofImage(null); setProofPreview(''); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function deleteProof(id){ await api(`/api/admin/proofs/${id}`,{method:'DELETE'}); await loadAdmin() }

  async function postAnalysis(e){ e.preventDefault(); try{ const fd=new FormData(); Object.entries(analysisForm).forEach(([k,v])=>fd.append(k, String(v))); if(analysisChart) fd.append('chartImage',analysisChart); await api('/api/admin/analysis',{method:'POST',body:fd}); setMsg('Analysis posted. If Telegram checkbox is enabled, chart was sent to channel too.'); setAnalysisChart(null); setAnalysisPreview(''); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function postAnalysisUpdate(e,id){
    e.preventDefault()
    try{
      await api(`/api/admin/analysis/${id}/update`,{method:'POST',body:JSON.stringify(analysisUpdateForm)})
      setMsg('Analysis update added successfully.')
      setActiveAnalysisUpdate(null)
      setAnalysisUpdateForm({status:'running',comment:'Running according to our analysis. Waiting for next confirmation.',visibility:'public',sendTelegram:true})
      await loadAdmin()
    }catch(err){ setMsg(err.message) }
  }
  async function deleteAnalysis(id){ await api(`/api/admin/analysis/${id}`,{method:'DELETE'}); await loadAdmin() }
  return <section className="section"><p className="green">ADMIN DASHBOARD</p><h2>Telegram Analysis Image Posting + Full Management</h2><button className="refresh" onClick={loadAdmin}>Refresh Admin Data</button>{msg&&<p className={msg.toLowerCase().includes('success')||msg.toLowerCase().includes('refreshed')||msg.toLowerCase().includes('saved')||msg.toLowerCase().includes('sent')||msg.toLowerCase().includes('posted')?'success':'error'}>{msg}</p>}{viewer&&<div className="modal" onClick={()=>setViewer(null)}><div className="modalInner"><button onClick={()=>setViewer(null)}>Close</button><img src={viewer}/></div></div>}
    <div className="adminTabNav">{adminTabs.map(([key,label])=><button key={key} className={adminView===key?'active':''} onClick={()=>showAdminTab(key)}>{label}</button>)}</div>
    <div id="admin-overview"></div>
    {report?.stats && <div><h3 className="sectionTitle">Performance Summary</h3><StatsCards stats={report.stats}/></div>}
    <div className="buttonRow"><button onClick={()=>archiveCurrent('Weekly')}>Save Weekly Archive</button><button onClick={()=>archiveCurrent('Weekly', true)}>Save Weekly + Email VIP Members</button><button onClick={()=>archiveCurrent('Monthly')}>Save Monthly Archive</button><button onClick={sendReportTelegram}>Send Report to Telegram</button><button onClick={testEmail}>Test Email Notification</button></div>
    {report && <WeeklyPerformanceStudio report={report} trades={trades} showActions={true} compact={false}/>}
    {report?.reportText && <div className="card"><h3>Current Weekly Report</h3><pre>{cleanReportText(report.reportText)}</pre></div>}
    
    <div className="emailNoticeBox">
      <h3>Email Notifications</h3>
      <p>Email notifications are sent when a user registers, submits payment proof, when admin approves VIP access, and now when you save a weekly report with the VIP email option.</p>
      <p>To activate emails, add SMTP variables in Render Environment and redeploy backend.</p>
    </div>

    <div className="adminGrid">
      <div id="admin-members" className="adminBox full expiryAdminBox"><h3>VIP Expiry Watchlist</h3><p>Members expiring within 7 days show here so you can message them and renew early.</p><div className="expiryStatsRow"><div><strong>{expiringMembers.length}</strong><span>Expiring Soon</span></div><div><strong>{expiredMembers.length}</strong><span>Expired / Not Active</span></div></div>{expiringMembers.length===0&&<p>No active VIP members expiring in the next 7 days.</p>}{expiringMembers.map(u=><div className="adminRow expiryRow" key={u.id}><strong>{u.name}</strong><p>{u.email}</p><p>Plan: {u.plan || 'VIP'} | Expires: {formatDate(u.vipExpiryDate)}</p><span className={isExpiringSoon(u.daysRemaining)?'dangerPill':'warnPill'}>{u.daysRemaining} day{Number(u.daysRemaining)===1?'':'s'} left</span><div className="rowBtns"><button onClick={()=>renewVip(u.id)}>Renew VIP</button><button onClick={()=>removeVip(u.id)}>Remove VIP</button></div></div>)}</div>
            
      <div id="admin-marketing" className="adminBox full announcementAdminBox">
        <h3>Admin Announcements</h3>
        <p>Post urgent updates for VIP members or public visitors. You can also send the announcement to Telegram.</p>
        <form onSubmit={createAnnouncement} className="form compact announcementForm">
          <input placeholder="Announcement title" value={announcementForm.title} onChange={e=>setAnnouncementForm({...announcementForm,title:e.target.value})}/>
          <textarea rows="4" placeholder="Announcement message" value={announcementForm.message} onChange={e=>setAnnouncementForm({...announcementForm,message:e.target.value})}/>
          <select value={announcementForm.visibility} onChange={e=>setAnnouncementForm({...announcementForm,visibility:e.target.value})}>
            <option value="vip">VIP Only</option>
            <option value="public">Public</option>
          </select>
          <label className="check"><input type="checkbox" checked={announcementForm.sendTelegram} onChange={e=>setAnnouncementForm({...announcementForm,sendTelegram:e.target.checked})}/> Send to Telegram</label>
          <button>Post Announcement</button>
        </form>
        <div className="announcementAdminList">
          {announcements.length===0&&<p>No announcements yet.</p>}<AdminShowToggle itemsKey="announcements" total={announcements.length}/>
          {adminItems(announcements,'announcements').map(a=><div className="adminRow" key={a._id}>
            <strong>{a.title}</strong>
            <p>{a.message}</p>
            <p>{String(a.visibility||'public').toUpperCase()} · {formatDateTime(a.createdAt)} · Telegram: {a.sentToTelegram?'YES':'NO'}</p>
            <div className="rowBtns"><button onClick={()=>deleteAnnouncement(a._id)}>Delete</button></div>
          </div>)}
        </div>
      </div>

      <div className="adminBox full"><h3>Coupon / Discount Codes</h3>
        <form onSubmit={createCoupon} className="form compact couponAdminForm">
          <input placeholder="Coupon code" value={couponForm.code} onChange={e=>setCouponForm({...couponForm,code:e.target.value.toUpperCase()})}/>
          <select value={couponForm.discountType} onChange={e=>setCouponForm({...couponForm,discountType:e.target.value})}>
            <option value="percent">Percent Discount</option>
            <option value="fixed">Fixed USD Discount</option>
          </select>
          <input type="number" placeholder="Discount value" value={couponForm.discountValue} onChange={e=>setCouponForm({...couponForm,discountValue:e.target.value})}/>
          <input placeholder="Note" value={couponForm.note} onChange={e=>setCouponForm({...couponForm,note:e.target.value})}/>
          <label className="check"><input type="checkbox" checked={couponForm.active} onChange={e=>setCouponForm({...couponForm,active:e.target.checked})}/> Active</label>
          <button>Create Coupon</button>
        </form>
        {coupons.length===0&&<p>No coupons yet.</p>}<AdminShowToggle itemsKey="coupons" total={coupons.length}/>
        {adminItems(coupons,'coupons').map(c=><div key={c._id} className="adminRow">
          <strong>{c.code}</strong>
          <p>{c.discountType}: {c.discountValue} | Active: {c.active?'YES':'NO'} | Used: {c.usageCount}</p>
          <p>{c.note}</p>
          <div className="rowBtns">
            <button onClick={()=>toggleCoupon(c._id,!c.active)}>{c.active?'Disable':'Enable'}</button>
            <button onClick={()=>deleteCoupon(c._id)}>Delete</button>
          </div>
        </div>)}
      </div>

      <div id="admin-referrals" className="adminBox full"><h3>Referral / Affiliate Tracking</h3>
        {adminReferrals.length===0&&<p>No referrals yet.</p>}<AdminShowToggle itemsKey="referrals" total={adminReferrals.length}/>
        {adminItems(adminReferrals,'referrals').map(r=><div key={r._id} className="adminRow"><strong>{r.referredName || r.referredEmail}</strong><p>Referred by: {r.referrerEmail}</p><p>Status: {r.status} | Plan: {r.plan || 'Not selected yet'}</p><div className="rowBtns"><button onClick={()=>updateReferral(r._id,'pending')}>Pending</button><button onClick={()=>updateReferral(r._id,'approved')}>Approved</button><button onClick={()=>updateReferral(r._id,'paid')}>Paid</button></div></div>)}
      </div>
      <div className="adminBox"><h3>Payment Proofs</h3>{payments.length===0&&<p>No payment proofs found.</p>}<AdminShowToggle itemsKey="payments" total={payments.length}/>{adminItems(payments,'payments').map(p=><div className="adminRow" key={p._id}><strong>{p.userName}</strong><p>{p.plan}</p><p>{p.method} | {p.transactionId}</p><p>Status: {p.status}</p><div className="rowBtns"><button onClick={()=>viewShot(p._id)}>View Screenshot</button>{p.status!=='approved'&&<button onClick={()=>approve(p._id)}>Approve VIP</button>}</div></div>)}</div>
      <div className="adminBox full memberManagerBox"><h3>Member Search & Management</h3><p>Find members quickly by name, email, status or plan. Use filters to manage VIP, pending, expired and expiring members faster.</p><div className="memberManagerTools"><input placeholder="Search member by name, email, status or plan..." value={memberSearch} onChange={e=>setMemberSearch(e.target.value)}/><select value={renewPlan} onChange={e=>setRenewPlan(e.target.value)}><option>1 Month VIP - $45</option><option>3 Months VIP - $100</option><option>Lifetime VIP - $400</option></select></div><div className="memberFilterButtons">{memberFilterButtons.map(([key,label,count])=><button key={key} className={memberFilter===key?'active':''} onClick={()=>setMemberFilter(key)}>{label}<small>{count}</small></button>)}</div><div className="memberResultLine">Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> members</div>{filteredUsers.length===0&&<p>No members found for this search/filter.</p>}<AdminShowToggle itemsKey="users" total={filteredUsers.length}/>{adminItems(filteredUsers,'users').map(u=>{ const statusText=String(u.status||'not_paid'); const expiring=u.vip&&isExpiringThisWeek(u.daysRemaining); return <div className="adminRow memberRow" key={u.id}><div className="memberRowHead"><div><strong>{u.name||'No name'}</strong><p>{u.email}</p></div><div className="memberBadges"><span className={u.vip?'memberBadge vip':'memberBadge normal'}>{u.vip?'VIP ACTIVE':'NOT VIP'}</span><span className={`memberBadge ${statusText.toLowerCase().replace(/[^a-z0-9]/g,'')}`}>{statusText}</span></div></div><p>Plan: {u.plan || 'No plan selected'}</p><p>Expires: {formatDate(u.vipExpiryDate)} | Remaining: {u.daysRemaining==='Lifetime'?'Lifetime':`${u.daysRemaining||0} days`}</p>{expiring&&<span className={isExpiringSoon(u.daysRemaining)?'dangerPill':'warnPill'}>{isExpiringSoon(u.daysRemaining)?'Renew urgently':'Expiring this week'}</span>}<div className="rowBtns"><button onClick={()=>renewVip(u.id)}>Renew / Extend VIP</button><button onClick={()=>removeVip(u.id)}>Remove VIP</button></div></div>})}</div>
      <div id="admin-signals" className="adminBox"><h3>Post Text Signal</h3><form onSubmit={postSignal} className="form compact"><input value={signal.title} onChange={e=>setSignal({...signal,title:e.target.value})}/><textarea rows="7" value={signal.message} onChange={e=>setSignal({...signal,message:e.target.value})}/><label className="check"><input type="checkbox" checked={signal.sendTelegram} onChange={e=>setSignal({...signal,sendTelegram:e.target.checked})}/> Send to Telegram</label><button>Post Signal</button></form></div>
      <div className="adminBox full"><h3>Posted Text Signals</h3><p className="smallNote">Use this to remove demo/test text signals from VIP Area.</p>{textSignals.length===0&&<p>No text signals found.</p>}<AdminShowToggle itemsKey="textSignals" total={textSignals.length}/>{adminItems(textSignals,'textSignals').map(s=><div className="adminRow" key={s._id}><strong>{s.title}</strong><p>Signal Given: {formatDateTime(s.createdAt)}</p><pre>{s.message}</pre><div className="rowBtns"><button onClick={()=>deleteTextSignal(s._id)}>Delete Signal</button></div></div>)}</div>
      <div className="adminBox"><h3>Add Trade Signal</h3>
        <div className="quickTemplateBox">
          <div className="quickTemplateHead">
            <strong>Quick Signal Templates</strong>
            <small>Click one, then add exact Entry / SL / TP levels.</small>
          </div>
          <div className="quickTemplateGrid">
            {tradeTemplates.map(t=><button type="button" key={t.label} className={`templateBtn ${t.direction.toLowerCase()}`} onClick={()=>useTradeTemplate(t)}>{t.label}</button>)}
          </div>
        </div>
        <form onSubmit={addTrade} className="form compact"><input placeholder="Pair" value={trade.pair} onChange={e=>setTrade({...trade,pair:e.target.value})}/><select value={trade.category} onChange={e=>setTrade({...trade,category:e.target.value})}><option>Gold</option><option>Forex</option><option>Crypto</option><option>Indices</option><option>Oil</option></select><select value={trade.direction} onChange={e=>setTrade({...trade,direction:e.target.value})}><option>BUY</option><option>SELL</option></select><input placeholder="Entry" value={trade.entry} onChange={e=>setTrade({...trade,entry:e.target.value})}/><input placeholder="Stop Loss" value={trade.stopLoss} onChange={e=>setTrade({...trade,stopLoss:e.target.value})}/><input placeholder="TP1" value={trade.takeProfit1} onChange={e=>setTrade({...trade,takeProfit1:e.target.value})}/><input placeholder="TP2" value={trade.takeProfit2} onChange={e=>setTrade({...trade,takeProfit2:e.target.value})}/><input placeholder="Risk Reward e.g. 1:2" value={trade.riskReward} onChange={e=>setTrade({...trade,riskReward:e.target.value})}/><input type="number" step="0.01" placeholder="Risk % of capital e.g. 1" value={trade.riskPercent} onChange={e=>setTrade({...trade,riskPercent:e.target.value})}/><input type="number" step="0.01" placeholder="Expected result % optional e.g. 2" value={trade.resultPercent} onChange={e=>setTrade({...trade,resultPercent:e.target.value})}/><textarea placeholder="Notes" value={trade.notes} onChange={e=>setTrade({...trade,notes:e.target.value})}/><label className="check"><input type="checkbox" checked={trade.sendTelegram} onChange={e=>setTrade({...trade,sendTelegram:e.target.checked})}/> Send to Telegram</label><button>Add Trade</button></form></div>
      <div className="adminBox full"><h3>Manage Trades With Exact Pips</h3><AdminFilterBar search={adminTradeSearch} setSearch={setAdminTradeSearch} filter={adminTradeFilter} setFilter={setAdminTradeFilter} placeholder="Search pair, market, notes..." total={trades.length} shown={filteredAdminTrades.length} filters={[['all','All Status'],['running','Running'],['tp1-hit','TP1 Hit'],['tp2-hit','TP2 Hit'],['sl-hit','SL Hit'],['break-even','Break Even'],['closed','Closed']]}/>{filteredAdminTrades.length===0&&<p>No trades found.</p>}<AdminShowToggle itemsKey="trades" total={filteredAdminTrades.length}/>{adminItems(filteredAdminTrades,'trades').map(t=>{ const statusLabel=signalStatusLabel(t.status,t.resultPips); const statusClass=signalStatusClass(t.status,t.resultPips); return <div className="adminRow" key={t._id}><strong>{t.pair} {t.direction}</strong><p>Status: <span className={`signalStatus ${statusClass}`}>{statusLabel}</span> | Current pips: {t.resultPips} | R:R: {t.riskReward || 'N/A'} | Risk: {Number(t.riskPercent||0)}% | Result: {formatPercent(t.resultPercent)}</p><p className="signalDate">Signal Given: {formatDateTime(t.createdAt)}</p><div className="exactPipsRow tradeResultInputs"><input type="number" placeholder="Exact pips e.g. 145 / -50" value={customPips[t._id]||''} onChange={e=>setCustomPips({...customPips,[t._id]:e.target.value})}/><input placeholder="R:R e.g. 1:2.5" value={customRRR[t._id]||''} onChange={e=>setCustomRRR({...customRRR,[t._id]:e.target.value})}/><input type="number" step="0.01" placeholder="Gain/Loss % e.g. 2 / -1" value={customResultPercent[t._id]||''} onChange={e=>setCustomResultPercent({...customResultPercent,[t._id]:e.target.value})}/></div><div className="rowBtns tradeUpdateBtns"><button onClick={()=>setTradeStatus(t._id,'active',0,customRRR[t._id]||t.riskReward||'',0)}>Running</button><button onClick={()=>setTradeStatus(t._id,'tp1',customPips[t._id]||t.resultPips||0,customRRR[t._id]||t.riskReward||'',customResultPercent[t._id]||t.resultPercent||'')}>TP1 Hit + Pips</button><button onClick={()=>setTradeStatus(t._id,'tp2',customPips[t._id]||t.resultPips||0,customRRR[t._id]||t.riskReward||'',customResultPercent[t._id]||t.resultPercent||'')}>TP2 Hit + Pips</button><button onClick={()=>setTradeStatus(t._id,'sl',customPips[t._id]||t.resultPips||0,customRRR[t._id]||t.riskReward||'',customResultPercent[t._id]||t.resultPercent||'')}>SL Hit + Pips</button><button onClick={()=>setTradeStatus(t._id,'breakeven',0,customRRR[t._id]||t.riskReward||'',0)}>BE 0</button><button onClick={()=>updateTrade(t._id, customPips[t._id]||0, customRRR[t._id]||t.riskReward||'', customResultPercent[t._id]||t.resultPercent||'')}>Manual Close + Pips</button><button onClick={()=>startEditTrade(t)}>Edit</button><button onClick={()=>deleteTrade(t._id)}>Hide from Dashboard</button></div>{editingTrade?._id===t._id&&<form onSubmit={saveTradeEdit} className="form compact"><input placeholder="Pair" value={editingTrade.pair} onChange={e=>setEditingTrade({...editingTrade,pair:e.target.value})}/><select value={editingTrade.category} onChange={e=>setEditingTrade({...editingTrade,category:e.target.value})}><option>Gold</option><option>Forex</option><option>Crypto</option><option>Indices</option><option>Oil</option></select><select value={editingTrade.direction} onChange={e=>setEditingTrade({...editingTrade,direction:e.target.value})}><option>BUY</option><option>SELL</option></select><input placeholder="Entry" value={editingTrade.entry} onChange={e=>setEditingTrade({...editingTrade,entry:e.target.value})}/><input placeholder="Stop Loss" value={editingTrade.stopLoss} onChange={e=>setEditingTrade({...editingTrade,stopLoss:e.target.value})}/><input placeholder="TP1" value={editingTrade.takeProfit1} onChange={e=>setEditingTrade({...editingTrade,takeProfit1:e.target.value})}/><input placeholder="TP2" value={editingTrade.takeProfit2} onChange={e=>setEditingTrade({...editingTrade,takeProfit2:e.target.value})}/><input placeholder="Risk Reward" value={editingTrade.riskReward} onChange={e=>setEditingTrade({...editingTrade,riskReward:e.target.value})}/><input type="number" step="0.01" placeholder="Risk %" value={editingTrade.riskPercent} onChange={e=>setEditingTrade({...editingTrade,riskPercent:e.target.value})}/><input type="number" step="0.01" placeholder="Result %" value={editingTrade.resultPercent} onChange={e=>setEditingTrade({...editingTrade,resultPercent:e.target.value})}/><select value={editingTrade.status} onChange={e=>setEditingTrade({...editingTrade,status:e.target.value})}><option value="active">Running</option><option value="tp1">TP1 Hit</option><option value="tp2">TP2 Hit</option><option value="sl">SL Hit</option><option value="breakeven">Break Even</option><option value="closed">Closed</option></select><input type="number" placeholder="Result pips" value={editingTrade.resultPips} onChange={e=>setEditingTrade({...editingTrade,resultPips:e.target.value})}/><textarea placeholder="Notes" value={editingTrade.notes} onChange={e=>setEditingTrade({...editingTrade,notes:e.target.value})}/><div className="rowBtns"><button>Save Edit</button><button type="button" onClick={()=>setEditingTrade(null)}>Cancel</button></div></form>}</div>})}</div>
      <div id="admin-analysis" className="adminBox full"><h3>Post Market Analysis With Chart Image</h3><form onSubmit={postAnalysis} className="form compact"><input placeholder="Title" value={analysisForm.title} onChange={e=>setAnalysisForm({...analysisForm,title:e.target.value})}/><select value={analysisForm.market} onChange={e=>setAnalysisForm({...analysisForm,market:e.target.value})}><option>Gold</option><option>GBPUSD</option><option>EURUSD</option><option>US30</option><option>BTCUSD</option><option>Oil</option><option>Other</option></select><select value={analysisForm.bias} onChange={e=>setAnalysisForm({...analysisForm,bias:e.target.value})}><option>Bullish</option><option>Bearish</option><option>Neutral</option></select><textarea placeholder="Summary" value={analysisForm.summary} onChange={e=>setAnalysisForm({...analysisForm,summary:e.target.value})}/><textarea rows="7" placeholder="Full analysis content" value={analysisForm.content} onChange={e=>setAnalysisForm({...analysisForm,content:e.target.value})}/><input placeholder="Key levels" value={analysisForm.keyLevels} onChange={e=>setAnalysisForm({...analysisForm,keyLevels:e.target.value})}/><textarea placeholder="Trade plan" value={analysisForm.tradePlan} onChange={e=>setAnalysisForm({...analysisForm,tradePlan:e.target.value})}/><select value={analysisForm.visibility} onChange={e=>setAnalysisForm({...analysisForm,visibility:e.target.value})}><option value="public">Public</option><option value="vip">VIP</option></select><label className="check"><input type="checkbox" checked={analysisForm.sendTelegram} onChange={e=>setAnalysisForm({...analysisForm,sendTelegram:e.target.checked})}/> Send chart + analysis to Telegram</label><label className="uploadBox">Upload chart image<input type="file" accept="image/*" onChange={onAnalysisChart}/></label>{analysisPreview&&<img className="preview analysisPreview" src={analysisPreview}/>}<button>Post Analysis With Chart</button></form></div>
      
      <div id="admin-proofs" className="adminBox full"><h3>Add Real Proof Screenshot</h3>
        <form onSubmit={addProof} className="form compact">
          <input placeholder="Proof title" value={proofForm.title} onChange={e=>setProofForm({...proofForm,title:e.target.value})}/>
          <select value={proofForm.category} onChange={e=>setProofForm({...proofForm,category:e.target.value})}>
            <option>Trading Result</option>
            <option>Member Feedback</option>
            <option>Telegram Proof</option>
            <option>Performance Proof</option>
            <option>Analysis Proof</option>
          </select>
          <textarea placeholder="Short description" value={proofForm.description} onChange={e=>setProofForm({...proofForm,description:e.target.value})}/>
          <select value={proofForm.visibility} onChange={e=>setProofForm({...proofForm,visibility:e.target.value})}>
            <option value="public">Public</option>
            <option value="vip">VIP</option>
          </select>
          <label className="uploadBox">Upload proof screenshot<input type="file" accept="image/*" onChange={onProofImage}/></label>
          {proofPreview&&<img className="preview analysisPreview" src={proofPreview}/>}
          <button>Add Proof Screenshot</button>
        </form>
      </div>
      <div className="adminBox full"><h3>Proof Screenshot Posts</h3>
        <AdminFilterBar search={adminProofSearch} setSearch={setAdminProofSearch} filter={adminProofFilter} setFilter={setAdminProofFilter} placeholder="Search proof title, category..." total={proofs.length} shown={filteredAdminProofs.length} filters={[['all','All Proofs'],['public','Public'],['vip','VIP']]}/>{filteredAdminProofs.length===0&&<p>No proof screenshots found.</p>}<AdminShowToggle itemsKey="proofs" total={filteredAdminProofs.length}/>
        {adminItems(filteredAdminProofs,'proofs').map(p=><div key={p._id} className="adminRow"><strong>{p.title}</strong><p>{p.category} · {p.visibility}</p>{p.proofImageData&&<img className="miniChart" src={imgSrcFromProof(p)} alt={p.title}/>}<div className="rowBtns"><button onClick={()=>deleteProof(p._id)}>Delete</button></div></div>)}
      </div>

      <div className="adminBox full"><h3>Published Analysis Posts</h3><AdminFilterBar search={adminAnalysisSearch} setSearch={setAdminAnalysisSearch} filter={adminAnalysisFilter} setFilter={setAdminAnalysisFilter} placeholder="Search title, market, bias..." total={analysis.length} shown={filteredAdminAnalysis.length} filters={[['all','All Posts'],['public','Public'],['vip','VIP']]}/>{filteredAdminAnalysis.length===0&&<p>No analysis posts found.</p>}<AdminShowToggle itemsKey="analysis" total={filteredAdminAnalysis.length}/>{adminItems(filteredAdminAnalysis,'analysis').map(post=>{ const latest=Array.isArray(post.updates)&&post.updates.length?post.updates[0]:null; return <div key={post._id} className="adminRow"><strong>{post.title}</strong><p>{post.market} · {post.bias} · {post.visibility}</p>{latest&&<div className={`analysisLatestUpdate adminMini ${latest.status}`}><strong>{analysisUpdateStatusIcon(latest.status)} {analysisUpdateStatusLabel(latest.status)}</strong><p>{latest.comment}</p><small>{formatDateTime(latest.createdAt)}</small></div>}{post.chartImageData&&<img className="miniChart" src={imgSrcFromPost(post)} alt={post.title}/>}<div className="rowBtns"><button onClick={()=>setActiveAnalysisUpdate(activeAnalysisUpdate===post._id?null:post._id)}>Add Update</button><button onClick={()=>deleteAnalysis(post._id)}>Delete</button></div>{activeAnalysisUpdate===post._id&&<form onSubmit={e=>postAnalysisUpdate(e,post._id)} className="form compact analysisUpdateForm"><select value={analysisUpdateForm.status} onChange={e=>setAnalysisUpdateForm({...analysisUpdateForm,status:e.target.value})}><option value="running">Running According To Analysis</option><option value="target_hit">Target Hit</option><option value="invalidated">Invalidated By News / Market Change</option><option value="failed">Analysis Failed</option><option value="updated">General Update</option></select><textarea rows="4" placeholder="Write update comment for members" value={analysisUpdateForm.comment} onChange={e=>setAnalysisUpdateForm({...analysisUpdateForm,comment:e.target.value})}/><select value={analysisUpdateForm.visibility} onChange={e=>setAnalysisUpdateForm({...analysisUpdateForm,visibility:e.target.value})}><option value="public">Public Update</option><option value="vip">VIP Only Update</option></select><label className="check"><input type="checkbox" checked={analysisUpdateForm.sendTelegram} onChange={e=>setAnalysisUpdateForm({...analysisUpdateForm,sendTelegram:e.target.checked})}/> Send update to Telegram</label><div className="rowBtns"><button>Add Analysis Update</button><button type="button" onClick={()=>setActiveAnalysisUpdate(null)}>Cancel</button></div></form>}{Array.isArray(post.updates)&&post.updates.length>0&&<div className="analysisUpdateTimeline adminTimeline"><h4>Update History</h4>{post.updates.map((u,i)=><div className={`analysisUpdateItem ${u.status}`} key={u._id||i}><span>{analysisUpdateStatusIcon(u.status)}</span><div><strong>{analysisUpdateStatusLabel(u.status)}</strong><p>{u.comment}</p><small>{formatDateTime(u.createdAt)} · {u.visibility}</small></div></div>)}</div>}</div>})}</div>
      <div id="admin-reports" className="adminBox full"><h3>Archived Reports</h3><AdminFilterBar search={adminReportSearch} setSearch={setAdminReportSearch} filter={adminReportFilter} setFilter={setAdminReportFilter} placeholder="Search report title, period, text..." total={reports.length} shown={filteredAdminReports.length} filters={[['all','All Reports'],['weekly','Weekly'],['monthly','Monthly']]}/>{filteredAdminReports.length===0&&<p>No archived reports found.</p>}<AdminShowToggle itemsKey="reports" total={filteredAdminReports.length}/>{adminItems(filteredAdminReports,'reports').map(r=><div key={r._id} className="adminRow"><strong>{r.title}</strong><p>{r.period} | Pips: {r.totalPips} | Win Rate: {r.winRate}%</p><p>Created: {formatDateTime(r.createdAt)}</p><div className="rowBtns"><button className="dangerDeleteBtn" onClick={()=>deleteArchiveReport(r._id)}>Delete Report</button></div></div>)}</div>
    </div>
  </section>
}


function ProofLightboxController(){
  const [items,setItems]=useState([])
  const [active,setActive]=useState(null)

  useEffect(()=>{
    function collect(){
      const imgs = Array.from(document.querySelectorAll('.proofScreenshotCard img'))
      return imgs.map((img,index)=>{
        const card = img.closest('.proofScreenshotCard')
        const title = card?.querySelector('h3')?.textContent || '1000PIPS Proof'
        const desc = card?.querySelector('p')?.textContent || ''
        const cat = card?.querySelector('.proofScreenshotBody span')?.textContent || 'Proof'
        img.style.cursor = 'zoom-in'
        img.setAttribute('data-proof-index', String(index))
        return { src: img.src, title, desc, cat }
      })
    }

    function handleClick(e){
      const img = e.target.closest?.('.proofScreenshotCard img')
      if(!img) return
      const all = collect()
      const idx = Number(img.getAttribute('data-proof-index') || 0)
      setItems(all)
      setActive(idx)
    }

    const timer = setTimeout(collect, 600)
    document.addEventListener('click', handleClick)
    return ()=>{
      clearTimeout(timer)
      document.removeEventListener('click', handleClick)
    }
  },[])

  if(active===null || !items.length) return null

  const item = items[active] || items[0]
  function close(){ setActive(null) }
  function next(e){ e.stopPropagation(); setActive((active+1)%items.length) }
  function prev(e){ e.stopPropagation(); setActive((active-1+items.length)%items.length) }

  return <div className="globalProofLightbox" onClick={close}>
    <div className="globalProofBox" onClick={e=>e.stopPropagation()}>
      <button className="globalProofClose" onClick={close}>×</button>
      {items.length>1&&<button className="globalProofNav globalProofPrev" onClick={prev}>‹</button>}
      <img src={item.src} alt={item.title}/>
      {items.length>1&&<button className="globalProofNav globalProofNext" onClick={next}>›</button>}
      <div className="globalProofCaption">
        <span>{item.cat}</span>
        <h3>{item.title}</h3>
        <p>{item.desc}</p>
        <small>{active+1} / {items.length}</small>
      </div>
    </div>
  </div>
}


function PolicyHero({label,title,children,setPage}){
  return <section className="section legalPage">
    <div className="legalHero">
      <p className="green">{label}</p>
      <h2>{title}</h2>
      <p>{children}</p>
      <button onClick={()=>setPage('home')}>Back to Home</button>
    </div>
  </section>
}

function RiskWarningPage({setPage}){
  return <>
    <PolicyHero label="1000PIPSFX LEGAL" title="Risk Warning" setPage={setPage}>
      Trading Forex, Gold, Crypto, Indices and Oil involves risk. This page explains important risk information for all users and VIP members.
    </PolicyHero>
    <section className="section legalContent">
      <div className="legalCard"><h3>No Profit Guarantee</h3><p>1000PIPSFX does not guarantee profit, income, pips, account growth or funded account success. Market conditions can change quickly and losses can happen even with a good trade plan.</p></div>
      <div className="legalCard"><h3>Educational / Informational Purpose</h3><p>Signals, analysis, trade updates, reports and Telegram posts are provided for educational and informational purposes. They are not personal financial advice.</p></div>
      <div className="legalCard"><h3>User Responsibility</h3><p>Every trader is responsible for their own trading decisions, lot size, leverage, stop loss, risk management and account protection.</p></div>
      <div className="legalCard"><h3>Use Proper Risk Management</h3><p>Always use stop loss and avoid over-risking. We recommend members trade with discipline and never risk money they cannot afford to lose.</p></div>
      <div className="legalCard"><h3>High-Impact News</h3><p>Economic news, geopolitical events and sudden volatility can invalidate analysis and cause slippage, spread widening or fast price movement.</p></div>
    </section>
  </>
}

function TermsPage({setPage}){
  return <>
    <PolicyHero label="1000PIPSFX LEGAL" title="Terms & Conditions" setPage={setPage}>
      These terms explain the basic rules for using 1000PIPSFX, VIP access, signals, payments and member responsibilities.
    </PolicyHero>
    <section className="section legalContent">
      <div className="legalCard"><h3>Service Access</h3><p>VIP access is provided after payment proof is submitted and approved by admin. Access may include VIP dashboard, Telegram updates, analysis, reports and trade posts.</p></div>
      <div className="legalCard"><h3>No Guaranteed Results</h3><p>Trading results are not guaranteed. Past performance, proof posts, reports or testimonials do not guarantee future results.</p></div>
      <div className="legalCard"><h3>Payment Approval</h3><p>Payment proof must be clear and valid. Admin may reject unclear, duplicate, fraudulent or incorrect payment submissions.</p></div>
      <div className="legalCard"><h3>VIP Account Use</h3><p>VIP access is for the approved member only. Sharing login details, private signals, VIP Telegram content or paid material outside the service is not allowed.</p></div>
      <div className="legalCard"><h3>Refund Policy</h3><p>Because signals, analysis and digital VIP access are delivered immediately after approval, payments are generally non-refundable unless admin decides otherwise in a specific case.</p></div>
      <div className="legalCard"><h3>Service Changes</h3><p>1000PIPSFX may update pricing, features, Telegram access, reports, signal format, analysis sections or platform design to improve the service.</p></div>
    </section>
  </>
}

function PrivacyPolicyPage({setPage}){
  return <>
    <PolicyHero label="1000PIPSFX LEGAL" title="Privacy Policy" setPage={setPage}>
      This page explains what information 1000PIPSFX collects and how it is used for account access, payments, support and service operation.
    </PolicyHero>
    <section className="section legalContent">
      <div className="legalCard"><h3>Information We Collect</h3><p>We may collect name, email address, account status, VIP plan, payment proof screenshots, testimonial submissions, referral data and messages submitted through the platform.</p></div>
      <div className="legalCard"><h3>How We Use Information</h3><p>Information is used to create accounts, review payments, approve VIP access, send service emails, manage member access, provide support and improve the platform.</p></div>
      <div className="legalCard"><h3>Payment Proofs</h3><p>Payment screenshots are used only to verify member payments and approve VIP access. Users should avoid uploading unnecessary sensitive information.</p></div>
      <div className="legalCard"><h3>Testimonials</h3><p>Testimonials submitted by members may be reviewed by admin and displayed publicly only after approval.</p></div>
      <div className="legalCard"><h3>Data Protection</h3><p>We aim to protect member information and only use it for service-related purposes. No online system can be guaranteed 100% secure.</p></div>
      <div className="legalCard"><h3>Contact</h3><p>For privacy or support questions, contact 1000PIPSFX through the official support channels listed on the website.</p></div>
    </section>
  </>
}

function FloatingContactButtons(){
  return <div className="floatingContacts">
    <a className="whatsappFloat" href={WHATSAPP_CONTACT} target="_blank" rel="noreferrer">WhatsApp</a>
    <a className="telegramFloat" href={TELEGRAM_CONTACT} target="_blank" rel="noreferrer">Telegram</a>
  </div>
}

function Footer({setPage}){ return <footer>
  <h2>1000PIPS</h2>
  <p>Professional Forex Signals & Market Analysis</p>
  <div className="footerSocialLinks">
    <a href={INSTAGRAM_LINK} target="_blank" rel="noreferrer">Instagram</a>
    <a href={FACEBOOK_LINK} target="_blank" rel="noreferrer">Facebook</a><a href={TRUSTPILOT_LINK} target="_blank" rel="noreferrer">Trustpilot</a>
  </div>
  <div className="footerLegalLinks">
    <button onClick={()=>setPage('risk')}>Risk Warning</button>
    <button onClick={()=>setPage('terms')}>Terms & Conditions</button>
    <button onClick={()=>setPage('privacy')}>Privacy Policy</button>
  </div>
  <small className="footerRiskNote">Trading involves risk. 1000PIPSFX does not guarantee profit.</small>
</footer> }


class ErrorBoundary extends React.Component{
  constructor(props){ super(props); this.state={error:null} }
  static getDerivedStateFromError(error){ return {error} }
  componentDidCatch(error, info){ console.error('1000PIPS app error:', error, info) }
  render(){
    if(this.state.error){
      return <div style={{minHeight:'100vh',background:'#050505',color:'white',padding:'30px',fontFamily:'Arial'}}>
        <h1>1000PIPS loading issue</h1>
        <p>Please refresh the page. If it still happens, clear browser cache and login again.</p>
        <pre style={{whiteSpace:'pre-wrap',background:'#111',padding:'15px',borderRadius:'10px'}}>{String(this.state.error.message||this.state.error)}</pre>
        <button onClick={()=>{localStorage.removeItem('token');localStorage.removeItem('user');location.reload()}} style={{padding:'12px 18px',borderRadius:'10px',border:'0',cursor:'pointer'}}>Clear Login & Reload</button>
      </div>
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<ErrorBoundary><App/></ErrorBoundary>)
