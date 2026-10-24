// Logged out  -> shows "Log in" and "Sign up" buttons.
// Logged in   -> shows the profile chip and a "Log out" button.
export default function Navbar({ user, profile, onOpenProfile, onGetStarted, onNavigate, onLoginClick, onSignupClick, onLogout, onOpenVault }) {
  return (
    <nav className="navbar navbar-expand-md bg-white border-bottom sticky-top">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center gap-2" href="#home" onClick={(e) => { e.preventDefault(); onNavigate('home') }}>
          <span className="brand-icon">🦄</span>
          <span className="fw-bold">Pip</span>
          <span className="text-secondary small d-none d-sm-inline">Health companion</span>
        </a>

        <div className="d-flex align-items-center gap-2 order-md-3">
          {user ? (
            <>
              <button type="button" className="profile-chip d-none d-sm-flex" onClick={onOpenProfile}>
                <span className="profile-chip-avatar">{profile ? profile.avatar : '🙂'}</span>
                <span className="small fw-semibold">{profile ? profile.name : user.displayName || user.email}</span>
              </button>
              <button type="button" className="btn btn-outline-primary btn-sm rounded-pill" onClick={onOpenVault}>
                🔐 Health Vault
              </button>
              <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill" onClick={onLogout}>
                Log out
              </button>
              <button type="button" className="btn btn-primary rounded-pill" onClick={onGetStarted}>
                Get started
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-outline-primary btn-sm rounded-pill" onClick={onLoginClick}>
                Log in
              </button>
              <button type="button" className="btn btn-primary btn-sm rounded-pill" onClick={onSignupClick}>
                Sign up
              </button>
            </>
          )}
        </div>

        <div className="d-flex gap-3 order-md-2 mx-md-4 mt-2 mt-md-0">
          <a href="#home" className="nav-link text-secondary" onClick={(e) => { e.preventDefault(); onNavigate('home') }}>Home</a>
          <a href="#dashboard" className="nav-link text-secondary" onClick={(e) => { e.preventDefault(); onNavigate('dashboard') }}>Dashboard</a>
          <a href="#about" className="nav-link text-secondary" onClick={(e) => { e.preventDefault(); onNavigate('about') }}>About</a>
        </div>
      </div>
    </nav>
  )
}
