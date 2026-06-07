# EuroTech Hackathon

## Project

ZaoWay is a browser-based movement game focused on interactive fitness. The app uses the webcam and TensorFlow.js MoveNet to detect body movements, count repetitions, and display a real-time fitness battle.

## Features

- Live pose detection using the browser webcam.
- Multiple movement challenges: squats, punches, burpees, high knees, and more.
- Full gameplay flow with simulated matchmaking, countdown, battle timer, scoring, and result reporting.
- Accessory shop where users spend diamonds to buy and equip avatar items.
- Leaderboard screen showing a top 30 ranking.
- Optional browser reminders using the Notification API.

## Project Structure

- `src/routes/__root.tsx`: root layout, HTML head, and global context.
- `src/routes/index.tsx`: app entry point.
- `src/components/active-pals/App.tsx`: main game logic and interface.
- `src/components/active-pals/CameraFeed.tsx`: webcam feed and pose overlay.
- `src/components/active-pals/poseDetector.ts`: MoveNet pose detection hook.
- `src/components/active-pals/scoring.ts`: exercise scoring logic.
- `src/components/active-pals/LeaderboardScreen.tsx`: hardcoded leaderboard screen.
- `src/components/active-pals/ShopScreen.tsx`: shop and equipment UI.
- `src/components/ui/`: reusable UI components based on Radix/Tailwind.

## Technologies

- React 19
- TypeScript
- Vite
- TanStack Router
- TensorFlow.js MoveNet
- Tailwind CSS
- Radix UI

## Installation and Running

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the app in your browser at the address shown by Vite (`http://localhost:5173` by default).

## Useful Commands

- `npm run dev`: starts the app in development mode.
- `npm run build`: builds the production version.
- `npm run preview`: previews the production build.
- `npm run lint`: checks code with ESLint.
- `npm run format`: formats code with Prettier.

## Known Limitations

- No backend persistence: diamonds, purchases, and leaderboard data are kept in memory and reset when the page refreshes.
- Matchmaking and leaderboard are simulated on the client side.
- Progression data is not saved to a user account.

## Notes

The game is designed for modern browsers with webcam access. It requires being served from `http://localhost` or HTTPS to allow camera permissions.