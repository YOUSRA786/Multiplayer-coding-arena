# Multiplayer Coding Arena 🚀

A real-time competitive coding platform where users can create or join rooms, solve coding challenges simultaneously, and compete on live leaderboards with instant updates.

## ✨ Features

* 🔐 JWT Authentication (Login / Signup)
* 🎮 Create & Join Multiplayer Rooms
* ⚡ Real-time Battles using Socket.io
* 💻 Monaco Code Editor (VS Code-like experience)
* 🧠 Random Coding Problem Assignment
* 📊 Live Leaderboard Updates
* 💬 In-Room Chat System
* 🗄️ MongoDB Data Persistence
* 🚀 Redis-based Leaderboards
* 📦 BullMQ Queue for Code Execution Jobs
* 🐳 Separate Execution Microservice
* 🛡️ Helmet, Rate Limiting, Input Sanitization
* 🌙 Modern Dark UI

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios
* Socket.io Client
* Monaco Editor

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* Socket.io
* Redis
* BullMQ
* JWT Authentication

### DevOps / Tools

* Docker
* GitHub
* Postman

---

## 📁 Project Structure

```bash id="wsv1l1"
multiplayer-coding-arena/
│── frontend/
│── backend/
│── execution-service/
│── docker-compose.yml
│── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash id="7x2cbk"
git clone https://github.com/yourusername/multiplayer-coding-arena.git
cd multiplayer-coding-arena
```

---

### 2️⃣ Backend Setup

```bash id="rlqj9q"
cd backend
npm install
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash id="om2dfr"
cd frontend
npm install
npm start
```

---

### 4️⃣ Execution Service

```bash id="m2p6or"
cd execution-service
npm install
npm start
```

---

### 5️⃣ Redis / MongoDB

Use local setup or Docker:

```bash id="ef1q9q"
docker-compose up
```

---

## 🔑 Environment Variables

Create `.env` inside backend:

```env id="kk7c3l"
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
EXECUTOR_URL=http://localhost:5001
```

---

## 🚀 How It Works

1. User signs up / logs in
2. Creates or joins a battle room
3. Random coding problem assigned
4. Players solve in real-time
5. Submissions processed through queue + executor
6. Live leaderboard updates instantly
7. Winner determined by score/time

---

## 🧠 Architecture

```text id="8j0lq1"
Frontend
   ↓
Express API + Socket.io
   ↓
Redis Queue + Leaderboards
   ↓
Worker Processes
   ↓
Execution Service
   ↓
MongoDB
```

---

## 📈 Future Improvements

* 🏆 ELO Rating System
* 👀 Spectator Mode
* 🎥 Match Replay
* 🤖 AI Code Review
* 📱 Mobile Responsive Arena
* 🧪 Anti-Cheat Detection

---

## 📸 Screenshots

*Will be available soon*

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License

MIT License

---

## ⭐ Support

If you like this project, give it a star on GitHub!

