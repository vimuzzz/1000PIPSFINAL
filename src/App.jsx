const telegramLink = 'https://t.me/ForexHubbSignals'

function PricingCard({ title, price, text, popular }) {
  return (
    <div className={popular ? 'card popular' : 'card'}>
      {popular && <span className="badge-small">MOST POPULAR</span>}
      <h3>{title}</h3>
      <h2>{price}</h2>
      <p>{text}</p>
      <a href={telegramLink} target="_blank" rel="noreferrer" className="card-btn">
        Join Now
      </a>
    </div>
  )
}

export default function App() {
  return (
    <div className="site">
      <nav className="navbar">
        <div className="brand">
          <img src="/logo.jpg" alt="1000PIPS Logo" />
          <span>1000PIPS</span>
        </div>

        <div className="nav-links">
          <a href="#pricing">Pricing</a>
          <a href="#analysis">Analysis</a>
          <a href="#reports">Reports</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <header className="hero">
        <div className="glow"></div>

        <div className="hero-content">
          <img src="/logo.jpg" alt="1000PIPS Logo" className="hero-logo" />
          <p className="label">Professional Forex Signal Channel</p>
          <h1>1000PIPS Forex Signals</h1>
          <p className="subtitle">
            Premium Forex, Gold, Crypto and Indices signals with daily market analysis,
            VIP membership packages and professional trading reports.
          </p>

          <div className="hero-buttons">
            <a href="#pricing" className="btn primary">View VIP Packages</a>
            <a href={telegramLink} target="_blank" rel="noreferrer" className="btn outline">
              Free Telegram Channel
            </a>
          </div>
        </div>
      </header>

      <section className="stats">
        <div><h3>24/5</h3><p>Market Coverage</p></div>
        <div><h3>1:3</h3><p>Risk Reward Focus</p></div>
        <div><h3>VIP</h3><p>Premium Signals</p></div>
        <div><h3>1000PIPS</h3><p>Trading Community</p></div>
      </section>

      <section className="section" id="pricing">
        <p className="label">Subscription Packages</p>
        <h2 className="section-title">Choose Your VIP Plan</h2>

        <div className="pricing">
          <PricingCard title="1 Month" price="$45" text="Premium VIP signals, daily analysis and Telegram access." />
          <PricingCard title="3 Months" price="$100" text="Best value package for serious traders." popular />
          <PricingCard title="Lifetime" price="$400" text="One-time payment for lifetime VIP access." />
        </div>
      </section>

      <section className="section grid-two" id="analysis">
        <div>
          <p className="label">Daily Market Analysis</p>
          <h2 className="section-title left">Gold, Forex, Crypto & Indices</h2>
          <p className="text">
            Use this website to publish daily market breakdowns, weekly trading plans,
            trade reports, chart screenshots and VIP member updates.
          </p>
          <ul className="check-list">
            <li>Daily market analysis blog area</li>
            <li>TradingView live chart section ready</li>
            <li>Member-only VIP area can be added next</li>
            <li>PayPal, Skrill and Visa payment sections ready</li>
          </ul>
        </div>

        <div className="chart-card">
          <div className="chart-top"><span></span><span></span><span></span></div>
          <div className="chart-bars">
            <span className="red h1"></span>
            <span className="green h2"></span>
            <span className="red h3"></span>
            <span className="green h4"></span>
            <span className="green h5"></span>
            <span className="red h2"></span>
          </div>
          <p>TradingView chart can be connected in the next upgrade.</p>
        </div>
      </section>

      <section className="section" id="reports">
        <p className="label">Previous Performance</p>
        <h2 className="section-title">Monthly Trading Reports</h2>

        <div className="reports">
          <div><h3>January Report</h3><p>+22% Growth</p></div>
          <div><h3>February Report</h3><p>+18% Growth</p></div>
          <div><h3>March Report</h3><p>+26% Growth</p></div>
        </div>
      </section>

      <section className="section">
        <p className="label">Testimonials</p>
        <h2 className="section-title">What Traders Say</h2>

        <div className="testimonials">
          <div>“Clean signals and clear risk management.”<strong>— VIP Member</strong></div>
          <div>“Gold analysis is very helpful every week.”<strong>— Forex Trader</strong></div>
          <div>“Professional looking service and useful Telegram updates.”<strong>— 1000PIPS Member</strong></div>
        </div>
      </section>

      <footer id="contact">
        <h2>1000PIPS</h2>
        <p>Professional Forex Signals & Market Analysis</p>

        <div className="footer-links">
          <a href={telegramLink} target="_blank" rel="noreferrer">Telegram</a>
          <a href="#">Instagram</a>
          <a href="#">TikTok</a>
          <a href="#">YouTube</a>
          <a href="#">Discord</a>
        </div>

        <p className="copyright">© 2026 1000PIPS. All rights reserved.</p>
      </footer>
    </div>
  )
}
