# HackMate — Real-Time Hackathon Team Finder

![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)
![React 18](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-24-339933.svg?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.21-000000.svg?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg?logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101.svg?logo=socket.io)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)

> **HackMate** is a full-stack, production-minded web application engineered to help developers, designers, AI/ML engineers, and students discover hackathons, find compatible teammates through explainable matching heuristics, form high-performance teams, collaborate via Kanban workspaces, and communicate in real time.

---

## ⚡ Key Highlights & Features

- 🎯 **Explainable Matchmaking Engine**: Transparent percentage score (e.g. *"88% Match — Complementary frontend/backend skills and aligned remote preferences"*) without black-box guesswork.
- 👥 **Interactive Teammate Discovery**: Faceted search across roles (Frontend, Backend, AI/ML, UI/UX, etc.), skill badges, experience levels, university/company affiliations, and availability.
- 🤝 **Teammate Connection System**: Mutual connection requests, incoming/outgoing request managers, with instant toast alerts and duplicate prevention.
- 🛡️ **Atomic Team Capacity Management**: Concurrency-safe team creation, open position role definitions, applicant approvals, and join-by-code functionality.
- 📋 **Integrated Team Workspace**: Built-in Kanban task management board (`To Do`, `In Progress`, `Done`) with priority badges, assignee tagging, and shared project links.
- 💬 **Real-Time Socket.IO Chat**: 1-on-1 direct messaging and team group channels with typing indicators, emoji reactions, read receipts, and online presence tracking.
- 🏆 **Hackathon Directory**: Live directory with deadline countdowns, track filters, prizes, and one-click Google Calendar export.
- 🛡️ **Safety & Moderation Hub**: Community reporting system, user suspension toggles, and system audit logging for platform administrators.
- 🌓 **Design System**: Dark and light modes, responsive layouts across mobile/tablet/desktop, subtle Framer Motion animations, and zero broken buttons.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Framer Motion, Recharts, Socket.IO Client, Axios, React Hook Form, React Hot Toast |
| **Backend** | Node.js, Express.js (ES Modules), Socket.IO, JWT, bcryptjs, Zod, Multer, Helmet, CORS, Express Rate Limit |
| **Database** | MongoDB with Mongoose ODM (13 collections, compound indexes, atomic update operators) |
| **Testing** | Node.js native test runner & Supertest integration suite (16 comprehensive test cases) |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on Node.js v24)
- [MongoDB](https://www.mongodb.com/) running locally on port 27017 or a MongoDB Atlas URI

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/hackmate.git
cd hackmate

# Install root, backend, and frontend packages with one command
npm run install:all
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/hackmate
JWT_SECRET=super_secret_hackmate_jwt_key_2026_production_grade
JWT_EXPIRES_IN=7d
COOKIE_SECRET=super_secret_cookie_key_hackmate
UPLOAD_DIR=uploads
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed Realistic Demo Data

Populate your database with **15 diverse student/developer profiles**, 4 major hackathons, 3 active teams with open roles, conversations, messages, and Kanban tasks:

```bash
npm run seed
```

### 4. Run Both Servers Concurrently

```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🔑 Demo Accounts

The database seed script provides ready-to-test accounts. You can log into any of these with one click from the Login page:

| Role / Persona | Email | Password | Primary Stack | Affiliation |
|---|---|---|---|---|
| **Platform Admin** | `admin@hackmate.dev` | `Password@123` | Security & Moderation | HackMate Core |
| **Frontend Lead** | `sophia@hackmate.dev` | `Password@123` | React, TypeScript, Tailwind | UC Berkeley |
| **AI/ML Specialist** | `marcus@hackmate.dev` | `Password@123` | Python, PyTorch, LangChain | Stanford |
| **Full-Stack Builder** | `priya@hackmate.dev` | `Password@123` | Node.js, Express, Next.js | MIT |
| **Backend & Cloud** | `liam@hackmate.dev` | `Password@123` | Go, Kubernetes, PostgreSQL | CMU |
| **UI/UX Designer** | `kenji@hackmate.dev` | `Password@123` | Figma, UI Systems, CSS | RISD |

---

## 🧪 Automated Test Suite

HackMate features an automated integration test suite that tests registration, duplicate checks, login, profile updates, matchmaking scores, connection requests, team creation, Kanban workspace security, and authorization boundaries:

```bash
npm test
```

**Output:**
```text
=======================================================
🧪 RUNNING HACKMATE FULL-STACK BACKEND TEST SUITE
=======================================================
  ✅ PASS: Health check endpoint returns 200 and healthy status
  ✅ PASS: User registration creates account and returns JWT token
  ✅ PASS: Registration prevents duplicate email collision
  ✅ PASS: Registration rejects malformed email and short password
  ✅ PASS: Login returns authenticated session for valid credentials
  ✅ PASS: Login rejects invalid password with 401 Unauthorized
  ✅ PASS: Protected /auth/me returns current user profile with valid JWT
  ✅ PASS: Protected endpoints block unauthenticated requests with 401
  ✅ PASS: User can update bio, experience level, and preferred roles
  ✅ PASS: Teammate discovery returns candidates with calculated compatibility
  ✅ PASS: User can send teammate connection request to another user
  ✅ PASS: Duplicate teammate request is prevented
  ✅ PASS: Hackathon listings are retrieved with domain & format filters
  ✅ PASS: User can create a team with open positions and desired size
  ✅ PASS: Team leader can create task in team workspace
  ✅ PASS: Non-members are blocked from accessing team tasks with 403

=======================================================
📊 TEST RESULTS: 16 PASSED, 0 FAILED
=======================================================
```

---

## 📂 Project Structure

```text
Hackathon team finder/
├── client/                     # Frontend React (Vite)
│   ├── src/
│   │   ├── api/                # Axios instance & interceptors
│   │   ├── components/         # Reusable Navbar, Sidebar, Modals, EmptyStates
│   │   ├── context/            # Auth, Socket.IO, Theme contexts
│   │   ├── layouts/            # AppLayout container
│   │   ├── pages/              # 22 responsive views
│   │   ├── App.jsx             # React Router configuration
│   │   ├── main.jsx            # Application entrypoint
│   │   └── index.css           # Tailwind design tokens & utilities
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Backend Node.js / Express
│   ├── scripts/
│   │   ├── seed.js             # Realistic 15+ entity database seeder
│   │   └── runTests.js         # Integration test suite
│   ├── src/
│   │   ├── config/             # MongoDB connection setup
│   │   ├── controllers/        # REST controllers (Auth, Teams, Chat, etc.)
│   │   ├── jobs/               # Background deadline reminder cron job
│   │   ├── middleware/         # Auth, Upload, Rate limiter, Error handler
│   │   ├── models/             # 13 Mongoose models
│   │   ├── routes/             # REST route endpoints
│   │   ├── sockets/            # Socket.IO event handlers & rooms
│   │   ├── utils/              # Matchmaking algorithm, Token, Email
│   │   ├── validators/         # Zod request validators
│   │   ├── app.js              # Express app bootstrap
│   │   └── server.js           # HTTP + Socket.IO server listener
│   └── package.json
├── docs/                       # Technical Documentation
│   ├── API.md                  # Complete REST API reference
│   ├── DATABASE.md             # Schema specifications & integrity rules
│   └── ARCHITECTURE.md         # Architecture, Socket.IO & algorithm details
├── package.json                # Root package with concurrently commands
└── README.md                   # Project overview & documentation
```

---

## 📚 Technical Documentation

- [REST API Reference](docs/API.md)
- [Database Schema & Architecture](docs/DATABASE.md)
- [System Architecture & Matching Algorithm](docs/ARCHITECTURE.md)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
