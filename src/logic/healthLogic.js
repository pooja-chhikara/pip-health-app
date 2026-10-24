// Transparent rule engine — readable if/then logic, no hidden model.
// General wellness tips only; anything concerning always routes to
// "tell a grown-up" rather than a home remedy.

const TIPS = {
  fever: 'Drink extra water and rest somewhere cool and comfy.',
  cough: 'Sip some warm water and try to rest your voice.',
  soreThroat: 'Warm (not hot!) drinks can feel soothing on a sore throat.',
  headache: 'Rest your eyes in a dim room and drink a glass of water.',
  tummyAche: 'Eat small, plain snacks like crackers and avoid sugary food for now.',
  fatigue: 'Your body is asking for extra sleep tonight — try to rest early.',
  runnyNose: 'Keep tissues nearby and wash your hands often.',
  itchySkin: 'Try not to scratch — a cool, damp cloth can help it feel better.',
}

export function getHealthInsight({ symptoms, temperature, heartRate, mood }) {
  const tips = []
  const precautions = []
  let urgency = 'ok'
  const bump = (lvl) => {
    const order = { ok: 0, caution: 1, urgent: 2 }
    if (order[lvl] > order[urgency]) urgency = lvl
  }

  symptoms.forEach((id) => TIPS[id] && tips.push(TIPS[id]))

  if (typeof temperature === 'number') {
    if (temperature >= 39) {
      bump('urgent')
      precautions.push('That temperature is quite high — tell a grown-up right now.')
    } else if (temperature >= 37.8) {
      bump('caution')
      precautions.push('You have a mild fever — let a grown-up know and rest up.')
    } else if (temperature < 35.5) {
      bump('caution')
      precautions.push('That reading seems low — try taking it again, and tell a grown-up.')
    }
  }

  if (typeof heartRate === 'number') {
    if (heartRate > 130 || heartRate < 50) {
      bump('urgent')
      precautions.push('That heart rate reading is outside the usual range — tell a grown-up right now.')
    } else if (heartRate > 110) {
      bump('caution')
      precautions.push('Your heart rate is a little fast — sit down, breathe slowly, and rest.')
    }
  }

  if (symptoms.length >= 4) {
    bump('caution')
    precautions.push("That's quite a few symptoms at once — a grown-up should know how you're feeling.")
  }

  if (mood === 'bad') {
    bump('caution')
    precautions.push('Feeling pretty bad matters too — go find a grown-up for a check-in.')
  }

  if (symptoms.length === 0 && urgency === 'ok') {
    tips.push('No symptoms logged — nice! Keep drinking water and stay active.')
  }

  const headline =
    urgency === 'urgent'
      ? "Let's get a grown-up right away"
      : urgency === 'caution'
      ? 'Worth telling a grown-up'
      : "You're doing okay!"

  const buddyMood = urgency === 'urgent' ? 'concerned' : urgency === 'caution' ? 'okay' : 'happy'

  return { urgency, tips: [...new Set(tips)], precautions: [...new Set(precautions)], headline, buddyMood }
}
