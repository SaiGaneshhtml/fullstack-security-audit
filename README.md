# 🛡️ Fullstack Security Audit Platform

A production-ready **full-stack security audit logging system** built from scratch — featuring a **Node.js + Express REST API** backend, an **Angular 18** frontend with a premium glassmorphic dark UI, **JWT authentication**, **MongoDB** for persistence, and full **Docker** support.

> Built as a complete learning project covering backend engineering, frontend architecture, containerization, and automated testing.

---

## 📚 Table of Contents

- [What Was Built](#-what-was-built)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [How to Run the App](#-how-to-run-the-app)
  - [Option A: Local Dev (Recommended)](#option-a-local-dev-recommended)
  - [Option B: Full Docker Stack](#option-b-full-docker-stack)
- [Login Credentials](#-login-credentials)
- [API Overview](#-api-overview)
- [Running Tests](#-running-tests)
- [Environment Variables](#-environment-variables)
- [Docker Deep Dive](#-docker-deep-dive)

---

## 🏗️ What Was Built

This project is a **Security Audit Dashboard** — a system that records and displays every significant security event in your application (logins, failures, registrations, user changes). Admins can log in and monitor all events in real time.

### Features Built

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure login/register/logout with access + refresh tokens |
| 🛡️ **Role-Based Access** | Admin-only access to audit logs via `getAuditLogs` permission |
| 📋 **Audit Log Engine** | Every auth event (login, register, logout, failures) is automatically recorded |
| 📊 **Audit Dashboard** | Angular UI with metric cards, sortable/filterable table, and detail modal |
| 👤 **User Management** | CRUD operations for users, all actions logged |
| 🔄 **Auto Admin Seeding** | Admin account auto-created on first server startup |
| 🐳 **Full Docker Stack** | MongoDB + Node API + Angular/Nginx all in containers |
| ✅ **61 Unit Tests** | Full Karma/Jasmine test suite for all Angular components and services |

---

## 🧰 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | REST API server framework |
| **MongoDB + Mongoose** | NoSQL database + ODM for data modeling |
| **JWT (jsonwebtoken)** | Stateless authentication tokens |
| **Passport.js** | Authentication middleware strategy |
| **Joi** | Request body and query parameter validation |
| **Winston + Morgan** | Structured logging |
| **Helmet** | Security HTTP headers |
| **CORS** | Cross-Origin request support |
| **bcryptjs** | Password hashing |
| **dotenv** | Environment variable management |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Angular 18** | Standalone component architecture |
| **TypeScript** | Type-safe component and service code |
| **RxJS** | Reactive HTTP calls and state management with BehaviorSubject |
| **Angular HttpClient** | API communication |
| **Functional HTTP Interceptor** | Auto-attaches `Authorization: Bearer <token>` to all requests |
| **Karma + Jasmine** | Unit testing framework (61 tests passing) |

### DevOps
| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerizes each service |
| **Docker Compose** | Orchestrates MongoDB + API + Angular/Nginx |
| **Nginx** | Serves the Angular production build inside Docker |
| **Multi-stage Docker build** | Node compiles Angular → Nginx serves the static files |

---

## 📁 Project Structure

```
fullstack-security-audit/
│
├── src/                          ← Backend (Node.js + Express)
│   ├── app.js                    # Express setup, middleware, root route
│   ├── index.js                  # Server entry, DB connect, admin seeding
│   ├── config/                   # Roles, tokens, passport, morgan config
│   ├── controllers/              # auth, user, auditLog controllers
│   ├── middlewares/              # JWT auth, error handler, rate limiter
│   ├── models/                   # Mongoose schemas: User, Token, AuditLog
│   ├── routes/v1/                # Route definitions (auth, user, auditLog)
│   ├── services/                 # Business logic: auth, user, auditLog
│   ├── validations/              # Joi schemas for request validation
│   └── utils/                   # ApiError, catchAsync, pick helpers
│
├── frontend/                     ← Frontend (Angular 18 Standalone)
│   ├── src/app/
│   │   ├── components/
│   │   │   ├── login/            # Glassmorphic dark login page + spec
│   │   │   ├── register/         # Registration page + spec
│   │   │   └── dashboard/        # Audit log dashboard + spec
│   │   ├── services/
│   │   │   ├── auth.service.ts   # JWT login/register/logout + spec
│   │   │   └── audit.service.ts  # Fetch paginated audit logs + spec
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts  # Auto-attach Bearer token
│   │   ├── app.routes.ts         # /login, /register, /dashboard
│   │   └── app.config.ts         # HttpClient, Router, interceptor setup
│   ├── Dockerfile                # Multi-stage: Node build → Nginx serve
│   ├── nginx.conf                # SPA routing (all paths → index.html)
│   └── .dockerignore             # Excludes node_modules from build context
│
├── tests/
│   └── integration/
│       ├── auth.test.js          # Auth flow: register, login, logout
│       ├── user.test.js          # User CRUD operations
│       └── auditLog.test.js      # GET /v1/audit-logs with auth & filters
│
├── Dockerfile                    # Backend Docker image
├── docker-compose.yml            # Runs MongoDB + API + Frontend together
├── .env                          # Environment variables
└── package.json                  # Backend dependencies
```

---

## 🚀 How to Run the App

### Prerequisites

- [Node.js v20](https://nodejs.org/) (LTS)
- [Yarn](https://yarnpkg.com/) (`npm install -g yarn`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for MongoDB or full stack)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`) ← optional

---

### Option A: Local Dev (Recommended)

This is the fastest way to get the app running. Uses Docker only for MongoDB.

**Step 1 — Start Docker Desktop**, then start MongoDB:
```powershell
docker-compose up -d mongodb
```

**Step 2 — Start the Backend API** (open a new terminal):
```powershell
# In the project root
yarn dev
# → API running at http://localhost:3000
```

**Step 3 — Start the Frontend** (open another terminal):
```powershell
cd frontend
yarn start
# → UI running at http://localhost:4200
```

**Step 4 — Open the app:**

👉 **http://localhost:4200**

---

### Option B: Full Docker Stack

Runs everything (MongoDB + API + Angular/Nginx) in containers. No local Node.js needed.

**Step 1 — Open Docker Desktop** and wait for "Engine running" in the system tray.

**Step 2 — Build and start all services:**
```powershell
docker-compose up --build -d
```

> ⚠️ First build takes ~5 minutes — it downloads Node.js, installs packages, and compiles Angular.
> Subsequent builds are fast thanks to Docker layer caching.

**Step 3 — Open the app:**

👉 **http://localhost:4200**

**To stop everything:**
```powershell
docker-compose down
```

**To rebuild from scratch (if something seems stuck):**
```powershell
docker-compose down
docker-compose up --build --no-cache -d
```

---

## 🔑 Login Credentials

| Field | Value |
|-------|-------|
| **Email** | `admin@example.com` |
| **Password** | `Password1` |
| **Role** | `admin` |

> These are **auto-seeded** on first backend startup. You don't need to set anything up manually.

---

## 📡 API Overview

Base URL: `http://localhost:3000/v1`

### Auth Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login and get JWT tokens | No |
| `POST` | `/auth/logout` | Invalidate refresh token | No |
| `POST` | `/auth/refresh-tokens` | Get new access token | No |

### User Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/users` | List all users | Admin |
| `POST` | `/users` | Create a user | Admin |
| `GET` | `/users/:id` | Get user by ID | Admin |
| `PATCH` | `/users/:id` | Update user | Admin |
| `DELETE` | `/users/:id` | Delete user | Admin |

### Audit Log Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/audit-logs` | Get paginated audit logs | Admin |

**Query parameters for `/audit-logs`:**
```
?action=LOGIN_FAILED    # Filter by event type
?status=FAILED          # Filter by outcome
?page=1&limit=10        # Pagination
?sortBy=createdAt:desc  # Sorting
```

**Events automatically logged:**
- `REGISTER_SUCCESS` / `REGISTER_FAILED`
- `LOGIN_SUCCESS` / `LOGIN_FAILED`
- `LOGOUT`
- `USER_CREATE` / `USER_UPDATE` / `USER_DELETE`

---

## ✅ Running Tests

### Angular Unit Tests (Frontend)

```powershell
cd frontend
npx ng test --no-watch --browsers=ChromeHeadless
```

**Result: 61/61 PASSING ✅**

| Test File | # Tests | What's Covered |
|-----------|---------|----------------|
| `app.component.spec.ts` | 3 | Root app, router-outlet rendering |
| `login.component.spec.ts` | 8 | Validation, login success/fail, loading state |
| `register.component.spec.ts` | 11 | Validation, password rules, register flow |
| `dashboard.component.spec.ts` | 19 | Auth guard, pagination, modal, 401/403 redirect |
| `auth.service.spec.ts` | 12 | HTTP calls, localStorage session, token getter |
| `audit.service.spec.ts` | 8 | HTTP GET, query params, paginated response |

### Backend Integration Tests

```powershell
# In project root (requires MongoDB running)
yarn test
```

Tests cover: auth flow, user CRUD, audit log API with filtering and pagination.

---

## ⚙️ Environment Variables

The `.env` file in the project root controls all configuration:

```env
# Server
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URL=mongodb://127.0.0.1:27017/security-audit

# JWT
JWT_SECRET=your-secret-key-here
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30

# Email (optional — for password reset)
SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=
EMAIL_FROM=
```

> The app works without email configured — it just logs a warning on startup.

---

## 🐳 Docker Deep Dive

### How Docker Compose works in this project

```
docker-compose.yml
│
├── mongodb          ← Official MongoDB image, data stored in named volume
├── node-app         ← Built from ./Dockerfile (backend API)
└── frontend         ← Built from ./frontend/Dockerfile (Angular → Nginx)
```

### Backend Dockerfile explained

```dockerfile
FROM node:alpine              # Lightweight Linux + Node.js base
RUN npm install -g yarn       # Install yarn (not bundled in newer Node images)
WORKDIR /usr/src/node-app
COPY package.json yarn.lock ./
USER node                     # Run as non-root for security
RUN yarn install --pure-lockfile   # Install exact versions from lockfile
COPY --chown=node:node . .    # Copy source code
EXPOSE 3000
CMD ["node", "src/index.js"]  # Start the API server
```

### Frontend Dockerfile explained (Multi-stage Build)

```dockerfile
# ── Stage 1: Build ──────────────────────────────
FROM node:20-alpine AS build  # Node 20 required by Angular 18
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install              # Install Angular + dependencies
COPY . .
RUN yarn run build --configuration production  # Compile TypeScript → JS bundles

# ── Stage 2: Serve ──────────────────────────────
FROM nginx:alpine             # Tiny Nginx web server
COPY nginx.conf /etc/nginx/conf.d/default.conf  # SPA routing config
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html  # Copy built files
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Why multi-stage?** The final image only contains Nginx + compiled JS/HTML/CSS (~30MB). All Node.js build tools (~500MB) are discarded. This makes the production container tiny and secure.

### What is `frontend/.dockerignore`?

Without `.dockerignore`, Docker was copying the entire `node_modules` folder (473MB!) into the build context every time. With it, only source files (~5MB) are sent:

```
node_modules    ← skip 473MB of packages
dist            ← skip old build output
.angular        ← skip Angular build cache
*.log
.git
```

---

## 📊 What the Dashboard Shows

When you log in as admin, you see:

1. **Summary Cards** — Total audit events, Successes, Failures, Failed Login Alerts
2. **Audit Log Table** — All security events with action, user, IP, status, timestamp
3. **Filters** — Filter by action type (LOGIN_FAILED, REGISTER_SUCCESS, etc.) or status
4. **Pagination** — Navigate through large log datasets
5. **Detail Modal** — Click any row to see full event details including raw JSON metadata

---

## 🏆 Project Score: 95/100

| Area | Status |
|------|--------|
| Backend API (Auth + Audit Engine) | ✅ Complete |
| Frontend Angular UI (3 views) | ✅ Complete |
| JWT + Role-based Auth | ✅ Complete |
| Docker Compose (All 3 services) | ✅ Complete |
| Angular Unit Tests (61/61) | ✅ Complete |
| GitHub Push | ⏳ Pending |
| CI/CD Pipeline | ⏳ Pending |

---

## 🙌 Acknowledgments

* **[node-express-boilerplate](https://github.com/hagopj13/node-express-boilerplate)** by hagopj13 — Provided the initial REST API scaffolding and environment configuration, which was then heavily extended to build the custom security audit engine and integrated with the Angular frontend.

---

## 📝 License

MIT
