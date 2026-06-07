# HONESTY.md

> Mandatory disclosure for the hackathon. This file lives at the root of your repository. Judges cross-check it against your code and your technical video.
>
> **The deal:** disclosed shortcuts are **not** penalized — that is the entire point of this file. Hidden ones are. Undisclosed pre-built code is heavily penalized, each undisclosed mock carries a small penalty, and a faked demo is heavily penalized. Telling the truth here costs you nothing.

---

## 1. Team — who did what
Judges compare this against `git shortlog -sn`, so keep it honest.

| Member | GitHub handle | Main contributions |
|---|---|---|
| Mohamed Aymen Bouyahia  | @aymen20002005 | Building AI |
| Amina Karmenova | @am1nkv | Building Web Interface |
| Viktoria Georgieva | @viniqueness | Business Development of the project |
| Hajar Chakir | @Hajar-CHAKIR | Deploying the project and cleaning code|

---

## 2. What is fully working
Features that run end-to-end on the live app, with real data and real logic. Be specific: name the feature, what input it takes, what output it produces.

- Live movement game experience: the app captures webcam input, runs TensorFlow.js MoveNet pose detection in the browser, scores movement reps, and updates the battle HUD live.
- Challenge flow and results: users can choose a challenge, go through matchmaking, countdown, battle timer, score tracking, and a report screen that shows score, rival score, stats, and diamond rewards.
- Shop and customization: users can spend in-game diamonds to buy and equip avatar accessories, with purchases reflected immediately in the app state.
- Leaderboard and home dashboard: shows the current rank, streak display, diamond balance, and a top 30 leaderboard screen.

---

## 3. What is mocked, stubbed, or hardcoded
Every shortcut. Examples: a login that accepts any password, a payment that always succeeds, an "AI" that is an if/else, a database that is an in-memory dictionary, fake JSON returned instead of a real API call.

**Undisclosed mocks carry a small penalty each. Anything you list here = free.**

| What is faked | Where (file:line or folder) | Why we mocked it | What the real version would do |
|---|---|---|---|
| Rival opponent behavior and score progression | `src/components/active-pals/App.tsx` | Simulates multiplayer competition without a backend | Real version would use live opponent data from a server or matchmaking service |
| Leaderboard entries | `src/components/active-pals/LeaderboardScreen.tsx` | Provides a ranking experience without a database | Real version would fetch and display actual scores from a backend data store |
| Diamond balance / shop inventory | `src/components/active-pals/App.tsx`, `src/components/active-pals/ShopScreen.tsx` | Keeps economy in-memory for demo scope | Real version would persist purchases and balances per user with a backend or account system |
| Streak and rank values | `src/components/active-pals/App.tsx` | Shows a polished UI with demo progression values | Real version would compute these from history and persistent user data |

---

## 4. External APIs, services & data sources
Everything the project calls or pretends to call. Mark each as real or mocked.

| Service / API / dataset | Used for | Real call or mocked? | Auth (sandbox / test key / none) |
|---|---|---|---|
| Google Fonts (`fonts.googleapis.com`) | Typography / fonts | Real call | none |
| Browser webcam API (`navigator.mediaDevices.getUserMedia`) | Live camera input for pose detection | Real call | none |
| Browser Notification API | Daily reminder notifications | Real call | none |
| TensorFlow.js MoveNet | In-browser pose detection model | Real call via local npm package runtime | none |

---

## 5. Pre-existing code
Anything written **before** kickoff that we brought into this project: prior personal projects, forked open-source code, templates, boilerplate, internal libraries.

**Undisclosed pre-built code is heavily penalized. Anything you list here = free.**

| Item | Source (URL or description) | Roughly how much | License |
|---|---|---|---|
| Project scaffold and router setup | TanStack React Start / Vite starter template used for app structure | Starter scaffold and project boilerplate | MIT-style open source |
| UI component patterns | Radix UI/Tailwind-style component scaffold from starter | UI component boilerplate | MIT-style open source |

If none, write: *"All code in this repo was written during the hackathon window."*

---

## 6. Known limitations & next steps
What we would build next, and the weak spots we already know about. Naming these honestly is a strength, not a flaw.

- No backend persistence: diamonds, purchases, leaderboard standings, and match history reset on refresh.
- Multiplayer is simulated: rival scores and leaderboard are client-side and not connected to real players.
- Shop and progression are client-only with no account save state.
- Next steps: add a backend for persistence, real multiplayer / leaderboard, user accounts, and saved progression for cosmetics and streaks.
