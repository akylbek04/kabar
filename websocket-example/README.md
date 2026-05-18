# Kabar — WebSocket example

A minimal **Socket.io** server and HTML client used to learn connection lifecycle, broadcasts, rooms, and custom events. It is **not** wired into the main Kabar app; the production stack uses Socket.io inside `backend/`.

## What it demonstrates

On connect, the server:

- Emits `welcome` to all clients
- Emits `only-socket` to the connecting client only
- Broadcasts `user:joined` to everyone else
- Joins the socket to `room1` and emits room-scoped events

The sample client in `index.html` connects to `http://localhost:3000` and logs incoming events.

## Prerequisites

- Node.js 18+

## Setup

```bash
cd websocket-example
npm install
```

## Run

Development (nodemon):

```bash
npm run dev
```

Production:

```bash
npm start
```

Server listens on **port 3000**.

## Try it

1. Start the server (`npm run dev`).
2. Open `index.html` in a browser (or serve the folder with any static server).
3. Open the browser console — you should see `only-socket` and `user:joined` messages.
4. Open a second tab to observe broadcast behavior when new clients connect.

## Files

| File | Role |
| ---- | ---- |
| `server.js` | Socket.io server (rooms, emit patterns) |
| `index.html` | Browser client using the Socket.io CDN |
| `package.json` | Scripts and `socket.io` dependency |

## Relation to Kabar

| | `websocket-example/` | `backend/` |
| - | -------------------- | ----------- |
| Purpose | Learning / prototyping | Production API + chat |
| Port | 3000 | 8000 (default) |
| Auth / DB | None | JWT, MongoDB |

For the real-time features used by the React app, run the **backend** and see [backend/README.md](../backend/README.md).
