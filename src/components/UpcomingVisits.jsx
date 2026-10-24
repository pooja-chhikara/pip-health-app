// Dashboard card: next doctor visits from reminders.
export default function UpcomingVisits({ reminders, onOpenVault }) {
  const now = Date.now()
  const next = reminders
    .filter((r) => !r.done && r.visitAt >= now - 3600000)
    .sort((a, b) => a.visitAt - b.visitAt)
    .slice(0, 3)

  return (
    <div className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">📅 Upcoming doctor visits</h5>
        <button type="button" className="btn btn-link btn-sm text-decoration-none" onClick={onOpenVault}>All reminders &rarr;</button>
      </div>
      {next.length === 0 ? (
        <div className="dashboard-stat-card text-center text-secondary small">No visits coming up.</div>
      ) : (
        <div className="row g-3">
          {next.map((r) => (
            <div className="col-md-4" key={r.id}>
              <div className="dashboard-stat-card h-100 border-start border-4 border-primary">
                <p className="fw-bold mb-1">{r.title}</p>
                <p className="small mb-1">{new Date(r.visitAt).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</p>
                {r.doctor && <p className="text-secondary small mb-0">{r.doctor}</p>}
                {r.source === 'clinic' && <span className="badge text-bg-info mt-2">From clinic</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
