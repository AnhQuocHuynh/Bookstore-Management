export type CustomerType = 'regular' | 'vip' | 'premium';

export interface Customer {
    id: string;
    customerCode: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    customerType: CustomerType;
    note: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CustomerTableRow extends Customer {
    key: string;
}

export interface CustomerFormData {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    note?: string;
    // customerCode và customerType do backend tự xử lý
}