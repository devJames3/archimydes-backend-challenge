# Archimydes Backend Challenge

This is the backend challenge solution for Archimydes.  
It is a Node.js + Express REST API with TypeScript, Prisma ORM (SQLite), JWT authentication, role-based access control, validation with Zod, and Jest testing.

---

## Assumptions

- **Role Management**

  - Three roles exist: `USER`, `ADMIN`, and `SUPER_ADMIN`.
  - Normal users can only view/update/delete their own profiles.
  - Admins and Super Admins can manage any user account.
  - Only Super Admins can delete Admins.

- **Authentication**

  - JWT is used for authentication; tokens expire after **1 hour**.
  - All `/users` routes are protected by the `authenticate` middleware.
  - Register route (`/auth/register`) only creates `USER` role accounts.

- **Database**

  - Two separate SQLite databases are used:
    - `dev.db` → for development.
    - `dev-test.db` → for testing (loaded via `.env.test`).
  - Databases are excluded from GitHub (`.gitignore`).

- **Environment Variables**

  - `.env` → for development.
  - `.env.test` → for test environment.
  - These must be manually created before running the app.

- **Validation**
  - Request bodies are validated with `zod` schemas via the `validate` middleware.

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

```bash
npm run dev
```

The server will run at http://`localhost:<PORT>`, default 3000.

### Running Tests

Tests run on the dev-test.db SQLite database configured in .env.test.

Run tests with:

```bash
npm test
```

This runs Jest with the test environment loaded from `.env.test`.

### API Routes

#### Auth routes (`/auth`)

POST `/auth/register`
Register a new user with role `user` only.

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Success response (201):

```json
{
  "success": true,
  "data": {
    "token": "<jwt_token>"
  }
}
```

Error (400 - email exists):

```json
{
  "success": false,
  "error": {
    "message": "Email already in use"
  }
}
```

POST `/auth/login`
Login existing user.

Request body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "token": "<jwt_token>"
  }
}
```

Error (401):

```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials"
  }
}
```

#### User routes (`/users`)

All `/users` routes require Authorization header with `Bearer <token>`.

Use the token obtained from `/auth/login `or `/auth/register`.

GET `/users`
List all users visible to the requester based on their role.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    ...
  ]
}
```

GET `/users/:id`
Get user by ID.

```
Users can get their own profile; Admins can get any user profile, Super Admins can get any admin and user profile
```

PUT `/users/:id`
Update user by ID.

Validated fields: `name`, `email`, `password`, `role` (role change restricted to super admins).

Request body example:

```json
{
  "name": "John Updated",
  "email": "newemail@example.com",
  "password": "newpass123",
  "role": "admin"
}
```

Response on success:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "newemail@example.com",
    "role": "admin"
  }
}
```

DELETE `/users/:id`
Delete user by ID.

Users can delete themselves; Admins and Super Admins can delete according to role rules.

#### Important Notes

- Role-based access control is enforced on all protected routes.

- Passwords are securely hashed with bcrypt.

- Errors follow a uniform response format for easy frontend integration.

- Database files (dev.db and dev-test.db) are not pushed to GitHub.

- Run migrations to create and update your database schema.

**Todo**

- adding Swagger information

### License

MIT
