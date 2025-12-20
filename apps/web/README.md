# Bookstore Management System - Frontend

Frontend application cho hệ thống quản lý nhà sách, được xây dựng trong môi trường **Turborepo Monorepo**.

## 📋 Tech Stack

### Core Framework

- **React 19** - UI Library
- **Vite 7** - Build tool & Dev server
- **TypeScript 5.9** - Type safety

### UI & Styling

- **Ant Design (Antd) 6** - Component library
- **TailwindCSS 4** - Utility-first CSS framework
- **Tailwind Merge** - Merge Tailwind classes

### State Management & Data Fetching

- **Zustand 5** - Lightweight state management (với persist middleware)
- **TanStack Query (React Query) v5** - Server state management

### Forms & Validation

- **React Hook Form 7** - Form handling
- **Zod 4** - Schema validation
- **@hookform/resolvers** - Zod integration

### Routing & Network

- **React Router DOM v7** - Client-side routing
- **Axios** - HTTP client với interceptors

## 📁 Cấu trúc thư mục

```
apps/web/src/
├── assets/          # Static assets (images, icons)
├── components/      # Shared atomic components (Button, Input wrapper...)
├── config/          # Antd theme config, Env vars
├── hooks/           # Shared custom hooks
├── layouts/         # MainLayout (Sidebar+Header), AuthLayout
├── lib/             # axios.ts, react-query.ts
├── routes/          # App routes, ProtectedRoute
├── stores/          # useAuthStore.ts, useAppStore.ts
├── types/           # Global TypeScript interfaces
├── utils/           # Helper functions
└── features/        # CORE BUSINESS LOGIC (Feature-based structure)
    ├── auth/        # Login, ForgotPassword
    ├── products/    # ProductList, ProductForm
    ├── users/       # EmployeeList
    ├── sales/       # POS Interface
    └── inventory/   # PurchaseOrder

    (Mỗi feature có: components/, hooks/, api/, types/, index.ts)
```

## 🚀 Getting Started

> 📖 **Xem hướng dẫn setup chi tiết**: [SETUP.md](./SETUP.md)

### Prerequisites

- Node.js 18+
- npm hoặc yarn hoặc pnpm

### Quick Start

```bash
# 1. Cài đặt dependencies (từ root monorepo)
npm install

# 2. Chạy backend (từ apps/api)
cd apps/api && npm run start:dev

# 3. Chạy frontend (từ root hoặc apps/web)
npm run dev --filter=web
```

### Installation

```bash
# Cài đặt dependencies (từ root của monorepo)
npm install

# Hoặc từ thư mục apps/web
cd apps/web
npm install
```

### Environment Variables

Tạo file `.env` trong `apps/web/` (chỉ cần cho production):

```env
# Chỉ cần thiết cho production build
# Trong dev mode, Vite proxy sẽ tự động xử lý
VITE_API_URL=http://localhost:3001/api/v1
```

**Lưu ý về Proxy trong Development:**

- Vite đã được cấu hình proxy để tránh lỗi CORS
- Tất cả requests đến `/api` sẽ được proxy đến `http://localhost:3001`
- Backend API có prefix `/api/v1`, Axios baseURL tự động sử dụng `/api/v1` trong dev mode
- Không cần cấu hình `VITE_API_URL` trong dev mode

### Development

```bash
# Chạy dev server
npm run dev

# Hoặc từ root monorepo
npm run dev --filter=web
```

### Build

```bash
npm run build
```

### Type Checking

```bash
npm run check-types
```

## 🔧 Core Configuration

### Axios Setup (`src/lib/axios.ts`)

- **Development**: Sử dụng relative path `/api/v1` để leverage Vite proxy (tránh CORS)
- **Production**: Base URL từ `import.meta.env.VITE_API_URL` (mặc định: `http://localhost:3001/api/v1`)
- Request interceptor: Tự động attach Bearer token từ localStorage (`auth-storage`)
- Response interceptor: Xử lý 401 errors (clear storage & redirect to `/auth/login`)

### Vite Proxy Setup (`vite.config.ts`)

- Proxy `/api` requests đến `http://localhost:3001`
- Tự động xử lý CORS trong development mode
- Port: 5173 (frontend), 3001 (backend)

### React Query Setup (`src/lib/react-query.ts`)

- QueryClient với default options
- Stale time: 5 minutes
- Retry logic được cấu hình

### Auth Store (`src/stores/useAuthStore.ts`)

- Zustand store với persist middleware
- Quản lý: `user`, `token`, `currentStore`
- Methods: `setAuth`, `setCurrentStore`, `logout`

### Ant Design Theme (`src/config/antd-theme.ts`)

- Custom theme configuration
- Color scheme và component styling

## 🛣️ Routing

- `/login` - Public route (AuthLayout)
- `/dashboard` - Protected route (MainLayout)
- `/products` - Protected route (MainLayout)
- `/inventory` - Protected route (MainLayout)
- `/staff` - Protected route (MainLayout)
- `/suppliers` - Protected route (MainLayout)

Protected routes được bảo vệ bởi `ProtectedRoute` component, tự động redirect về `/login` nếu chưa authenticated.

## 📝 Development Guidelines

### Feature Development

1. Mỗi feature nằm trong `src/features/[feature-name]/`
2. Mỗi feature có cấu trúc:
   - `components/` - Feature-specific components
   - `hooks/` - Custom hooks cho feature
   - `api/` - API calls sử dụng axios instance
   - `types/` - TypeScript types cho feature
   - `index.ts` - Export barrel file

### Code Style

- Sử dụng TypeScript cho tất cả files
- Follow React best practices
- Sử dụng Ant Design components khi có thể
- Combine TailwindCSS với Ant Design styling

### State Management

- **Server state**: Sử dụng TanStack Query
- **Client state**: Sử dụng Zustand
- **Form state**: Sử dụng React Hook Form

## 🔗 Monorepo Integration

Dự án này là một phần của Turborepo monorepo:

- Backend API: `apps/api` (NestJS)
- Frontend Web: `apps/web` (React + Vite)

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Ant Design Documentation](https://ant.design)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [React Router Documentation](https://reactrouter.com)
