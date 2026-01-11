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

export interface SupplierTableRow extends Supplier {
    key: string;
}

// THÊM MỚI: Dữ liệu dùng cho Form Thêm/Sửa
export interface SupplierFormData {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    taxCode?: string;
    contactPerson?: string;
    note?: string;

    status?: 'active' | 'inactive';
}