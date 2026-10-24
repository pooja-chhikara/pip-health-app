import BuddyAvatar from './BuddyAvatar.jsx'

export default function About() {
  return (
    <section id="about" className="py-5">
      <div className="container">
        <div className="row align-items-center g-4">
          <div className="col-lg-4 text-center">
            <BuddyAvatar mood="okay" size={160} />
          </div>
          <div className="col-lg-8">
            <h2 className="fw-bold mb-3">About Pip</h2>
            <p className="text-secondary">
              Pip is a friendly health companion built for kids and families. It uses a simple,
              transparent rule engine to turn symptoms and vitals into easy-to-understand tips and
              precautions - and can optionally use Google's Gemini AI to add extra kid-friendly
              explanations.
            </p>
            <ul className="text-secondary">
              <li>Pip never diagnoses and never replaces a doctor.</li>
              <li>Anything that looks serious always points to "tell a grown-up right away".</li>
              <li>Your check-in history stays saved privately in this browser, tied to your account.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
