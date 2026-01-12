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