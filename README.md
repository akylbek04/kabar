# 💬 Kabar – Real-Time Messenger Platform

A modern, full-stack real-time messaging platform built with the MERN stack and WebSockets.

---

## 🗝️ Key Features

- ✅ Authentication with JWT & Secure Cookies
- 🔌 Real-Time Messaging via WebSocket (Socket.io)
- 💬 One-on-One & Group Chats
- 👥 Join & Leave Rooms in Real-Time
- 🟢 Online / Offline User Presence
- 💬 Reply to Specific Messages
- ⚡ Real-Time Last Message Updates
- 👤 User Profiles with Avatars, Descriptions & Statuses
- 📁 Image Upload with Cloudinary
- 🌗 Light & Dark Mode
- 📱 Fully Responsive UI
- 🎨 Styled with **Tailwind v4** + **Shadcn/UI**
- 🧩 Built with **Node.js**, **Express**, **MongoDB**, **React**, and **TypeScript**

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | React, TypeScript, Vite, Tailwind v4, Shadcn/UI |
| Backend    | Node.js, Express, TypeScript        |
| Database   | MongoDB (Mongoose)                  |
| Auth       | Passport.js, JWT, Cookies           |
| Real-Time  | Socket.io                           |
| Storage    | Cloudinary                          |

---

## 📁 Project Structure

```
kabar/
├── backend/          # Express API server
│   └── src/
│       ├── config/       # DB, env, cloudinary, passport config
│       ├── controllers/  # Route handlers
│       ├── middlewares/   # Auth, error handling
│       ├── models/       # Mongoose schemas
│       ├── routes/       # API routes
│       ├── services/     # Business logic
│       ├── validators/   # Zod validation schemas
│       └── lib/          # Socket.io setup
├── client/           # React frontend (Vite)
│   └── src/
│       ├── components/   # UI components
│       ├── hooks/        # Custom hooks (auth, chat, socket)
│       ├── pages/        # Route pages
│       ├── lib/          # Axios client, helpers
│       └── types/        # TypeScript types
└── websocket-example/  # Socket.io example server
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/kabar.git
cd kabar
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `backend/.env` file:

```env
NODE_ENV=development
PORT=8000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m

CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `client/.env` file:

```env
VITE_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5174`.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint              | Description       |
| ------ | --------------------- | ----------------- |
| POST   | `/api/auth/register`  | Register user     |
| POST   | `/api/auth/login`     | Login user        |
| POST   | `/api/auth/logout`    | Logout user       |

### Chat
| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| POST   | `/api/chat/create`     | Create a new chat     |
| GET    | `/api/chat/all`        | Get all user chats    |
| GET    | `/api/chat/:id`        | Get single chat       |
| POST   | `/api/chat/message/send` | Send a message      |

### User
| Method | Endpoint          | Description        |
| ------ | ----------------- | ------------------ |
| GET    | `/api/user/all`   | Get all users      |
| PUT    | `/api/user/profile` | Update profile   |

