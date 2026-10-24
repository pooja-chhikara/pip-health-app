const POINTS = [
  {
    icon: '🩺',
    bg: '#e7f1ff',
    title: 'Catch things early',
    text: 'Noticing symptoms early and telling a grown-up helps small problems stay small.',
  },
  {
    icon: '💧',
    bg: '#e6f9f1',
    title: 'Stay hydrated',
    text: 'Water helps your body fight germs, think clearly, and have more energy to play.',
  },
  {
    icon: '😴',
    bg: '#fff3e0',
    title: 'Rest matters',
    text: 'Sleep is when your body repairs itself - vitals and mood both improve with good rest.',
  },
  {
    icon: '📈',
    bg: '#fdeaf3',
    title: 'Track your patterns',
    text: 'Logging how you feel over time helps you and your family spot patterns worth discussing.',
  },
  {
    icon: '🗣️',
    bg: '#eef0ff',
    title: 'Talk about it',
    text: 'Sharing symptoms with a grown-up or doctor is always the right move, never a bother.',
  },
  {
    icon: '🤖',
    bg: '#e6f7ff',
    title: 'Friendly AI help',
    text: "Pip explains vitals and symptoms in simple words - it's a helper, never a replacement for a doctor.",
  },
]

export default function HealthImportance() {
  return (
    <section className="py-5 bg-white">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Why checking in on your health matters</h2>
          <p className="text-secondary">A few simple habits that make a big difference</p>
        </div>
        <div className="row g-4">
          {POINTS.map((p) => (
            <div className="col-md-6 col-lg-4" key={p.title}>
              <div className="key-point-card bg-light h-100">
                <div className="key-point-icon" style={{ background: p.bg }}>{p.icon}</div>
                <h5 className="fw-bold">{p.title}</h5>
                <p className="text-secondary small mb-0">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
