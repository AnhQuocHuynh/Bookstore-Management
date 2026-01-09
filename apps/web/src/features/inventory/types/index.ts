export interface InventoryItem {
  key: number;
  id?: string;
  sku: string; // Mã Sản Phẩm
  image?: string; // Hình Ảnh
  name: string; // Tên Sản Phẩm
  purchasePrice: number; // Giá nhập
  sellingPrice: number; // Giá Bán
  profit: number; // Lợi nhuận
  stock: number; // Tồn Kho
  category: string; // Danh mục (văn phòng phẩm/sách)
  supplier?: string; // Nhà Cung Cấp
  description?: string; // Mô Tả
  // Book-specific fields
  author?: string; // Tác Giả
  publisher?: string; // Nhà Xuất Bản
  releaseYear?: string; // Năm Xuất
  releaseVersion?: string; // Phiên Bản Phát Hành
  language?: string; // Ngôn Ngữ
  createdDate?: string;
  updateDate?: string;
}

export type InventoryCategory = "Văn phòng phẩm" | "Sách";

export interface InventoryFormData {
  sku: string;
  name: string;
  image?: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  category: InventoryCategory;
  supplier: string;
  description: string;
  // Book-specific fields
  author?: string;
  publisher?: string;
  releaseYear?: string;
  releaseVersion?: string;
  language?: string;
}
