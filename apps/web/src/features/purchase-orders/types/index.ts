export type ProductType = 'book' | 'stationery';

// Form data cho 1 dòng nhập hàng (Dùng trong Modal thêm sản phẩm)
export interface PurchaseOrderItemForm {
    // Thông tin cơ bản
    name: string;
    sku: string;
    price: number; // Giá bán
    imageUrl?: string;
    type: ProductType;
    categoryIds: string[];
    taxRate?: number;
    description?: string;

    // Thông tin nhập kho
    quantity: number;
    unitPrice: number; // Giá vốn nhập vào

    // Thông tin sách (Optional)
    isbn?: string;
    authorId?: string;
    publisherId?: string;
    publicationDate?: string; // YYYY-MM-DD
    edition?: string;
    language?: string;
}

// Payload gửi lên API
export interface CreatePurchaseOrderDto {
    supplierId: string;
    note?: string;
    createPurchaseOrderDetailDtos: {
        quantity: number;
        unitPrice: number;
        createProductDto: {
            name: string;
            sku: string;
            price: number;
            imageUrl?: string;
            type: ProductType;
            categoryIds: string[];
            taxRate?: number;
            description?: string;
            createInventoryDto: {
                stockQuantity: number;
                costPrice: number;
            };
            createBookDto?: {
                isbn: string;
                authorId: string;
                publisherId: string;
                publicationDate?: string;
                edition?: string;
                language?: string;
            };
        };
    }[];
}

export type PurchaseOrderStatus =
    | 'draft'
    | 'pending_approval'
    | 'approved'
    | 'sent_to_supplier'
    | 'received'
    | 'completed'
    | 'cancelled';

export interface PurchaseOrderListParams {
    employeeId?: string;
    employeeName?: string;
    status?: PurchaseOrderStatus;
}

// Dữ liệu hiển thị ở Bảng danh sách (Gọn nhẹ)
export interface PurchaseOrderListItem {
    id: string;
    totalAmount: number;
    purchaseDate: string | null;
    status: PurchaseOrderStatus;
    note: string;
    createdAt: string;
    updatedAt: string;
    employee: {
        id: string;
        fullName: string;
        username?: string;
        role?: string;
    };
    // Lưu ý: List API không trả về supplier
}

// Dữ liệu chi tiết (Đầy đủ)
export interface PurchaseOrderDetailItem {
    id: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
    product: {
        id: string;
        sku: string;
        name: string;
        imageUrl?: string;
        price: number;
        type: string;
    };
}

export interface PurchaseOrderDetail extends PurchaseOrderListItem {
    supplier: {
        id: string;
        name: string;
        email: string;
        phoneNumber: string;
        address: string;
        status: string;
    };
    details: PurchaseOrderDetailItem[];
}