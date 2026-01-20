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

## Getting Started

### 1. Install Dependencies

Run the following command at the root of the project to install all dependencies for apps and packages:

```bash
npm install
```

### 2. Environment Setup

You need to set up environment variables for both the API and Web applications.

**API (`apps/api`):**

Copy the example environment file:
```bash
cp apps/api/.env.example apps/api/.env
```
Then edit `apps/api/.env` with your actual database and configuration details.

**Web (`apps/web`):**

Copy the example environment file:
```bash
cp apps/web/.env.example apps/web/.env
```
Usually, the default settings in `.env.example` are sufficient for local development if your API is running on port 3001.

### 3. Running the Project

To start both the backend and frontend in development mode, run:

```bash
npm run dev
```

This uses `turbo run dev` to launch all apps in parallel.
- **Frontend**: http://localhost:5173 (or as indicated in terminal)
- **Backend**: http://localhost:3001

### Other Commands

- `npm run build`: Build all apps and packages.
- `npm run lint`: Lint all code.
- `npm run format`: Format code with Prettier.

## Technologies

- **Backend**: NestJS, TypeORM, PostgreSQL, BullMQ, Redis
- **Frontend**: React, Vite, TailwindCSS, ShadcnUI (based on typical deps)
- **Monorepo**: Turborepo
