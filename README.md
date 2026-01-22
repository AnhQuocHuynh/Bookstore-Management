# Bookstore Management System

This is a monorepo for the Bookstore Management System, built using [Turborepo](https://turborepo.org/).

## Project Structure

This project assumes a standard Turborepo structure:
- `apps/`
  - `api`: NestJS Backend API
  - `web`: React/Vite Frontend
- `packages/`: Shared packages

## Prerequisites

- [Node.js](https://nodejs.org/) (>= 18)
- [npm](https://www.npmjs.com/) (or yarn/pnpm)
- [PostgreSQL](https://www.postgresql.org/) (>= 12)
- [Redis](https://redis.io/) (for BullMQ job queue)

## Getting Started

### 1. Install Dependencies

Run the following command at the root of the project to install all dependencies for apps and packages:

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database for the project:

```bash
# Using psql
createdb bookstore

# Or using SQL
psql -U postgres
CREATE DATABASE bookstore;
```

Make sure PostgreSQL is running and accessible on `localhost:5432` (or update the connection details in `.env`).

### 3. Redis Setup

Start Redis server (required for BullMQ):

```bash
# Using Docker
docker run -d -p 6379:6379 redis

# Or using local installation
redis-server
```

### 4. Environment Setup

You need to set up environment variables for both the API and Web applications.

**API (`apps/api`):**

Copy the example environment file:
```bash
cp apps/api/.env.example apps/api/.env
```
Then edit `apps/api/.env` with your actual database and configuration details:
- Update `DATABASE_*` variables to match your PostgreSQL setup
- Update `JWT_SECRET` and `JWT_REFRESH_SECRET` with secure random strings
- Update `BULLMQ_CONNECTION_URL` if Redis is not on `localhost:6379`
- Configure `MAILER_*` variables if you need email functionality
- Configure `CLOUDINARY_*` variables if you need image upload functionality

**Web (`apps/web`):**

Copy the example environment file:
```bash
cp apps/web/.env.example apps/web/.env
```
Usually, the default settings in `.env.example` are sufficient for local development if your API is running on port 3001.

### 5. Database Migrations

Run database migrations to set up the schema:

```bash
cd apps/api
npm run migration:run
```

### 6. Seed Data (Optional)

Seed the database with initial data:

```bash
cd apps/api
npm run db:seed
```

### 7. Running the Project

To start both the backend and frontend in development mode, run:

```bash
npm run dev
```

This uses `turbo run dev` to launch all apps in parallel.
- **Frontend**: http://localhost:5173 (or as indicated in terminal)
- **Backend**: http://localhost:3001

### Other Commands

**From root:**
- `npm run build`: Build all apps and packages.
- `npm run lint`: Lint all code.
- `npm run format`: Format code with Prettier.

**From `apps/api`:**
- `npm run migration:run`: Run database migrations.
- `npm run migration:generate`: Generate a new migration.
- `npm run migration:revert`: Revert the last migration.
- `npm run db:seed`: Seed the database with initial data.

## Technologies

- **Backend**: NestJS, TypeORM, PostgreSQL, BullMQ, Redis
- **Frontend**: React, Vite, TailwindCSS, ShadcnUI (based on typical deps)
- **Monorepo**: Turborepo
