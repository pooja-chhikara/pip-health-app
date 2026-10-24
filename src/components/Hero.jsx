import BuddyAvatar from './BuddyAvatar.jsx'

export default function Hero({ onGetStarted }) {
  return (
    <section id="home" className="hero-section">
      <div className="container">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <span className="badge text-bg-primary-subtle text-primary rounded-pill mb-3">For kids &amp; families</span>
            <h1 className="display-5 fw-bold mb-3">Meet Pip, your AI health buddy</h1>
            <p className="lead text-secondary mb-4">
              Check in on how you're feeling, track your vitals, and get friendly, easy-to-understand
              health tips - all in one simple dashboard.
            </p>
            <div className="d-flex gap-2 flex-wrap">
              <button type="button" className="btn btn-primary btn-lg rounded-pill px-4" onClick={onGetStarted}>
                Check my health
              </button>
              <a href="#about" className="btn btn-outline-secondary btn-lg rounded-pill px-4">
                Learn more
              </a>
            </div>
          </div>
          <div className="col-lg-5 text-center">
            <BuddyAvatar mood="happy" size={200} />
          </div>
        </div>
      </div>
    </section>
  )
}
