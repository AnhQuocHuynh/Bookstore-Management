# 🚀 Hướng dẫn Setup Frontend - Bookstore Management

Hướng dẫn chi tiết để setup môi trường development cho Frontend team.

## 📋 Yêu cầu hệ thống

- **Node.js**: >= 18.x
- **npm**: >= 9.x (hoặc yarn/pnpm)
- **Git**: Để clone repository

## 🔧 Bước 1: Clone và cài đặt dependencies

```bash
# Từ root của monorepo
npm install

# Hoặc nếu chỉ làm việc với frontend
cd apps/web
npm install
```

## 🔧 Bước 2: Kiểm tra cấu hình

### Kiểm tra các file cấu hình đã có:
- ✅ `vite.config.ts` - Vite config với proxy setup
- ✅ `tailwind.config.js` - TailwindCSS config
- ✅ `postcss.config.js` - PostCSS config
- ✅ `tsconfig.json` - TypeScript config
- ✅ `package.json` - Dependencies đã được cài đặt

### Environment Variables (Tùy chọn)

**Lưu ý**: Trong development mode, **KHÔNG CẦN** tạo file `.env` vì Vite proxy đã được cấu hình.

Chỉ cần tạo `.env` nếu:
- Build cho production
- Cần override API URL
- Cần cấu hình khác

Nếu cần, tạo file `.env` trong `apps/web/`:

```env
VITE_API_URL=http://localhost:3000/api
```

## 🔧 Bước 3: Chạy Backend (NestJS)

**Quan trọng**: Backend phải chạy trước để frontend có thể kết nối.

```bash
# Từ root monorepo
cd apps/api
npm run start:dev

# Backend sẽ chạy trên http://localhost:3000
```

## 🔧 Bước 4: Chạy Frontend

```bash
# Từ root monorepo
npm run dev --filter=web

# Hoặc từ thư mục apps/web
cd apps/web
npm run dev
```

Frontend sẽ chạy trên: **http://localhost:5173**

## ✅ Kiểm tra setup thành công

1. ✅ Frontend dev server chạy trên `http://localhost:5173`
2. ✅ Backend API chạy trên `http://localhost:3000`
3. ✅ Mở browser và truy cập `http://localhost:5173`
4. ✅ Không có lỗi CORS trong console
5. ✅ Có thể thấy layout với sidebar và header

## 🔍 Troubleshooting

### Lỗi CORS
- **Nguyên nhân**: Backend chưa chạy hoặc proxy chưa hoạt động
- **Giải pháp**: 
  - Đảm bảo backend đang chạy trên port 3000
  - Kiểm tra `vite.config.ts` có cấu hình proxy đúng
  - Restart dev server

### Port đã được sử dụng
- **Lỗi**: `Port 5173 is already in use`
- **Giải pháp**: 
  - Đổi port trong `vite.config.ts`: `port: 5174`
  - Hoặc kill process đang dùng port 5173

### Dependencies chưa được cài
- **Lỗi**: `Cannot find module 'xxx'`
- **Giải pháp**: 
  ```bash
  npm install
  ```

### TypeScript errors
- **Lỗi**: Type errors trong IDE
- **Giải pháp**: 
  ```bash
  npm run check-types
  ```

## 📁 Cấu trúc thư mục làm việc

```
apps/web/src/
├── features/          # ⭐ BẮT ĐẦU CODE TẠI ĐÂY
│   ├── auth/          # Feature: Authentication
│   ├── products/      # Feature: Products Management
│   ├── users/         # Feature: User Management
│   ├── sales/         # Feature: Sales/POS
│   └── inventory/      # Feature: Inventory
├── components/         # Shared components
├── hooks/             # Shared hooks
├── layouts/           # Layout components (đã có sẵn)
├── lib/               # Core libs (axios, react-query)
├── stores/            # Zustand stores (đã có sẵn)
└── utils/             # Utility functions
```

## 🎯 Bắt đầu phát triển Feature

### Ví dụ: Tạo feature mới

1. **Tạo cấu trúc thư mục**:
```bash
mkdir -p src/features/products/components
mkdir -p src/features/products/hooks
mkdir -p src/features/products/api
mkdir -p src/features/products/types
```

2. **Tạo API service** (`src/features/products/api/products.ts`):
```typescript
import { apiClient } from "@/lib/axios";

export const productsApi = {
  getAll: () => apiClient.get("/products"),
  getById: (id: string) => apiClient.get(`/products/${id}`),
  create: (data: any) => apiClient.post("/products", data),
};
```

3. **Tạo React Query hook** (`src/features/products/hooks/useProducts.ts`):
```typescript
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getAll(),
  });
};
```

4. **Tạo component** (`src/features/products/components/ProductList.tsx`):
```typescript
import { useProducts } from "../hooks/useProducts";

export const ProductList = () => {
  const { data, isLoading } = useProducts();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Render products */}</div>;
};
```

5. **Export từ index** (`src/features/products/index.ts`):
```typescript
export { ProductList } from "./components/ProductList";
export { useProducts } from "./hooks/useProducts";
```

## 📚 Tài liệu tham khảo

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Ant Design Components](https://ant.design/components/overview)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

## 🆘 Cần hỗ trợ?

- Kiểm tra `README.md` để biết thêm chi tiết về tech stack
- Liên hệ team lead nếu gặp vấn đề setup

---

**Chúc bạn code vui vẻ! 🎉**

