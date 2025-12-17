# Next-Nest-Auth

A full-stack authentication system built with modern technologies featuring type-safe APIs and secure JWT authentication.

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | TurboRepo + pnpm |
| **Frontend** | Next.js 15, React 19, tRPC Client |
| **Backend** | NestJS, tRPC Server |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT + bcrypt |
| **Validation** | Zod (shared schemas) |
| **Testing** | Jest |
| **Container** | Docker + Docker Compose |

## ✨ Features

- ✅ User signup with password hashing (bcrypt)
- ✅ User signin with JWT token generation
- ✅ Rate limiting (3 failed attempts = 5 minute lockout)
- ✅ Type-safe API with tRPC
- ✅ Shared validation schemas between frontend and backend
- ✅ Unit tests for authentication service
- ✅ Docker support for production deployment

## 📁 Project Structure

```
next-nest-auth/
├── apps/
│   ├── backend/          # NestJS + tRPC Server
│   │   ├── prisma/       # Database schema
│   │   └── src/
│   │       ├── auth/     # Authentication module
│   │       ├── prisma/   # Database service
│   │       └── trpc/     # tRPC router
│   └── web/              # Next.js + tRPC Client
│       └── src/
│           ├── app/      # Pages (signin, signup, dashboard)
│           ├── components/
│           └── lib/      # tRPC client
└── packages/
    └── shared/           # Shared types and schemas
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- Docker (for PostgreSQL)

### Installation

```bash
# Clone the repository
git clone https://github.com/ihaichao/next-nest-auth.git
cd next-nest-auth

# Install dependencies
pnpm install

# Start PostgreSQL
docker run -d --name postgres-auth \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=auth_db \
  -p 5432:5432 \
  postgres:16

# Setup backend
cd apps/backend
cp .env.example .env
pnpm db:generate
pnpm db:push

# Build shared package
cd ../../packages/shared
pnpm build
```

### Development

```bash
# From root directory - run all apps
pnpm dev

# Or run individually:
# Terminal 1 - Backend
cd apps/backend && pnpm dev

# Terminal 2 - Frontend
cd apps/web && pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- tRPC Endpoint: http://localhost:4000/trpc

### Testing

```bash
# Run all tests
pnpm test

# Run backend tests only
cd apps/backend && pnpm test
```

## 🐳 Docker Deployment

```bash
# Copy environment file
cp .env.example .env

# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📝 API Endpoints

| Procedure | Description | Input |
|-----------|-------------|-------|
| `auth.signup` | Create new user | `{ username, password }` |
| `auth.signin` | Login user | `{ username, password }` |

### Example Request (curl)

```bash
# Signup
curl -X POST http://localhost:4000/trpc/auth.signup \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo1234"}'

# Signin
curl -X POST http://localhost:4000/trpc/auth.signin \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo1234"}'
```

## 🔐 Security Features

1. **Password Hashing**: bcrypt with salt rounds = 10
2. **JWT Tokens**: 24h expiration (configurable)
3. **Rate Limiting**: 3 failed attempts → 5 minute lockout
4. **Input Validation**: Zod schemas shared between frontend/backend

## 📄 License

MIT
