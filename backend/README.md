# Kabar — Backend

Express 5 API with MongoDB, JWT authentication (Passport), local file uploads (Multer), and Socket.io for real-time chat, presence, and call signaling.

## Prerequisites

- Node.js 18+
- MongoDB connection string

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`, then start the dev server:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## Environment variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=8000

MONGO_URI=mongodb://localhost:27017/kabar

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m

# Must match the URL where the React app runs (CORS + cookies)
FRONTEND_ORIGIN=http://localhost:5173
```

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `NODE_ENV` | No | `development` | Runtime environment |
| `PORT` | No | `8000` | HTTP server port |
| `MONGO_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | No | `secret_jwt` | JWT signing secret (use a strong value in production) |
| `JWT_EXPIRES_IN` | No | `15m` | Access token lifetime |
| `FRONTEND_ORIGIN` | No | `http://localhost:5174` | Allowed CORS origin for the client |

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start with nodemon + ts-node |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled `dist/index.js` |

## API endpoints

All JSON routes under `/api` unless noted.

### Health

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/health` | No | Server health check |

### Auth — `/api/auth`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/register` | No | Register a new user |
| POST | `/login` | No | Log in (sets auth cookie) |
| POST | `/logout` | No | Log out |
| GET | `/status` | Yes | Current auth status |

### Chat — `/api/chat`

All routes require JWT (cookie or bearer, per Passport config).

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/create` | Create a chat |
| GET | `/all` | List current user's chats |
| GET | `/:id` | Get a single chat |
| POST | `/message/send` | Send a message (optional `file` field) |
| GET | `/:id/topics` | List topics in a chat |
| POST | `/:id/topics` | Create a topic in a chat |

### User — `/api/user`

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/all` | List users |
| PUT | `/profile` | Update profile (optional `avatar` file) |

## File uploads

Uploaded files are stored under `backend/uploads/` (avatars and message attachments). This directory is gitignored; serve files via `GET /uploads/...` in development.

Do not commit real user uploads or production secrets.

## Project structure

```
backend/
├── src/
│   ├── config/       # env, database, multer, passport
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── lib/          # Socket.io, call signaling
│   └── index.ts
├── uploads/          # created at runtime (gitignored)
├── nodemon.json
└── package.json
```

## Socket.io

Real-time logic lives in `src/lib/socket.ts` and related modules. The client connects to the same host as `VITE_API_URL` in development.
