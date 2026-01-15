// src/features/sales/types/sales.types.ts

// --- Common Types ---
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
    totalPrice: number;
    productName: string;
    product: ProductDetail;
}

export interface Cashier {
    id: string;
    fullName: string;
}

export interface Transaction {
    id: string;
    cashier: Cashier;
    details: TransactionDetail[];
    totalAmount: number;
    taxAmount: number;
    finalAmount: number;
    paymentMethod: string;
    isCompleted: boolean;
    createdAt: string;
}

export interface TransactionParams {
    from?: string;
    to?: string;
}

// --- DTOs cho POS (Create & Calculate) ---

export interface CreateTransactionDetailDto {
    productId: string;
    quantity: number;
    unitPrice?: number; // Optional, nếu không gửi backend tự lấy giá hiện tại
}

// DTO gửi đi để tính toán (Pre-check)
export interface CalculateTransactionDto {
    createTransactionDetailDtos: CreateTransactionDetailDto[];
}

// Kết quả trả về từ API tính toán
export interface CalculationResponse {
    totalAmount: number; // Tổng tiền hàng
    taxAmount: number;   // Tổng thuế
    finalAmount: number; // Khách cần trả
}

// DTO tạo đơn hàng chính thức
export interface CreateTransactionDto {
    createTransactionDetailDtos: CreateTransactionDetailDto[];
    customerId?: string; // ID khách hàng (nếu có)
    totalAmount: number;
    taxAmount: number;
    finalAmount: number;
    paidAmount: number;  // Khách đưa
    changeAmount: number; // Tiền thừa
    paymentMethod: "cash" | "card" | "bank_transfer" | "e_wallet";
    note?: string;
}

export interface TransactionResponse {
    id: string;
    finalAmount: number;
    isCompleted: boolean;
    createdAt: string;
}