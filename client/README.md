# Kabar — Client

React 19 single-page app built with Vite, TypeScript, Tailwind CSS v4, and Shadcn/UI. Talks to the Kabar backend over REST (Axios) and Socket.io; supports WebRTC calls when TURN is configured.

## Prerequisites

- Node.js 18+
- Kabar backend running (see [backend/README.md](../backend/README.md))

## Setup

```bash
cd client
npm install
cp .env.example .env
```

Edit `.env`, then start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run preview   # serve dist locally
```

## Environment variables

Create `client/.env`:

```env
VITE_API_URL=http://localhost:8000

# Optional — WebRTC TURN server for voice/video calls
VITE_TURN_URL=turns:your-turn-host:443
VITE_TURN_USERNAME=your_turn_username
VITE_TURN_CREDENTIAL=your_turn_credential
```

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `VITE_API_URL` | Yes (dev) | Backend origin for API and Socket.io |
| `VITE_TURN_URL` | No | TURN server URL for WebRTC |
| `VITE_TURN_USERNAME` | No | TURN username |
| `VITE_TURN_CREDENTIAL` | No | TURN password |

In production builds, the app uses `/` as the API base; configure your host or reverse proxy to forward `/api` and WebSocket traffic to the backend.

Ensure `FRONTEND_ORIGIN` on the backend matches this app's URL (including port).

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typecheck + production bundle to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project structure

```
client/
├── src/
│   ├── components/   # UI, chat, call overlays
│   ├── hooks/        # auth, chat, socket, notifications, calls
│   ├── layouts/
│   ├── lib/          # axios, webrtc, helpers
│   ├── pages/
│   ├── routes/
│   └── types/
├── public/
├── index.html
├── vite.config.ts
└── components.json   # Shadcn/UI config
```

## Key integrations

- **REST**: `src/lib/axios-client.ts` — `VITE_API_URL/api` in development
- **Socket.io**: `src/hooks/use-socket.ts` — connects with credentials to the backend
- **WebRTC**: `src/lib/webrtc.ts` — uses `VITE_TURN_*` when placing calls

## Path alias

`@/` maps to `src/` (see `vite.config.ts`).
