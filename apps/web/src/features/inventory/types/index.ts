export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  imageUrl?: string;
  description?: string;
  price: number;
  type: string;
  isActive: boolean;
  supplier?: {
    id: string;
    name: string;
  };
  inventory?: {
    stockQuantity: number;
    availableQuantity: number;
    costPrice: number;
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

export interface InventoryTableRow {
  key: string;
  id: string;
  sku: string;
  name: string;
  image: string;

  purchasePrice: number;
  sellingPrice: number;
  profit: number;
  stock: number;

  category: string;
  supplier: string;
  description: string;

  // FIX LỖI 2: Thêm trường isActive vào đây
  isActive: boolean;

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
  categoryName?: string;
  supplierName?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface InventoryFormData {
  sku: string;
  name: string;
  image?: string;

  // FIX LỖI 1: Bỏ 'price' (vì form dùng sellingPrice), hoặc để optional
  sellingPrice: number;

  description: string;
  isActive: boolean;

  // Các trường optional khác
  purchasePrice?: number;
  stock?: number;
  category?: string;
  supplier?: string;
  author?: string;
  publisher?: string;
  releaseYear?: string;
  releaseVersion?: string;
  language?: string;
}