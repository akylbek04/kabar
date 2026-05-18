# Kabar — Real-Time Messenger

Kabar is a full-stack real-time messaging app: one-on-one and group chats, topics, presence, file uploads, voice/video calls (WebRTC), and light/dark UI.

## Live demo

Try the deployed app: **[https://kabar.onrender.com](https://kabar.onrender.com)**

## Monorepo layout

| Package | Description |
| -------- | ----------- |
| [`backend/`](./backend/) | Express + TypeScript API, MongoDB, Socket.io, JWT auth |
| [`client/`](./client/) | React + Vite frontend (Tailwind v4, Shadcn/UI) |
| [`websocket-example/`](./websocket-example/) | Standalone Socket.io playground for learning events & rooms |

See each package README for setup details.

## Features

- JWT authentication with HTTP-only cookies
- Real-time messaging, presence, and chat updates (Socket.io)
- One-on-one and group chats with topics
- Reply to messages, last-message previews
- User profiles with avatars and status
- Local file uploads (avatars & message attachments)
- WebRTC voice/video calls with TURN support
- Light and dark mode, responsive layout

## Tech stack

| Layer | Stack |
| ----- | ----- |
| Frontend | React 19, TypeScript, Vite, Tailwind v4, Shadcn/UI, Zustand |
| Backend | Node.js, Express 5, TypeScript, Mongoose |
| Database | MongoDB |
| Real-time | Socket.io |
| Auth | Passport JWT, cookies |

## Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/your-username/kabar.git
cd kabar
```

Install dependencies in each package you plan to run:

```bash
cd backend && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # then edit values
npm run dev
```

API runs at `http://localhost:8000` by default. Health check: `GET /health`.

### 3. Client

```bash
cd client
cp .env.example .env   # then edit values
npm run dev
```

App runs at `http://localhost:5173` (Vite default) unless configured otherwise. Set `FRONTEND_ORIGIN` on the backend to match your client URL.

### 4. WebSocket example (optional)

A minimal Socket.io server for experimenting with broadcasts, rooms, and events:

```bash
cd websocket-example
npm install
npm run dev
```

See [`websocket-example/README.md`](./websocket-example/README.md).

## Environment variables

| Package | File | Docs |
| ------- | ---- | ---- |
| Backend | `backend/.env` | [backend/README.md](./backend/README.md) |
| Client | `client/.env` | [client/README.md](./client/README.md) |

Never commit `.env` files. Use `.env.example` as a template.

## API overview

Base path: `/api`

| Area | Prefix | Notes |
| ---- | ------ | ----- |
| Auth | `/api/auth` | register, login, logout, status |
| Chat | `/api/chat` | chats, messages, topics (JWT required) |
| User | `/api/user` | list users, update profile (JWT required) |

Full endpoint list: [backend/README.md](./backend/README.md#api-endpoints).

## Scripts (per package)

| Location | Dev | Build | Start |
| -------- | --- | ----- | ----- |
| `backend/` | `npm run dev` | `npm run build` | `npm start` |
| `client/` | `npm run dev` | `npm run build` | `npm run preview` |
| `websocket-example/` | `npm run dev` | — | `npm start` |

## Project structure

```
kabar/
├── backend/           # Express API + Socket.io
├── client/            # React SPA
├── websocket-example/ # Socket.io learning demo
└── README.md
```
