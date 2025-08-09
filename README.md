# Archimydes Backend Challenge

This is the backend challenge solution for Archimydes.  
It is a Node.js + Express REST API with TypeScript, Prisma ORM (SQLite), JWT authentication, role-based access control, validation with Zod, and Jest testing.

---

## Tech Stack

- Node.js (ESM) + TypeScript
- Express.js
- Prisma ORM with SQLite
- JWT for authentication
- Zod for input validation
- Jest + Supertest for testing
- Helmet, rate limiting, CORS for security

---

## Setup

### 1. Clone repo

```bash
git clone https://github.com/devJames3/archimydes-backend-challenge.git>
```

### 2. Install dependencies

```bash
cd archimydes-backend-challenge
```

### 3. Environment variables

FIll the `.env.example` and rename to `.env`

```bash
PORT=3000
DATABASE_URL="file:./dev.db"  # For development
JWT_SECRET=your_strong_secret
NODE_ENV=development
SUPER_ADMIN_EMAIL=<Super_admin_email>
SUPER_ADMIN_PASSWORD=<super_admin_pass>
HASH_SALT=<number>
```

You can create `.env.test` similarly for testing environment:

```bash
PORT=3000
DATABASE_URL="file:./dev-test.db"  # For development
JWT_SECRET=your_strong_secret
NODE_ENV=test
SUPER_ADMIN_EMAIL=<Super_admin_email>
SUPER_ADMIN_PASSWORD=<super_admin_pass>
HASH_SALT=<number>
```

Note: The database files `dev.db` and `dev-test.db` are SQLite files and are not committed to git.
You will have to run migrations to create them locally (see below).

### 4. Prisma setup & migrations

Run migrations to create your SQLite DB schema:

```bash
npm run migrate       # runs migrations on dev.db using .env
npm run migrate:test  # runs migrations on dev-test.db using .env.test
```

You can also open Prisma Studio for DB GUI:

```bash
npm run studio       # for dev.db
npm run studio:test  # for dev-test.db
```

### 4. Run the dev server

Run migrations to create your SQLite DB schema:

```bash
npm run dev

```
