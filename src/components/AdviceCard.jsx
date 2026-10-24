import BuddyAvatar from './BuddyAvatar.jsx'

const META = {
  ok: { bg: 'success-subtle', text: 'success', badge: "All's well" },
  caution: { bg: 'warning-subtle', text: 'warning-emphasis', badge: 'Keep an eye on it' },
  urgent: { bg: 'danger-subtle', text: 'danger', badge: 'Tell a grown-up now' },
}

export default function AdviceCard({ insight, onDone }) {
  const meta = META[insight.urgency] || META.ok

  return (
    <div className={`card border-0 bg-${meta.bg} p-3`}>
      <div className="d-flex align-items-center gap-3 mb-2">
        <BuddyAvatar mood={insight.buddyMood} size={56} />
        <div>
          <span className={`badge bg-white text-${meta.text} mb-1`}>{meta.badge}</span>
          <h5 className="mb-0">{insight.headline}</h5>
        </div>
      </div>

      {insight.precautions.length > 0 && (
        <div className="mb-2">
          <h6 className="text-uppercase text-secondary small fw-bold">Precautions</h6>
          <ul className="mb-0 ps-3 small">
            {insight.precautions.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {insight.tips.length > 0 && (
        <div className="mb-2">
          <h6 className="text-uppercase text-secondary small fw-bold">Helpful tips</h6>
          <ul className="mb-0 ps-3 small">
            {insight.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="fst-italic text-secondary small mb-3">
        Pip isn't a doctor 👩‍⚕️ — for anything that worries you, always check in with a grown-up or a real doctor.
      </p>

      {onDone && (
        <button type="button" className="btn btn-primary rounded-pill align-self-start" onClick={onDone}>
          Got it, thanks Pip!
        </button>
      )}
    </div>
  )
}
