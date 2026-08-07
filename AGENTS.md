# Agent Instructions for Kabar

Kabar is a full-stack real-time messenger with one-on-one/group chats, topics, presence, file uploads, and WebRTC voice/video calls.

## Quick Start

```bash
cd backend && npm ci && cd ../client && npm ci   # install
npm run check                                     # typecheck + lint + build
npm test                                          # run all tests
```

## Architecture Map

```
kabar/
├── backend/                    # Express 5 + TypeScript API
│   └── src/
│       ├── config/             # env, database, passport, multer, HTTP status codes
│       ├── controllers/        # Route handlers (auth, chat, message, topic, user)
│       ├── services/           # Business logic layer
│       ├── validators/         # Zod request validation schemas
│       ├── models/             # Mongoose schemas (User, Chat, Message, Topic)
│       ├── middlewares/        # asyncHandler, errorHandler
│       ├── lib/                # Socket.io setup and WebRTC signaling
│       ├── routes/             # Express route definitions
│       ├── utils/              # Helpers (cookie, bcrypt, env, errors, uploads)
│       └── __tests__/          # Vitest test suites
├── client/                     # React 19 + Vite SPA
│   └── src/
│       ├── pages/              # Route-level page components
│       ├── hooks/              # Zustand stores + Socket.io hooks
│       ├── components/         # Reusable UI (Shadcn/UI + Radix)
│       ├── lib/                # Axios client, notification utils
│       ├── types/              # TypeScript type definitions
│       └── routes/             # React Router config
└── websocket-example/          # Standalone Socket.io learning demo (not part of main app)
```

## Key Invariants

1. **JWT is in an HTTP-only cookie** — never in localStorage or headers. Auth flows go through `setJwtAuthCookie` / `clearJwtAuthCookie`.
2. **JWT_SECRET has no fallback** — the app crashes at startup without it. This is intentional.
3. **Topics only exist in supergroup chats** — `resolveChatType()` gates topic creation. Every supergroup gets a "General" topic automatically on creation.
4. **Messages without topicId route to the General topic** via `getDefaultTopicForChat()`.
5. **Socket.io rooms use `chat._id`** as the room name. Presence is broadcast per-room.
6. **SVG uploads are blocked** to prevent stored XSS (removed from MIME allowlist).
7. **Auth endpoints are rate-limited** — 20 requests per 15 minutes per IP.

## Safe Change Boundaries

| Area | Coupling | Notes |
| ---- | -------- | ----- |
| Auth flow | High | Changes affect backend cookie util + passport config + client useAuth hook + Socket.io handshake |
| Topic system | Medium | Tied to supergroup chat type; affects message routing and UI topic lists |
| File uploads | Low | Self-contained in multer.config.ts + upload.util.ts |
| WebRTC calls | Low | Signaling only via Socket.io; no media server |
| UI components | Low | Shadcn/UI components are isolated; Zustand stores are per-feature |

## Commands Reference

| Command | Location | Purpose |
| ------- | -------- | ------- |
| `npm run check` | root | Full verification (typecheck + lint + build) |
| `npm test` | root | Run all test suites |
| `npm run dev` | backend/ | Start Express dev server (port 8000) |
| `npm run dev` | client/ | Start Vite dev server (port 5173) |
| `npm run build` | root | Build both packages |
| `npm run lint` | root | Lint both packages |
