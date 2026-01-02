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