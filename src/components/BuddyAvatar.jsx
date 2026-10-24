export default function BuddyAvatar({ mood = 'happy', size = 96 }) {
  const bgClass =
    mood === 'concerned' ? 'bg-danger-subtle' : mood === 'okay' ? 'bg-warning-subtle' : 'bg-primary-subtle'
  const face = mood === 'concerned' ? '😟' : mood === 'okay' ? '🙂' : '😄'

  return (
    <div
      className={`buddy-circle ${bgClass} shadow-sm`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {face}
    </div>
  )
}
