
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
function formatDate(d){ return d?new Date(d).toLocaleDateString():'Lifetime' }
function tradeStatusFromPips(pips){ const n=Number(pips); if(n>0) return 'tp'; if(n<0) return 'sl'; return 'breakeven' }
function VipBadge({user}){ if(!user) return null; if(user.vip) return <div className="vipBadge">VIP Active · {user.daysRemaining==='Lifetime'?'Lifetime':`${user.daysRemaining} days left`}</div>; if(user.status==='expired') return <div className="expiredBadge">VIP Expired</div>; return <div className="pendingBadge">Status: {user.status||'Not Paid'}</div> }
function imgSrcFromPost(post){ return post.chartImageData ? `data:${post.chartImageMime};base64,${post.chartImageData}` : '' }
function imgSrcFromProof(proof){ return proof.proofImageData ? `data:${proof.proofImageMime};base64,${proof.proofImageData}` : '' }

function App(){
  const [page,setPage]=useState('home')
  const [user,setUser]=useState(null)
  useEffect(()=>{ const u=localStorage.getItem('user'); if(u){ setUser(JSON.parse(u)); refreshMe() } },[])
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
        <button onClick={()=>setPage('admin')}>Admin</button>
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
    {page==='archive' && <Archive user={user} setPage={setPage}/>} 
    {page==='analysis' && <AnalysisPage user={user} setPage={setPage}/>} 
    {page==='admin' && <Admin user={user} setPage={setPage}/>} 
    <FloatingContactButtons/><Footer/>
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
function Login({saveSession,setPage}){ const[mode,setMode]=useState('login'),[form,setForm]=useState({name:'',email:'',password:''}),[msg,setMsg]=useState(''),[loading,setLoading]=useState(false); async function submit(e){ e.preventDefault(); setMsg(''); setLoading(true); try{ const path=mode==='login'?'/api/auth/login':'/api/auth/register'; const payload=mode==='login'?{email:form.email,password:form.password}:{name:form.name,email:form.email,password:form.password}; const data=await api(path,{method:'POST',body:JSON.stringify(payload)}); saveSession(data.token,data.user); setPage(data.user.role==='admin'?'admin':'payment') }catch(err){ setMsg(err.message) } finally{ setLoading(false) } } return <section className="section narrow"><p className="green">{mode==='login'?'LOGIN':'REGISTER'}</p><h2>{mode==='login'?'Member Login':'Create VIP Account'}</h2><form className="form" onSubmit={submit}>{mode==='register'&&<input required placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>}<input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input required type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button disabled={loading}>{loading?'Please wait...':mode==='login'?'Login':'Register'}</button>{msg&&<p className="error">{msg}</p>}<p className="switchText">{mode==='login'?'No account? ':'Already have an account? '}<button type="button" className="textBtn" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'Register':'Login'}</button></p></form></section> }
function Payment({user,setUser,setPage}){ const[plan,setPlan]=useState('3 Months VIP - $100'),[method,setMethod]=useState('PayPal'),[transactionId,setTransactionId]=useState(''),[note,setNote]=useState(''),[screenshot,setScreenshot]=useState(null),[preview,setPreview]=useState(''),[msg,setMsg]=useState(''),[loading,setLoading]=useState(false); function onFile(e){ const f=e.target.files[0]; setScreenshot(f||null); setPreview(f?URL.createObjectURL(f):'') } async function submit(e){ e.preventDefault(); setMsg(''); if(!user){ setPage('login'); return } const fd=new FormData(); fd.append('plan',plan); fd.append('method',method); fd.append('transactionId',transactionId); fd.append('note',note); if(screenshot) fd.append('screenshot',screenshot); setLoading(true); try{ await api('/api/payments/proof',{method:'POST',body:fd}); const updated={...user,plan,status:'pending_payment'}; localStorage.setItem('user',JSON.stringify(updated)); setUser(updated); setMsg('Payment proof submitted successfully. Admin will review and approve your VIP access.'); setTransactionId(''); setNote(''); setScreenshot(null); setPreview('') }catch(err){ setMsg(err.message) } finally{ setLoading(false) } } return <section className="section"><p className="green">PAYMENT DETAILS</p><h2>Activate Your VIP Access</h2><div className="payGrid"><div><h3>PayPal</h3><p>{PAYPAL_EMAIL}</p></div><div><h3>Skrill</h3><p>{SKRILL_EMAIL}</p></div><div><h3>Binance Pay</h3><p>ID: {BINANCE_PAY_ID}</p></div></div><form className="form" onSubmit={submit}><select value={plan} onChange={e=>setPlan(e.target.value)}><option>1 Month VIP - $45</option><option>3 Months VIP - $100</option><option>Lifetime VIP - $400</option></select><select value={method} onChange={e=>setMethod(e.target.value)}><option>PayPal</option><option>Skrill</option><option>Binance Pay</option></select><input required placeholder="Transaction ID / Payment Reference" value={transactionId} onChange={e=>setTransactionId(e.target.value)}/><textarea placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)}/><label className="uploadBox">Upload payment screenshot<input type="file" accept="image/*" onChange={onFile}/></label>{preview&&<img className="preview" src={preview}/>}<button disabled={loading}>{loading?'Submitting...':'Submit Payment Proof'}</button>{msg&&<p className={msg.includes('successfully')?'success':'error'}>{msg}</p>}</form></section> }
function StatsCards({stats}){ return <div className="statsGrid"><div><h3>{stats.activeTrades}</h3><p>Active Trades</p></div><div><h3>{stats.winRate}%</h3><p>Win Rate</p></div><div><h3>{stats.totalPips}</h3><p>Total Pips</p></div><div><h3>{stats.weeklyPips}</h3><p>Weekly Pips</p></div><div><h3>{stats.wins}</h3><p>Wins</p></div><div><h3>{stats.losses}</h3><p>Losses</p></div></div> }
function TradeCard({trade}){ return <div className={`tradeCard ${trade.status}`}><div><h3>{trade.pair} <span>{trade.direction}</span></h3><p>{trade.category} · {trade.status.toUpperCase()}</p></div><div className="tradeLevels"><p>Entry: {trade.entry}</p><p>SL: {trade.stopLoss}</p><p>TP1: {trade.takeProfit1}</p><p>TP2: {trade.takeProfit2}</p><p>Pips: {trade.resultPips}</p></div>{trade.notes&&<pre>{trade.notes}</pre>}</div> }
function SignalDashboard({user,setPage}){ const[stats,setStats]=useState(null),[trades,setTrades]=useState([]),[msg,setMsg]=useState(''); useEffect(()=>{ load() },[user]); async function load(){ if(!user){ setMsg('Please login first.'); return } try{ setStats(await api('/api/vip/stats')); setTrades(await api('/api/vip/trades')) }catch(e){ setMsg(e.message) } } if(!user) return <section className="section narrow"><h2>Please login first</h2><button onClick={()=>setPage('login')}>Login</button></section>; if(!user.vip&&user.role!=='admin') return <section className="section narrow"><p className="green">VIP LOCKED</p><h2>Dashboard is only for approved VIP members</h2></section>; return <section className="section"><p className="green">SIGNAL DASHBOARD</p><h2>Trading Performance</h2><button className="refresh" onClick={load}>Refresh Dashboard</button>{msg&&<p className="error">{msg}</p>}{stats&&<StatsCards stats={stats}/>}<div className="listGrid">{trades.map(t=><TradeCard key={t._id} trade={t}/>)}{trades.length===0&&<p>No trades yet.</p>}</div></section> }
function Vip({user,setPage}){ const[signals,setSignals]=useState([]),[analysis,setAnalysis]=useState([]),[msg,setMsg]=useState(''); useEffect(()=>{ async function load(){ if(!user) return; try{ setSignals(await api('/api/vip/signals')); setAnalysis(await api('/api/vip/analysis')) }catch(e){ setMsg(e.message) } } load() },[user]); if(!user) return <section className="section narrow"><h2>Please login first</h2><button onClick={()=>setPage('login')}>Login</button></section>; if(!user.vip&&user.role!=='admin') return <section className="section narrow"><p className="green">{user.status==='expired'?'VIP EXPIRED':'VIP LOCKED'}</p><h2>{user.status==='expired'?'Your VIP Access Has Expired':'Waiting For Admin Approval'}</h2><p>Status: {user.status}</p><button onClick={()=>setPage('payment')}>Renew / Submit Payment</button></section>; return <section className="section"><p className="green">VIP AREA</p><h2>Premium Signals & VIP Analysis</h2><div className="vipInfo"><strong>Access:</strong> {user.daysRemaining==='Lifetime'?'Lifetime':`${user.daysRemaining} days remaining`}<br/><strong>Expiry:</strong> {formatDate(user.vipExpiryDate)}</div>{msg&&<p className="error">{msg}</p>}<div className="cards">{signals.length===0?<p>No text signals posted yet.</p>:signals.map(s=><div key={s._id} className="card"><h3>{s.title}</h3><pre>{s.message}</pre></div>)}</div><div className="analysisGrid">{analysis.map(post=><AnalysisCard key={post._id} post={post}/>)}{analysis.length===0&&<p>No VIP analysis yet.</p>}</div></section> }
function Archive({user,setPage}){ const[reports,setReports]=useState([]),[msg,setMsg]=useState(''); useEffect(()=>{ load() },[user]); async function load(){ if(!user) return; try{ setReports(await api('/api/vip/reports')) }catch(e){ setMsg(e.message) } } if(!user) return <section className="section narrow"><h2>Please login first</h2><button onClick={()=>setPage('login')}>Login</button></section>; if(!user.vip&&user.role!=='admin') return <section className="section narrow"><p className="green">VIP LOCKED</p><h2>Performance Archive is members-only</h2></section>; return <section className="section"><p className="green">PERFORMANCE ARCHIVE</p><h2>Past Weekly & Monthly Reports</h2><button className="refresh" onClick={load}>Refresh Archive</button>{msg&&<p className="error">{msg}</p>}<div className="cards">{reports.length===0&&<p>No archived reports yet.</p>}{reports.map(r=><div key={r._id} className="card"><h3>{r.title}</h3><p>{r.period} · {new Date(r.createdAt).toLocaleDateString()}</p><p><strong>Pips:</strong> {r.totalPips}</p><p><strong>Win Rate:</strong> {r.winRate}%</p><p><strong>Wins/Losses:</strong> {r.wins}/{r.losses}</p><pre>{r.reportText}</pre></div>)}</div></section> }

function ProofGallery({limit=6}){
  const [proofs,setProofs]=useState([])
  const [msg,setMsg]=useState('')
  useEffect(()=>{ load() },[])
  async function load(){
    try{ setProofs(await api('/api/proofs/public')) }catch(e){ setMsg(e.message) }
  }
  const shown = limit ? proofs.slice(0,limit) : proofs
  return <section className="section realProofSection">
    <p className="green">REAL PROOF</p>
    <h2>Trading Results, Feedback & Proof Screenshots</h2>
    <p className="centerText">
      View real screenshots shared by 1000PIPS, including trading results, feedback, performance proof and analysis examples.
    </p>
    <button className="refresh" onClick={load}>Refresh Proof</button>
    {msg&&<p className="error">{msg}</p>}
    <div className="proofScreenshotGrid">
      {shown.length===0&&<p>No proof screenshots posted yet.</p>}
      {shown.map(p=><div key={p._id} className="proofScreenshotCard">
        {p.proofImageData&&<img src={imgSrcFromProof(p)} alt={p.title}/>}
        <div className="proofScreenshotBody">
          <span>{p.category}</span>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <small>{new Date(p.createdAt).toLocaleDateString()}</small>
        </div>
      </div>)}
    </div>
  </section>
}

function AnalysisCard({post}){ return <div className="analysisCard"><div className="analysisHeader"><div><h3>{post.title}</h3><p>{post.market} · {post.bias} · {new Date(post.createdAt).toLocaleDateString()}</p></div><span className="chip">{post.visibility}</span></div>{post.chartImageData && <img className="analysisChart" src={imgSrcFromPost(post)} alt={post.chartImageName||post.title}/>} {post.summary&&<p className="analysisSummary">{post.summary}</p>} {post.keyLevels&&<p><strong>Key Levels:</strong> {post.keyLevels}</p>} {post.tradePlan&&<p><strong>Trade Plan:</strong> {post.tradePlan}</p>} {post.content&&<pre>{post.content}</pre>}</div> }
function AnalysisPage(){ const[posts,setPosts]=useState([]),[msg,setMsg]=useState(''); useEffect(()=>{ load() },[]); async function load(){ try{ setPosts(await api('/api/analysis/public')) }catch(e){ setMsg(e.message) } } return <section className="section"><p className="green">DAILY MARKET ANALYSIS</p><h2>Gold, Forex, Crypto & Indices Breakdown</h2><button className="refresh" onClick={load}>Refresh Analysis</button>{msg&&<p className="error">{msg}</p>}<div className="analysisGrid">{posts.length===0&&<p>No public analysis posted yet.</p>}{posts.map(post=><AnalysisCard key={post._id} post={post}/> )}</div></section> }
function Admin({user,setPage}){
  const [users,setUsers]=useState([]),[payments,setPayments]=useState([]),[trades,setTrades]=useState([]),[report,setReport]=useState(null),[reports,setReports]=useState([]),[analysis,setAnalysis]=useState([]),[msg,setMsg]=useState(''),[viewer,setViewer]=useState(null),[renewPlan,setRenewPlan]=useState('1 Month VIP - $45')
  const [signal,setSignal]=useState({title:'XAUUSD BUY Setup',message:'BUY XAUUSD\nEntry: 3350\nSL: 3340\nTP1: 3370\nTP2: 3385',sendTelegram:true})
  const [trade,setTrade]=useState({pair:'XAUUSD',category:'Gold',direction:'BUY',entry:'3350',stopLoss:'3340',takeProfit1:'3370',takeProfit2:'3385',riskReward:'1:2',notes:'Trend continuation setup',sendTelegram:true})
  const [analysisForm,setAnalysisForm]=useState({title:'Gold Analysis - London Session',market:'Gold',bias:'Bullish',summary:'Price is holding above support and showing bullish continuation potential.',content:'Look for bullish continuation if price holds above the marked support zone. Wait for confirmation on lower timeframe before entry.',keyLevels:'Support 3340, Resistance 3370',tradePlan:'Buy dips above support. Invalidation below 3340.',visibility:'public',sendTelegram:true})
  const [analysisChart,setAnalysisChart]=useState(null),[analysisPreview,setAnalysisPreview]=useState(''),[customPips,setCustomPips]=useState({})
  async function loadAdmin(){ setMsg(''); try{ const [u,p,rpt,rep,an,tr,pr]=await Promise.all([api('/api/admin/users'),api('/api/admin/payments'),api('/api/admin/report'),api('/api/vip/reports'),api('/api/vip/analysis'),api('/api/vip/trades'),api('/api/vip/proofs')]); setUsers(u); setPayments(p); setReport(rpt); setReports(rep); setAnalysis(an); setTrades(tr); setProofs(pr); setMsg('Admin data refreshed.') }catch(e){ setMsg(e.message) } }
  useEffect(()=>{ if(user?.role==='admin') loadAdmin() },[user])
  if(!user) return <section className="section narrow"><h2>Admin Login Required</h2><button onClick={()=>setPage('login')}>Login</button></section>
  if(user.role!=='admin') return <section className="section narrow"><h2>Admin Access Required</h2></section>
  async function approve(id){ await api(`/api/admin/payments/${id}/approve`,{method:'PUT'}); await loadAdmin() }
  async function viewShot(id){ try{ const d=await api(`/api/admin/payments/${id}/screenshot`); setViewer(`data:${d.screenshotMime};base64,${d.screenshotData}`) }catch(e){ setMsg(e.message) } }
  async function removeVip(id){ await api(`/api/admin/users/${id}/remove-vip`,{method:'PUT'}); await loadAdmin() }
  async function renewVip(id){ await api(`/api/admin/users/${id}/renew-vip`,{method:'PUT',body:JSON.stringify({plan:renewPlan})}); await loadAdmin() }
  async function postSignal(e){ e.preventDefault(); try{ await api('/api/admin/signals',{method:'POST',body:JSON.stringify(signal)}); setMsg('Text signal posted successfully.'); }catch(err){ setMsg(err.message) } }
  async function addTrade(e){ e.preventDefault(); try{ await api('/api/admin/trades',{method:'POST',body:JSON.stringify(trade)}); setMsg('Trade signal added successfully.'); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function updateTrade(id, pips){ try{ await api(`/api/admin/trades/${id}`,{method:'PUT',body:JSON.stringify({status:tradeStatusFromPips(pips), resultPips:Number(pips)})}); setMsg('Trade result updated.'); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function sendReportTelegram(){ try{ await api('/api/admin/report/send-telegram',{method:'POST'}); setMsg('Weekly report sent to Telegram.'); }catch(err){ setMsg(err.message) } }
  async function archiveCurrent(period){ try{ await api('/api/admin/reports/archive-current',{method:'POST',body:JSON.stringify({period,title:`${period} Performance Report`})}); setMsg(`${period} report saved to archive.`); await loadAdmin() }catch(err){ setMsg(err.message) } }
  function onAnalysisChart(e){ const f=e.target.files[0]; setAnalysisChart(f||null); setAnalysisPreview(f?URL.createObjectURL(f):'') }

  function onProofImage(e){ const f=e.target.files[0]; setProofImage(f||null); setProofPreview(f?URL.createObjectURL(f):'') }
  async function addProof(e){ e.preventDefault(); try{ const fd=new FormData(); Object.entries(proofForm).forEach(([k,v])=>fd.append(k,String(v))); if(proofImage) fd.append('proofImage',proofImage); await api('/api/admin/proofs',{method:'POST',body:fd}); setMsg('Proof screenshot added successfully.'); setProofImage(null); setProofPreview(''); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function deleteProof(id){ await api(`/api/admin/proofs/${id}`,{method:'DELETE'}); await loadAdmin() }

  async function postAnalysis(e){ e.preventDefault(); try{ const fd=new FormData(); Object.entries(analysisForm).forEach(([k,v])=>fd.append(k, String(v))); if(analysisChart) fd.append('chartImage',analysisChart); await api('/api/admin/analysis',{method:'POST',body:fd}); setMsg('Analysis posted. If Telegram checkbox is enabled, chart was sent to channel too.'); setAnalysisChart(null); setAnalysisPreview(''); await loadAdmin() }catch(err){ setMsg(err.message) } }
  async function deleteAnalysis(id){ await api(`/api/admin/analysis/${id}`,{method:'DELETE'}); await loadAdmin() }
  return <section className="section"><p className="green">ADMIN DASHBOARD</p><h2>Telegram Analysis Image Posting + Full Management</h2><button className="refresh" onClick={loadAdmin}>Refresh Admin Data</button>{msg&&<p className={msg.toLowerCase().includes('success')||msg.toLowerCase().includes('refreshed')||msg.toLowerCase().includes('saved')||msg.toLowerCase().includes('sent')||msg.toLowerCase().includes('posted')?'success':'error'}>{msg}</p>}{viewer&&<div className="modal" onClick={()=>setViewer(null)}><div className="modalInner"><button onClick={()=>setViewer(null)}>Close</button><img src={viewer}/></div></div>}
    {report?.stats && <div><h3 className="sectionTitle">Performance Summary</h3><StatsCards stats={report.stats}/></div>}
    <div className="buttonRow"><button onClick={()=>archiveCurrent('Weekly')}>Save Weekly Archive</button><button onClick={()=>archiveCurrent('Monthly')}>Save Monthly Archive</button><button onClick={sendReportTelegram}>Send Report to Telegram</button></div>
    {report?.reportText && <div className="card"><h3>Current Weekly Report</h3><pre>{report.reportText}</pre></div>}
    <div className="adminGrid">
      <div className="adminBox"><h3>Payment Proofs</h3>{payments.length===0&&<p>No payment proofs found.</p>}{payments.map(p=><div className="adminRow" key={p._id}><strong>{p.userName}</strong><p>{p.plan}</p><p>{p.method} | {p.transactionId}</p><p>Status: {p.status}</p><div className="rowBtns"><button onClick={()=>viewShot(p._id)}>View Screenshot</button>{p.status!=='approved'&&<button onClick={()=>approve(p._id)}>Approve VIP</button>}</div></div>)}</div>
      <div className="adminBox"><h3>Users & Expiry</h3><select value={renewPlan} onChange={e=>setRenewPlan(e.target.value)}><option>1 Month VIP - $45</option><option>3 Months VIP - $100</option><option>Lifetime VIP - $400</option></select>{users.map(u=><div className="adminRow" key={u.id}><strong>{u.name}</strong><p>{u.email}</p><p>VIP: {u.vip?'YES':'NO'} | Status: {u.status}</p><p>Expires: {formatDate(u.vipExpiryDate)}</p><p>Remaining: {u.daysRemaining==='Lifetime'?'Lifetime':`${u.daysRemaining||0} days`}</p><div className="rowBtns"><button onClick={()=>renewVip(u.id)}>Renew VIP</button><button onClick={()=>removeVip(u.id)}>Remove VIP</button></div></div>)}</div>
      <div className="adminBox"><h3>Post Text Signal</h3><form onSubmit={postSignal} className="form compact"><input value={signal.title} onChange={e=>setSignal({...signal,title:e.target.value})}/><textarea rows="7" value={signal.message} onChange={e=>setSignal({...signal,message:e.target.value})}/><label className="check"><input type="checkbox" checked={signal.sendTelegram} onChange={e=>setSignal({...signal,sendTelegram:e.target.checked})}/> Send to Telegram</label><button>Post Signal</button></form></div>
      <div className="adminBox"><h3>Add Trade Signal</h3><form onSubmit={addTrade} className="form compact"><input placeholder="Pair" value={trade.pair} onChange={e=>setTrade({...trade,pair:e.target.value})}/><select value={trade.category} onChange={e=>setTrade({...trade,category:e.target.value})}><option>Gold</option><option>Forex</option><option>Crypto</option><option>Indices</option><option>Oil</option></select><select value={trade.direction} onChange={e=>setTrade({...trade,direction:e.target.value})}><option>BUY</option><option>SELL</option></select><input placeholder="Entry" value={trade.entry} onChange={e=>setTrade({...trade,entry:e.target.value})}/><input placeholder="Stop Loss" value={trade.stopLoss} onChange={e=>setTrade({...trade,stopLoss:e.target.value})}/><input placeholder="TP1" value={trade.takeProfit1} onChange={e=>setTrade({...trade,takeProfit1:e.target.value})}/><input placeholder="TP2" value={trade.takeProfit2} onChange={e=>setTrade({...trade,takeProfit2:e.target.value})}/><input placeholder="Risk Reward" value={trade.riskReward} onChange={e=>setTrade({...trade,riskReward:e.target.value})}/><textarea placeholder="Notes" value={trade.notes} onChange={e=>setTrade({...trade,notes:e.target.value})}/><label className="check"><input type="checkbox" checked={trade.sendTelegram} onChange={e=>setTrade({...trade,sendTelegram:e.target.checked})}/> Send to Telegram</label><button>Add Trade</button></form></div>
      <div className="adminBox full"><h3>Manage Trades With Exact Pips</h3>{trades.length===0&&<p>No trades found.</p>}{trades.map(t=><div className="adminRow" key={t._id}><strong>{t.pair} {t.direction}</strong><p>Status: {t.status} | Current pips: {t.resultPips}</p><div className="rowBtns"><button onClick={()=>updateTrade(t._id,100)}>TP +100</button><button onClick={()=>updateTrade(t._id,-50)}>SL -50</button><button onClick={()=>updateTrade(t._id,0)}>BE 0</button></div><div className="exactPipsRow"><input type="number" placeholder="Exact pips" value={customPips[t._id]||''} onChange={e=>setCustomPips({...customPips,[t._id]:e.target.value})}/><button onClick={()=>updateTrade(t._id, customPips[t._id]||0)}>Close With Exact Pips</button></div></div>)}</div>
      <div className="adminBox full"><h3>Post Market Analysis With Chart Image</h3><form onSubmit={postAnalysis} className="form compact"><input placeholder="Title" value={analysisForm.title} onChange={e=>setAnalysisForm({...analysisForm,title:e.target.value})}/><select value={analysisForm.market} onChange={e=>setAnalysisForm({...analysisForm,market:e.target.value})}><option>Gold</option><option>GBPUSD</option><option>EURUSD</option><option>US30</option><option>BTCUSD</option><option>Oil</option><option>Other</option></select><select value={analysisForm.bias} onChange={e=>setAnalysisForm({...analysisForm,bias:e.target.value})}><option>Bullish</option><option>Bearish</option><option>Neutral</option></select><textarea placeholder="Summary" value={analysisForm.summary} onChange={e=>setAnalysisForm({...analysisForm,summary:e.target.value})}/><textarea rows="7" placeholder="Full analysis content" value={analysisForm.content} onChange={e=>setAnalysisForm({...analysisForm,content:e.target.value})}/><input placeholder="Key levels" value={analysisForm.keyLevels} onChange={e=>setAnalysisForm({...analysisForm,keyLevels:e.target.value})}/><textarea placeholder="Trade plan" value={analysisForm.tradePlan} onChange={e=>setAnalysisForm({...analysisForm,tradePlan:e.target.value})}/><select value={analysisForm.visibility} onChange={e=>setAnalysisForm({...analysisForm,visibility:e.target.value})}><option value="public">Public</option><option value="vip">VIP</option></select><label className="check"><input type="checkbox" checked={analysisForm.sendTelegram} onChange={e=>setAnalysisForm({...analysisForm,sendTelegram:e.target.checked})}/> Send chart + analysis to Telegram</label><label className="uploadBox">Upload chart image<input type="file" accept="image/*" onChange={onAnalysisChart}/></label>{analysisPreview&&<img className="preview analysisPreview" src={analysisPreview}/>}<button>Post Analysis With Chart</button></form></div>
      
      <div className="adminBox full"><h3>Add Real Proof Screenshot</h3>
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
        {proofs.length===0&&<p>No proof screenshots yet.</p>}
        {proofs.map(p=><div key={p._id} className="adminRow"><strong>{p.title}</strong><p>{p.category} · {p.visibility}</p>{p.proofImageData&&<img className="miniChart" src={imgSrcFromProof(p)} alt={p.title}/>}<div className="rowBtns"><button onClick={()=>deleteProof(p._id)}>Delete</button></div></div>)}
      </div>

      <div className="adminBox full"><h3>Published Analysis Posts</h3>{analysis.length===0&&<p>No analysis posts yet.</p>}{analysis.map(post=><div key={post._id} className="adminRow"><strong>{post.title}</strong><p>{post.market} · {post.bias} · {post.visibility}</p>{post.chartImageData&&<img className="miniChart" src={imgSrcFromPost(post)} alt={post.title}/>}<div className="rowBtns"><button onClick={()=>deleteAnalysis(post._id)}>Delete</button></div></div>)}</div>
      <div className="adminBox full"><h3>Archived Reports</h3>{reports.length===0&&<p>No archived reports yet.</p>}{reports.map(r=><div key={r._id} className="adminRow"><strong>{r.title}</strong><p>{r.period} | Pips: {r.totalPips} | Win Rate: {r.winRate}%</p></div>)}</div>
    </div>
  </section>
}

function FloatingContactButtons(){
  return <div className="floatingContacts">
    <a className="whatsappFloat" href={WHATSAPP_CONTACT} target="_blank" rel="noreferrer">WhatsApp</a>
    <a className="telegramFloat" href={TELEGRAM_CONTACT} target="_blank" rel="noreferrer">Telegram</a>
  </div>
}

function Footer(){ return <footer><h2>1000PIPS</h2><p>Professional Forex Signals & Market Analysis</p></footer> }

ReactDOM.createRoot(document.getElementById('root')).render(<App/>)
