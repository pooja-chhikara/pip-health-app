import Prescriptions from './Prescriptions.jsx'
import UpcomingVisits from './UpcomingVisits.jsx'

export default function Dashboard({ profile, history, onOpenHistory, onGetStarted, user, prescriptions = [], reminders = [], onVaultChanged, onOpenVault, onLogin }) {
  const latest = history[0]

  return (
    <section id="dashboard" className="py-5 bg-light">
      <div className="container">
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1">Your dashboard</h2>
            <p className="text-secondary mb-0">
              {profile ? `Welcome back, ${profile.name}!` : 'Set up your profile to start tracking check-ins.'}
            </p>
          </div>
          <button type="button" className="btn btn-primary rounded-pill" onClick={onGetStarted}>
            New check-in
          </button>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="dashboard-stat-card">
              <p className="text-secondary small mb-1">Check-ins</p>
              <p className="fs-3 fw-bold text-primary mb-0">{history.length}</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="dashboard-stat-card">
              <p className="text-secondary small mb-1">Last status</p>
              <p className="fs-6 fw-bold mb-0">{latest ? latest.insight.headline : 'No check-ins yet'}</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="dashboard-stat-card">
              <p className="text-secondary small mb-1">Last temperature</p>
              <p className="fs-3 fw-bold mb-0 font-monospace">{latest ? `${latest.temperature.toFixed(1)}°C` : '—'}</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="dashboard-stat-card">
              <p className="text-secondary small mb-1">Last heart rate</p>
              <p className="fs-3 fw-bold mb-0 font-monospace">{latest ? `${latest.heartRate} bpm` : '—'}</p>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Recent history</h5>
          <button type="button" className="btn btn-link btn-sm text-decoration-none" onClick={onOpenHistory}>
            View all &rarr;
          </button>
        </div>

        {history.length === 0 ? (
          <div className="dashboard-stat-card text-center text-secondary small">
            Nothing logged yet. Tap "New check-in" to get started.
          </div>
        ) : (
          <ul className="list-group">
            {history.slice(0, 4).map((e) => (
              <li
                key={e.id}
                className={`list-group-item d-flex justify-content-between align-items-center border-start border-4 ${
                  e.insight.urgency === 'urgent'
                    ? 'border-danger'
                    : e.insight.urgency === 'caution'
                    ? 'border-warning'
                    : 'border-success'
                }`}
              >
                <div>
                  <p className="fw-bold small mb-0">{e.insight.headline}</p>
                  <p className="text-secondary small mb-0">
                    {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} &middot;{' '}
                    {e.temperature.toFixed(1)}°C &middot; {e.heartRate} bpm
                  </p>
                </div>
                <span
                  className={`badge ${
                    e.insight.urgency === 'urgent'
                      ? 'text-bg-danger'
                      : e.insight.urgency === 'caution'
                      ? 'text-bg-warning'
                      : 'text-bg-success'
                  }`}
                >
                  {e.insight.urgency}
                </span>
              </li>
            ))}
          </ul>
        )}

        {user && <UpcomingVisits reminders={reminders} onOpenVault={() => onOpenVault('reminders')} />}
        <Prescriptions user={user} prescriptions={prescriptions} onChanged={onVaultChanged} onLogin={onLogin} />

        {user && (
          <div className="text-center mt-4">
            <button type="button" className="btn btn-outline-primary rounded-pill btn-sm me-2" onClick={() => onOpenVault('clinic')}>🏥 Link your clinic</button>
            <button type="button" className="btn btn-outline-primary rounded-pill btn-sm" onClick={() => onOpenVault('patterns')}>📈 See my patterns</button>
          </div>
        )}
      </div>
    </section>
  )
}
