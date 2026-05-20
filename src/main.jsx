import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'

const PAYPAL_EMAIL = 'vimu1113@gmail.com'
const SKRILL_EMAIL = 'vimu1113@gmail.com'
const BINANCE_PAY_ID = '41356322'
const TELEGRAM_FREE = 'https://t.me/ForexHubbSignals'

const plans = [
  { name: '1 Month VIP', price: '$45' },
  { name: '3 Months VIP', price: '$100', popular: true },
  { name: 'Lifetime VIP', price: '$400' },
]

const getUsers = () => JSON.parse(localStorage.getItem('users') || '[]')
const saveUsers = users => localStorage.setItem('users', JSON.stringify(users))
const getProofs = () => JSON.parse(localStorage.getItem('paymentProofs') || '[]')
const saveProofs = proofs => localStorage.setItem('paymentProofs', JSON.stringify(proofs))
const getSignals = () => JSON.parse(localStorage.getItem('signals') || '[]')
const saveSignals = signals => localStorage.setItem('signals', JSON.stringify(signals))

function App() {
  const [page, setPage] = useState('home')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('currentUser')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  function logout() {
    localStorage.removeItem('currentUser')
    setUser(null)
    setPage('home')
  }

  return (
    <div>
      <nav className="nav">
        <button className="brand" onClick={() => setPage('home')}>
          <img src="/logo.jpg" alt="1000PIPS logo" />
          <span>1000PIPS</span>
        </button>
        <div className="navLinks">
          <button onClick={() => setPage('home')}>Home</button>
          <button onClick={() => setPage('payments')}>Payments</button>
          <button onClick={() => setPage('vip')}>VIP Area</button>
          <button onClick={() => setPage('admin')}>Admin</button>
          {user ? <button onClick={logout}>Logout</button> : <button onClick={() => setPage('login')}>Login</button>}
        </div>
      </nav>

      {page === 'home' && <Home setPage={setPage} />}
      {page === 'login' && <Login setUser={setUser} setPage={setPage} />}
      {page === 'payments' && <Payments user={user} setUser={setUser} setPage={setPage} />}
      {page === 'vip' && <VipArea user={user} />}
      {page === 'admin' && <Admin user={user} setUser={setUser} />}

      <footer>
        <h2>1000PIPS</h2>
        <p>Professional Forex Signals & Market Analysis</p>
        <div className="footerLinks">
          <a href={TELEGRAM_FREE} target="_blank" rel="noreferrer">Telegram</a>
          <a href="#">Instagram</a>
          <a href="#">TikTok</a>
          <a href="#">YouTube</a>
          <a href="#">Discord</a>
        </div>
      </footer>
    </div>
  )
}

function Home({ setPage }) {
  return (
    <>
      <header className="hero">
        <div className="glow"></div>
        <div className="heroInner">
          <img src="/logo.jpg" className="heroLogo" alt="1000PIPS logo" />
          <p className="label">Professional Forex Signal Channel</p>
          <h1>1000PIPS Forex Signals</h1>
          <p className="subtitle">Premium Forex, Gold, Crypto and Indices signals with daily market analysis, VIP plans, reports and manual payment approval.</p>
          <div className="buttons">
            <button className="btn primary" onClick={() => setPage('payments')}>Join VIP Now</button>
            <a className="btn outline" href={TELEGRAM_FREE} target="_blank" rel="noreferrer">Free Telegram Channel</a>
          </div>
        </div>
      </header>

      <section className="stats">
        <div><h3>24/5</h3><p>Market Coverage</p></div>
        <div><h3>1:3</h3><p>Risk Reward Focus</p></div>
        <div><h3>VIP</h3><p>Protected Page</p></div>
        <div><h3>Admin</h3><p>Approval System</p></div>
      </section>

      <section className="section">
        <p className="label">Subscription Packages</p>
        <h2>Choose Your VIP Plan</h2>
        <div className="cards">
          {plans.map(plan => (
            <div className={plan.popular ? 'card popular' : 'card'} key={plan.name}>
              {plan.popular && <span className="tag">MOST POPULAR</span>}
              <h3>{plan.name}</h3>
              <h4>{plan.price}</h4>
              <p>VIP signals, daily analysis, Telegram support and monthly reports.</p>
              <button onClick={() => setPage('payments')}>Pay Now</button>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function Login({ setUser, setPage }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [msg, setMsg] = useState('')

  function submit(e) {
    e.preventDefault()
    const email = form.email.trim().toLowerCase()

    if (mode === 'login' && email === 'admin@1000pips.com' && form.password === 'admin123') {
      const admin = { name: 'Admin', email, role: 'admin', vip: true, status: 'approved' }
      localStorage.setItem('currentUser', JSON.stringify(admin))
      setUser(admin)
      setPage('admin')
      return
    }

    let users = getUsers()

    if (mode === 'register') {
      if (users.find(u => u.email === email)) {
        setMsg('This email already exists. Please login.')
        return
      }
      const newUser = { name: form.name || 'Trader', email, password: form.password, role: 'user', vip: false, status: 'not_paid', plan: '' }
      users.push(newUser)
      saveUsers(users)
      localStorage.setItem('currentUser', JSON.stringify(newUser))
      setUser(newUser)
      setPage('payments')
      return
    }

    const found = users.find(u => u.email === email && u.password === form.password)
    if (!found) {
      setMsg('Invalid login. Register first or check password.')
      return
    }
    localStorage.setItem('currentUser', JSON.stringify(found))
    setUser(found)
    setPage(found.vip ? 'vip' : 'payments')
  }

  return (
    <section className="section narrow">
      <p className="label">{mode === 'login' ? 'Member Login' : 'Create Account'}</p>
      <h2>{mode === 'login' ? 'Login to 1000PIPS' : 'Register for VIP'}</h2>
      <form className="form" onSubmit={submit}>
        {mode === 'register' && <input placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />}
        <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input required type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        <button className="btn primary">{mode === 'login' ? 'Login' : 'Register'}</button>
        {msg && <p className="error">{msg}</p>}
        <p className="switchText">
          {mode === 'login' ? 'No account?' : 'Already registered?'}
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? ' Register' : ' Login'}</button>
        </p>
        <div className="note"><strong>Demo Admin Login</strong><br/>Email: admin@1000pips.com<br/>Password: admin123</div>
      </form>
    </section>
  )
}

function Payments({ user, setUser, setPage }) {
  const [plan, setPlan] = useState('3 Months VIP - $100')
  const [method, setMethod] = useState('PayPal')
  const [transactionId, setTransactionId] = useState('')
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!user) {
      setPage('login')
      return
    }

    const proof = {
      id: Date.now(),
      userEmail: user.email,
      userName: user.name,
      plan,
      method,
      transactionId,
      note,
      status: 'pending',
      createdAt: new Date().toLocaleString()
    }

    const proofs = getProofs()
    saveProofs([proof, ...proofs])

    const users = getUsers().map(u => u.email === user.email ? {...u, plan, status: 'pending_payment'} : u)
    saveUsers(users)

    const updated = {...user, plan, status: 'pending_payment'}
    localStorage.setItem('currentUser', JSON.stringify(updated))
    setUser(updated)
    setMsg('Payment proof submitted. Admin will approve your VIP access.')
  }

  return (
    <section className="section">
      <p className="label">Payment Methods</p>
      <h2>Join 1000PIPS VIP</h2>

      <div className="payGrid">
        <div className="payBox"><h3>PayPal</h3><p>Send payment to:</p><strong>{PAYPAL_EMAIL}</strong></div>
        <div className="payBox"><h3>Skrill</h3><p>Send payment to:</p><strong>{SKRILL_EMAIL}</strong></div>
        <div className="payBox"><h3>Binance Pay</h3><p>Binance Pay ID:</p><strong>{BINANCE_PAY_ID}</strong></div>
      </div>

      <div className="instruction">
        <h3>Activation Steps</h3>
        <ol>
          <li>Register or login first.</li>
          <li>Select your VIP package.</li>
          <li>Pay using PayPal, Skrill or Binance Pay.</li>
          <li>Submit transaction ID below.</li>
          <li>Admin approves your VIP access.</li>
        </ol>
      </div>

      <form className="form" onSubmit={submit}>
        <select value={plan} onChange={e => setPlan(e.target.value)}>
          <option>1 Month VIP - $45</option>
          <option>3 Months VIP - $100</option>
          <option>Lifetime VIP - $400</option>
        </select>
        <select value={method} onChange={e => setMethod(e.target.value)}>
          <option>PayPal</option>
          <option>Skrill</option>
          <option>Binance Pay</option>
        </select>
        <input required placeholder="Transaction ID / Payment Reference" value={transactionId} onChange={e => setTransactionId(e.target.value)} />
        <textarea placeholder="Optional note" value={note} onChange={e => setNote(e.target.value)} />
        <button className="btn primary">{user ? 'Submit Payment Proof' : 'Login/Register First'}</button>
        {msg && <p className="success">{msg}</p>}
      </form>
    </section>
  )
}

function VipArea({ user }) {
  const signals = getSignals()

  if (!user) return <section className="section narrow"><h2>Please Login First</h2><p className="centerText">Login to access the VIP area.</p></section>
  if (!user.vip) return <section className="section narrow"><p className="label">VIP Locked</p><h2>Waiting For Admin Approval</h2><p className="centerText">Current status: <strong>{user.status || 'not_paid'}</strong></p></section>

  return (
    <section className="section">
      <p className="label">VIP Protected Area</p>
      <h2>Premium Signals & Analysis</h2>
      <div className="vipGrid">
        <div className="vipBox">
          <h3>Latest VIP Signals</h3>
          {signals.length === 0 && <p>No signals posted yet.</p>}
          {signals.map(s => <div className="signal" key={s.id}><strong>{s.title}</strong><pre>{s.message}</pre><small>{s.createdAt}</small></div>)}
        </div>
        <div className="vipBox"><h3>Daily Analysis</h3><p>Gold, Forex, Crypto and indices breakdowns will appear here.</p></div>
        <div className="vipBox"><h3>Monthly Reports</h3><p>January: +22%</p><p>February: +18%</p><p>March: +26%</p></div>
      </div>
    </section>
  )
}

function Admin({ user, setUser }) {
  const [users, setUsers] = useState(getUsers())
  const [proofs, setProofs] = useState(getProofs())
  const [signals, setSignals] = useState(getSignals())
  const [signal, setSignal] = useState({
    title: 'XAUUSD BUY Setup',
    message: 'BUY XAUUSD\\nEntry: 3350\\nSL: 3340\\nTP1: 3370\\nTP2: 3385\\nRisk: 1%'
  })

  if (!user || user.role !== 'admin') return <section className="section narrow"><p className="label">Admin Locked</p><h2>Admin Login Required</h2><p className="centerText">Login as admin to access dashboard.</p></section>

  function approve(email, proofId) {
    const updatedUsers = users.map(u => u.email === email ? {...u, vip: true, status: 'approved'} : u)
    saveUsers(updatedUsers)
    setUsers(updatedUsers)

    const updatedProofs = proofs.map(p => p.id === proofId ? {...p, status: 'approved'} : p)
    saveProofs(updatedProofs)
    setProofs(updatedProofs)

    const current = JSON.parse(localStorage.getItem('currentUser') || 'null')
    if (current && current.email === email) {
      const updated = {...current, vip: true, status: 'approved'}
      localStorage.setItem('currentUser', JSON.stringify(updated))
      setUser(updated)
    }
  }

  function removeVip(email) {
    const updatedUsers = users.map(u => u.email === email ? {...u, vip: false, status: 'removed'} : u)
    saveUsers(updatedUsers)
    setUsers(updatedUsers)
  }

  function postSignal(e) {
    e.preventDefault()
    const newSignal = {...signal, id: Date.now(), createdAt: new Date().toLocaleString()}
    const updated = [newSignal, ...signals]
    saveSignals(updated)
    setSignals(updated)
  }

  const telegramText = encodeURIComponent(signal.message)

  return (
    <section className="section">
      <p className="label">Admin Dashboard</p>
      <h2>1000PIPS Control Panel</h2>

      <div className="adminGrid">
        <div className="adminBox">
          <h3>Payment Proofs</h3>
          {proofs.length === 0 && <p>No payment proofs yet.</p>}
          {proofs.map(p => (
            <div className="adminRow" key={p.id}>
              <strong>{p.userName} — {p.plan}</strong>
              <p>{p.method} | Ref: {p.transactionId}</p>
              <p>Status: {p.status}</p>
              <small>{p.createdAt}</small>
              {p.status !== 'approved' && <button onClick={() => approve(p.userEmail, p.id)}>Approve VIP</button>}
            </div>
          ))}
        </div>

        <div className="adminBox">
          <h3>Users</h3>
          {users.length === 0 && <p>No registered users yet.</p>}
          {users.map(u => (
            <div className="adminRow" key={u.email}>
              <strong>{u.name}</strong>
              <p>{u.email}</p>
              <p>VIP: {u.vip ? 'Yes' : 'No'} | Status: {u.status}</p>
              {u.vip && <button onClick={() => removeVip(u.email)}>Remove VIP</button>}
            </div>
          ))}
        </div>

        <div className="adminBox">
          <h3>Telegram Signal</h3>
          <p className="small">Real automatic posting needs backend + Telegram bot token. This version saves signal to VIP page and opens Telegram share.</p>
          <form onSubmit={postSignal}>
            <input value={signal.title} onChange={e => setSignal({...signal, title: e.target.value})} />
            <textarea value={signal.message} onChange={e => setSignal({...signal, message: e.target.value})} />
            <button>Post To VIP Website</button>
            <a className="btn outline wide" href={`https://t.me/share/url?url=&text=${telegramText}`} target="_blank" rel="noreferrer">Open Telegram Share</a>
          </form>
        </div>
      </div>
    </section>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
