import { useCallback, useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import HealthImportance from './components/HealthImportance.jsx'
import Dashboard from './components/Dashboard.jsx'
import About from './components/About.jsx'
import Footer from './components/Footer.jsx'
import FloatingCheckWindow from './components/FloatingCheckWindow.jsx'
import ProfileSettings from './components/ProfileSettings.jsx'
import ChatWidget from './components/ChatWidget.jsx'
import LoginWindow from './components/LoginWindow.jsx'
import HealthVault from './components/HealthVault.jsx'
import useReminderAlerts from './hooks/useReminderAlerts.js'
import { listItems } from './utils/vault.js'
import { getLink } from './utils/clinic.js'
import { watchUser, logOut } from './utils/auth.js'
import { loadState, saveState, clearState } from './utils/storage.js'

function defaultState() {
  return { profile: null, history: [] }
}

export default function App() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [state, setState] = useState(defaultState())
  const [checkWindow, setCheckWindow] = useState(null) // null | 'check' | 'history'
  const [showProfile, setShowProfile] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginMode, setLoginMode] = useState('login') // which tab LoginWindow opens on: 'login' | 'signup'
  const [logoutBanner, setLogoutBanner] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // 'check' | 'profile' | 'history'
  const [welcomeBanner, setWelcomeBanner] = useState(false)

  // Health Vault data (Firebase)
  const [vault, setVault] = useState({ records: [], reminders: [], prescriptions: [], link: null })
  const [vaultTab, setVaultTab] = useState(null) // null | 'records' | 'reminders' | 'patterns' | 'clinic'
  const [toast, setToast] = useState('')

  // Listen for Firebase auth state on mount
  useEffect(() => {
    const unsubscribe = watchUser((firebaseUser) => {
      setUser(firebaseUser)
      setAuthChecked(true)
    })
    return unsubscribe
  }, [])

  // Load this user's saved profile/history whenever they log in or out
  useEffect(() => {
    if (user) {
      setState(loadState(user.uid) || defaultState())
    } else {
      setState(defaultState())
    }
  }, [user])

  // Load Health Vault data from Firebase
  const reloadVault = useCallback(async () => {
    if (!user) return setVault({ records: [], reminders: [], prescriptions: [], link: null })
    try {
      const [records, reminders, prescriptions, link] = await Promise.all([
        listItems(user.uid, 'records'),
        listItems(user.uid, 'reminders'),
        listItems(user.uid, 'prescriptions'),
        getLink(user.uid),
      ])
      setVault({ records, reminders, prescriptions, link })
    } catch (err) {
      console.warn('Could not load Health Vault', err)
    }
  }, [user])

  useEffect(() => { reloadVault() }, [reloadVault])

  // Pop up reminders a day and an hour before each visit
  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 10000)
  }, [])
  useReminderAlerts(user?.uid, vault.reminders, showToast)

  // Persist state for the current user whenever it changes
  useEffect(() => {
    if (user) saveState(user.uid, state)
  }, [user, state])

  function handleSetProfile(profile) {
    setState((prev) => ({ ...prev, profile }))
  }

  function handleSaveCheckIn(entry) {
    const record = { id: crypto.randomUUID(), date: new Date().toISOString(), ...entry }
    setState((prev) => ({ ...prev, history: [record, ...prev.history] }))
  }

  function handleResetData() {
    if (user) clearState(user.uid)
    setState(defaultState())
    setShowProfile(false)
    setCheckWindow(null)
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  // --- Login-gated actions -------------------------------------------------
  // "Get started" / "Check my health" / "New check-in" should open the
  // floating check window immediately if logged in, otherwise open the
  // login window first and remember to open it right after login succeeds.

  // Open the login window on the "Log In" tab or the "Sign Up" tab
  function openLogin(mode) {
    setLoginMode(mode)
    setShowLogin(true)
  }

  function handleGetStarted() {
    if (user) {
      setCheckWindow('check')
    } else {
      setPendingAction('check')
      openLogin('login')
    }
  }

  function handleOpenProfile() {
    if (user) {
      setShowProfile(true)
    } else {
      setPendingAction('profile')
      openLogin('login')
    }
  }

  function handleOpenHistory() {
    if (user) {
      setCheckWindow('history')
    } else {
      setPendingAction('history')
      openLogin('login')
    }
  }

  function handleOpenVault(tab = 'records') {
    if (user) setVaultTab(tab)
    else { setPendingAction('vault'); openLogin('login') }
  }

  function handleAuthSuccess() {
    setShowLogin(false)
    setLogoutBanner(false)
    setWelcomeBanner(true)
    setTimeout(() => setWelcomeBanner(false), 4000)

    if (pendingAction === 'check') setCheckWindow('check')
    if (pendingAction === 'history') setCheckWindow('history')
    if (pendingAction === 'profile') setShowProfile(true)
    if (pendingAction === 'vault') setVaultTab('records')
    setPendingAction(null)
  }

  async function handleLogout() {
    await logOut()
    setCheckWindow(null)
    setShowProfile(false)
    setVaultTab(null)
    setPendingAction(null)
    setWelcomeBanner(false)
    setLogoutBanner(true)
    setTimeout(() => setLogoutBanner(false), 4000)
  }

  const latestEntry = state.history[0]
  const latestVitals = latestEntry
    ? { symptoms: latestEntry.symptoms, mood: latestEntry.mood, temperature: latestEntry.temperature, heartRate: latestEntry.heartRate }
    : null

  if (!authChecked) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <span className="text-secondary">Loading…</span>
      </div>
    )
  }

  return (
    <div>
      <Navbar
        user={user}
        profile={state.profile}
        onOpenProfile={handleOpenProfile}
        onGetStarted={handleGetStarted}
        onNavigate={scrollToSection}
        onLoginClick={() => openLogin('login')}
        onSignupClick={() => openLogin('signup')}
        onLogout={handleLogout}
        onOpenVault={() => handleOpenVault('records')}
      />

      {toast && (
        <div className="alert alert-primary pip-toast d-flex gap-2 align-items-center py-2">
          <span className="small">{toast}</span>
          <button type="button" className="btn-close btn-sm" onClick={() => setToast('')}></button>
        </div>
      )}

      {welcomeBanner && user && (
        <div className="alert alert-success text-center mb-0 rounded-0 py-2">
          Welcome, {state.profile?.name || user.displayName || user.email} 👋
        </div>
      )}

      {logoutBanner && !user && (
        <div className="alert alert-secondary text-center mb-0 rounded-0 py-2">
          You are logged out. See you soon!
        </div>
      )}

      <Hero onGetStarted={handleGetStarted} />
      <HealthImportance />
      <Dashboard
        profile={state.profile}
        history={state.history}
        onOpenHistory={handleOpenHistory}
        onGetStarted={handleGetStarted}
        user={user}
        prescriptions={vault.prescriptions}
        reminders={vault.reminders}
        onVaultChanged={reloadVault}
        onOpenVault={handleOpenVault}
        onLogin={() => openLogin('login')}
      />
      <About />
      <Footer />

      {checkWindow && (
        <FloatingCheckWindow
          initialTab={checkWindow}
          profile={state.profile}
          onSetProfile={handleSetProfile}
          history={state.history}
          onSaveCheckIn={handleSaveCheckIn}
          onClose={() => setCheckWindow(null)}
        />
      )}

      {showProfile && (
        <ProfileSettings
          user={user}
          profile={state.profile}
          onClose={() => setShowProfile(false)}
          onSaveProfile={handleSetProfile}
          onResetData={handleResetData}
          onLogout={handleLogout}
        />
      )}

      {vaultTab && user && (
        <HealthVault
          user={user}
          initialTab={vaultTab}
          records={vault.records}
          reminders={vault.reminders}
          history={state.history}
          link={vault.link}
          onChanged={reloadVault}
          onClose={() => setVaultTab(null)}
        />
      )}

      {showLogin && (
        <LoginWindow
          initialMode={loginMode}
          onClose={() => { setShowLogin(false); setPendingAction(null) }}
          onSuccess={handleAuthSuccess}
        />
      )}

      <ChatWidget latestVitals={latestVitals} />
    </div>
  )
}
