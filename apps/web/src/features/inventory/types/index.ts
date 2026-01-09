export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  imageUrl?: string;
  description?: string;
  price: number; // Giá bán
  type: string;
  isActive: boolean;
  supplier?: {
    id: string;
    name: string;
  };
  inventory?: {
    stockQuantity: number;
    availableQuantity: number;
    costPrice: number; // Giá vốn
  };
  categories?: Array<{
    id: string;
    name: string;
  }>;
  book?: {
    author?: string;
    publisher?: string;
    publicationYear?: number;
    releaseVersion?: string;
    language?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

// Interface dùng riêng cho Table để tránh lỗi truy cập property không tồn tại
export interface InventoryTableRow {
  key: string;
  id: string;
  sku: string;
  name: string;
  image: string;

  // Các trường đã được làm phẳng (flat)
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
  stock: number;

  category: string;
  supplier: string;
  description: string;

  // Thông tin sách
  author?: string;
  publisher?: string;
  releaseYear?: number;
  releaseVersion?: string;
  language?: string;

  createdDate: string;
  updateDate: string;
}

export interface InventoryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  sku?: string;
  type?: string;
  categoryName?: string; // Lọc theo tên danh mục
  supplierName?: string; // Lọc theo tên NCC
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

// Dùng cho form thêm/sửa (nếu cần)
export interface InventoryFormData {
  sku: string;
  name: string;
  image?: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  category: string;
  supplier: string;
  description: string;
  author?: string;
  publisher?: string;
  releaseYear?: string;
  releaseVersion?: string;
  language?: string;
}