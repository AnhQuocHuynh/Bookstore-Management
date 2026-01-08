// src/features/sales/types/sales.types.ts

export interface ProductDetail {
    id: string;
    sku: string;
    name: string;
    imageUrl: string;
    unit: string;
}

export interface TransactionDetail {
    id: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
    productName: string;
    product: ProductDetail;
    note?: string; // Giả sử có thể có ghi chú trong chi tiết
}

export interface Cashier {
    id: string;
    fullName: string;
    employeeCode: string;
}

export interface Transaction {
    id: string;
    cashier: Cashier;
    details: TransactionDetail[];
    totalAmount: number;     // Tổng tiền hàng
    discountAmount: number;  // Tổng giảm giá
    taxAmount: number;
    finalAmount: number;     // Khách cần trả
    paymentMethod: string | null; // "bank_transfer", "cash", v.v.
    note: string;
    isCompleted: boolean;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

// Params để lọc
export interface TransactionParams {
    from?: string;
    to?: string;
}

// Thêm các type mới cho việc tạo transaction
export interface CreateTransactionDetailDto {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateTransactionDto {
    createTransactionDetailDtos: CreateTransactionDetailDto[];
    note?: string;
    paidAmount: number;
    changeAmount: number;
}

export interface TransactionResponse {
    id: string;
    details: any[]; // Bạn có thể định nghĩa chi tiết hơn nếu cần
    totalAmount: number;
    finalAmount: number;
    paidAmount: number;
    changeAmount: number;
    note: string;
    isCompleted: boolean;
    createdAt: string;
}