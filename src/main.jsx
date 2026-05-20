import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'

const API_URL = 'https://one000pips-backend.onrender.com'
const PAYPAL_EMAIL = 'vimu1113@gmail.com'
const SKRILL_EMAIL = 'vimu1113@gmail.com'
const BINANCE_PAY_ID = '41356322'
const TELEGRAM_FREE = 'https://t.me/ForexHubbSignals'

const plans = [
  { name: '1 Month VIP', price: '$45' },
  { name: '3 Months VIP', price: '$100', popular: true },
  { name: 'Lifetime VIP', price: '$400' },
]

function getToken() {
  return localStorage.getItem('token')
}

async function api(path, options = {}) {
  const token = getToken()

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

function App() {
  const [page, setPage] = useState('home')
  const [user, setUser] = useState(null)
  const [backendStatus, setBackendStatus] = useState('Checking backend...')

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) setUser(JSON.parse(savedUser))

    fetch(API_URL)
      .then(res => res.json())
      .then(data => setBackendStatus(data.message || 'Backend connected'))
      .catch(() => setBackendStatus('Backend sleeping or not connected yet'))
  }, [])

  function saveSession(token, userData) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
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

      <div className="backendBar">
        Backend: <strong>{backendStatus}</strong>
      </div>

      {page === 'home' && <Home setPage={setPage} />}
      {page === 'login' && <Login saveSession={saveSession} setPage={setPage} />}
      {page === 'payments' && <Payments user={user} setUser={setUser} setPage={setPage} />}
      {page === 'vip' && <VipArea user={user} setPage={setPage} />}
      {page === 'admin' && <Admin user={user} setPage={setPage} />}

      <Footer />
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
          <p className="label">Connected VIP Platform</p>
          <h1>1000PIPS Forex Signals</h1>
          <p className="subtitle">
            Your website is now connected to backend, MongoDB and Telegram automation.
            Register users, collect payment proofs, approve VIP access and post signals to Telegram.
          </p>
          <div className="buttons">
            <button className="btn primary" onClick={() => setPage('payments')}>Join VIP Now</button>
            <a className="btn outline" href={TELEGRAM_FREE} target="_blank" rel="noreferrer">Free Telegram Channel</a>
          </div>
        </div>
      </header>

      <section className="stats">
        <div><h3>MongoDB</h3><p>Real Database</p></div>
        <div><h3>JWT</h3><p>Secure Login</p></div>
        <div><h3>VIP</h3><p>Protected API</p></div>
        <div><h3>Bot</h3><p>Telegram Posting</p></div>
      </section>

      <section className="section">
        <p className="label">VIP Packages</p>
        <h2>Choose Your Plan</h2>
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

function Login({ saveSession, setPage }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }

      const data = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      saveSession(data.token, data.user)
      setPage(data.user.role === 'admin' ? 'admin' : data.user.vip ? 'vip' : 'payments')
    } catch (err) {
      setMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section narrow">
      <p className="label">{mode === 'login' ? 'Member Login' : 'Create Account'}</p>
      <h2>{mode === 'login' ? 'Login to 1000PIPS' : 'Register for VIP'}</h2>

      <form className="form" onSubmit={submit}>
        {mode === 'register' && (
          <input placeholder="Full name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        )}
        <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input required type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        <button className="btn primary" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}</button>
        {msg && <p className="error">{msg}</p>}

        <p className="switchText">
          {mode === 'login' ? 'No account?' : 'Already registered?'}
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? ' Register' : ' Login'}
          </button>
        </p>

        <div className="note">
          <strong>Admin login</strong><br />
          Use the ADMIN_EMAIL and ADMIN_PASSWORD you added in Render.
        </div>
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
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setMsg('')

    if (!user) {
      setPage('login')
      return
    }

    setLoading(true)

    try {
      await api('/api/payments/proof', {
        method: 'POST',
        body: JSON.stringify({ plan, method, transactionId, note })
      })

      const updated = { ...user, plan, status: 'pending_payment' }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      setMsg('Payment proof submitted to MongoDB. Admin can now approve VIP access.')
      setTransactionId('')
      setNote('')
    } catch (err) {
      setMsg(err.message)
    } finally {
      setLoading(false)
    }
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
          <li>Admin approves VIP from admin dashboard.</li>
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
        <button className="btn primary" disabled={loading}>{loading ? 'Submitting...' : user ? 'Submit Payment Proof' : 'Login/Register First'}</button>
        {msg && <p className={msg.includes('submitted') ? 'success' : 'error'}>{msg}</p>}
      </form>
    </section>
  )
}

function VipArea({ user, setPage }) {
  const [signals, setSignals] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    async function loadSignals() {
      if (!user) return
      try {
        const data = await api('/api/vip/signals')
        setSignals(data)
      } catch (err) {
        setMsg(err.message)
      }
    }
    loadSignals()
  }, [user])

  if (!user) {
    return <section className="section narrow"><h2>Please Login First</h2><p className="centerText">Login to access VIP.</p><button className="btn primary" onClick={() => setPage('login')}>Login</button></section>
  }

  if (!user.vip && user.role !== 'admin') {
    return <section className="section narrow"><p className="label">VIP Locked</p><h2>Waiting For Admin Approval</h2><p className="centerText">Current status: <strong>{user.status || 'not_paid'}</strong></p></section>
  }

  return (
    <section className="section">
      <p className="label">VIP Protected API</p>
      <h2>Premium Signals & Analysis</h2>
      {msg && <p className="error">{msg}</p>}
      <div className="vipGrid">
        <div className="vipBox wideBox">
          <h3>Latest VIP Signals From MongoDB</h3>
          {signals.length === 0 && <p>No signals posted yet.</p>}
          {signals.map(s => (
            <div className="signal" key={s._id}>
              <strong>{s.title}</strong>
              <pre>{s.message}</pre>
              <small>{new Date(s.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Admin({ user, setPage }) {
  const [users, setUsers] = useState([])
  const [payments, setPayments] = useState([])
  const [msg, setMsg] = useState('')
  const [signal, setSignal] = useState({
    title: 'XAUUSD BUY Setup',
    message: 'BUY XAUUSD\nEntry: 3350\nSL: 3340\nTP1: 3370\nTP2: 3385\nRisk: 1%',
    sendTelegram: true
  })

  async function loadAdmin() {
    try {
      const [usersData, paymentsData] = await Promise.all([
        api('/api/admin/users'),
        api('/api/admin/payments')
      ])
      setUsers(usersData)
      setPayments(paymentsData)
    } catch (err) {
      setMsg(err.message)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') loadAdmin()
  }, [user])

  if (!user) {
    return <section className="section narrow"><p className="label">Admin Locked</p><h2>Login Required</h2><button className="btn primary" onClick={() => setPage('login')}>Login</button></section>
  }

  if (user.role !== 'admin') {
    return <section className="section narrow"><p className="label">Admin Locked</p><h2>Admin Access Required</h2><p className="centerText">Your account is not admin.</p></section>
  }

  async function approve(paymentId) {
    setMsg('')
    try {
      await api(`/api/admin/payments/${paymentId}/approve`, { method: 'PUT' })
      setMsg('VIP approved successfully.')
      loadAdmin()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function removeVip(userId) {
    setMsg('')
    try {
      await api(`/api/admin/users/${userId}/remove-vip`, { method: 'PUT' })
      setMsg('VIP removed.')
      loadAdmin()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function postSignal(e) {
    e.preventDefault()
    setMsg('')
    try {
      await api('/api/admin/signals', {
        method: 'POST',
        body: JSON.stringify(signal)
      })
      setMsg(signal.sendTelegram ? 'Signal saved and sent to Telegram.' : 'Signal saved to VIP area.')
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function testTelegram() {
    setMsg('')
    try {
      await api('/api/admin/test-telegram', { method: 'POST' })
      setMsg('Telegram test message sent.')
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <section className="section">
      <p className="label">Real Admin Dashboard</p>
      <h2>1000PIPS Backend Control Panel</h2>
      {msg && <p className={msg.includes('successfully') || msg.includes('sent') || msg.includes('saved') ? 'success' : 'error'}>{msg}</p>}

      <div className="adminGrid">
        <div className="adminBox">
          <h3>Payment Proofs From MongoDB</h3>
          {payments.length === 0 && <p>No payment proofs yet.</p>}
          {payments.map(p => (
            <div className="adminRow" key={p._id}>
              <strong>{p.userName} — {p.plan}</strong>
              <p>{p.method} | Ref: {p.transactionId}</p>
              <p>Status: {p.status}</p>
              <small>{new Date(p.createdAt).toLocaleString()}</small>
              {p.status !== 'approved' && <button onClick={() => approve(p._id)}>Approve VIP</button>}
            </div>
          ))}
        </div>

        <div className="adminBox">
          <h3>Users From MongoDB</h3>
          {users.length === 0 && <p>No users yet.</p>}
          {users.map(u => (
            <div className="adminRow" key={u._id}>
              <strong>{u.name}</strong>
              <p>{u.email}</p>
              <p>VIP: {u.vip ? 'Yes' : 'No'} | Status: {u.status}</p>
              {u.vip && <button onClick={() => removeVip(u._id)}>Remove VIP</button>}
            </div>
          ))}
        </div>

        <div className="adminBox">
          <h3>Telegram Signal Automation</h3>
          <button onClick={testTelegram}>Test Telegram Bot</button>
          <form onSubmit={postSignal}>
            <input value={signal.title} onChange={e => setSignal({...signal, title: e.target.value})} placeholder="Signal title" />
            <textarea value={signal.message} onChange={e => setSignal({...signal, message: e.target.value})} />
            <label className="checkbox">
              <input type="checkbox" checked={signal.sendTelegram} onChange={e => setSignal({...signal, sendTelegram: e.target.checked})} />
              Send to Telegram channel also
            </label>
            <button>Post Signal</button>
          </form>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
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
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
