export interface Supplier {
    id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    taxCode?: string;
    contactPerson?: string;
    note?: string;
    status: 'active' | 'inactive';
    supplierCode?: string;
    createdAt: string;
    updatedAt: string;
}

// Dữ liệu dùng cho Table (có thêm key)
export interface SupplierTableRow extends Supplier {
    key: string;
}