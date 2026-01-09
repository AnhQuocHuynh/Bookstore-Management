// src/features/inventory/types/index.ts

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  image?: string; // Backend trả về imageUrl? Cần check lại mapping
  description?: string;
  price: number; // Giá bán
  type: 'book' | 'stationery' | 'other';
  isActive: boolean;

  // Quan hệ
  supplier?: {
    id: string;
    name: string;
  };
  inventory?: {
    stockQuantity: number;
    availableQuantity: number;
    costPrice: number; // Giá nhập
  };
  categories?: Array<{
    id: string;
    name: string;
  }>;

  // Các trường bổ sung cho sách (nếu có)
  book?: {
    author?: string;
    publisher?: string;
    publicationYear?: number;
  } | null;

  createdAt: string;
  updatedAt: string;

  // Trường dùng cho UI Table (sẽ map dữ liệu vào đây)
  key?: string | number;
}

// CẬP NHẬT INTERFACE NÀY
export interface InventoryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  sku?: string;
  type?: string;

  // Thêm các dòng này vào:
  categoryName?: string; // <-- Quan trọng: Sửa lỗi "categoryName does not exist"
  supplierName?: string; // <-- Thêm luôn để lọc nhà cung cấp

  categoryId?: string;   // Có thể giữ hoặc bỏ nếu API không dùng
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}