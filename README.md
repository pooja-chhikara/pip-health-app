# Pip — AI Health Companion (final)

A kid-friendly health website: check-ins, chatbot, Health Vault (records, reminders, patterns),
prescription photo reader, and a pretend **doctor's office API** with 10 patients whose
prescriptions and appointments Pip pulls in and turns into reminders.

The server (doctor API + Gemini) is a **separate repo**: `pip-health-api`.
Start it first, then point this website at it with `VITE_API_URL`.

## Run it on your computer
```bash
npm install
cp .env.example .env     # fill in Firebase values; VITE_API_URL=http://localhost:3001
npm run dev              # http://localhost:5173
```
Keep the `pip-health-api` server running in another terminal (`npm start` there).

Firebase console (one time): Authentication -> turn on Email/Password;
Realtime Database -> Rules -> paste `database.rules.json` -> Publish.

Try it: sign up -> Health Vault -> Clinic -> `PT-1001` -> Link.

## Deploy on Render
New -> Static Site -> this repo
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment: `VITE_API_URL` = your pip-health-api Render URL, plus every `VITE_FIREBASE_*` value from `.env`
Then Firebase -> Authentication -> Settings -> Authorized domains -> add your onrender.com address.

## Where data is saved (Firebase Realtime Database)
```
users/<uid>/
  profile          country
  records/         Health Vault records (text + photo)
  prescriptions/   uploaded + clinic prescriptions
  reminders/       doctor visits (manual + clinic)
  patientLink      linked clinic code
  fcmTokens/       devices with push alerts on
```
Check-in history stays in the browser (localStorage), and Patterns are worked out from it.

## Optional: alerts when the site is closed
Needs the Firebase **Blaze** plan.
1. Firebase → Project settings → Cloud Messaging → Web Push certificates → Generate key pair → put it in `.env` as `VITE_FIREBASE_VAPID_KEY`.
2. `functions/.env.example` → `functions/.env`, set `PIP_API_URL` to your Render API URL.
3. `cd functions && npm install && firebase deploy --only functions`
4. In Pip: Health Vault → Reminders → **📲 Alerts when Pip is closed**.

## Safety notes (it's a demo)
- All clinic data is pretend. Linking by code has no identity check — a real version needs OTP/consent.
- The server doesn't yet verify who is calling (add Firebase ID-token checks for a real launch).
- Pip never diagnoses or gives doses; prescription reading says "unclear" rather than guessing.
