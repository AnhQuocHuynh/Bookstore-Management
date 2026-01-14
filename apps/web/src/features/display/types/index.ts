export interface DisplayShelf {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface DisplayProduct {
    id: string;
    quantity: number;
    displayOrder?: number;
    status: 'active' | 'inactive';
    displayShelf: DisplayShelf;
    product: {
        id: string;
        name: string;
        sku: string;
        price: number;
        imageUrl?: string;
        type: 'book' | 'stationery';
        isActive: boolean;
        // Bổ sung thêm thông tin book để hiển thị tác giả nếu cần
        book?: {
            author?: string;
        };
    };
}

export interface DisplayLog {
    id: string;
    action: 'add' | 'remove' | 'adjust' | 'move' | 'return_to_inventory';
    note?: string;
    quantity?: number;
    createdAt: string;
    employee: { id: string; fullName: string };
    shelf?: { id: string; name: string };
    displayProduct?: {
        id: string;
        product: { name: string; sku: string }
    };
}

// DTOs
export interface CreateShelfDto { name: string; description?: string; }
export interface UpdateShelfDto { name?: string; description?: string; }
export interface AddProductToShelfDto { productId: string; displayShelfId: string; quantity: number; displayOrder?: number; }
export interface MoveProductDto { targetShelfId: string; quantity: number; }
export interface ReduceProductDto { quantity: number; }


// --- PRODUCT TYPES FOR SELECTION (Dùng cho Modal thêm hàng) ---
export interface ProductInventory {
    stockQuantity: number;
    availableQuantity: number;
    costPrice: number;
}

export interface ProductForSelection {
    id: string;
    name: string;
    sku: string;
    price: number;
    imageUrl?: string;
    type: 'book' | 'stationery';
    status: 'active' | 'inactive';
    inventory: ProductInventory;
}

export interface ProductListMeta {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

export interface ProductListResponse {
    items: ProductForSelection[];
    meta: ProductListMeta;
}

// Param cho việc tìm sản phẩm TRONG KHO (Modal)
export interface ProductListParams {
    page?: number;
    limit?: number;
    keyword?: string;
    type?: 'book' | 'stationery';
    categoryId?: string;
    status?: 'active' | 'inactive';
}

// --- [MỚI] DISPLAY PRODUCT LIST PARAMS (Dùng cho màn hình danh sách trưng bày) ---
// Đây là phần bạn cần thêm vào để khớp với API Backend mới sửa
export interface DisplayProductListParams {
    productName?: string;      // Thay thế keyword
    displayShelfId?: string;   // Thay thế shelfId
    status?: 'active' | 'inactive';
    sort?: string;             // VD: 'quantity.desc'
    page?: number;
    limit?: number;

    // Các field cũ map sang (nếu cần tương thích ngược ở code cũ, nhưng nên dùng cái mới)
    keyword?: string;
    shelfId?: string;
}