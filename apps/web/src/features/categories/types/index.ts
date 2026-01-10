export interface Category {
    id: string;
    name: string;
    slug: string;
    taxRate: number; // Ví dụ: 0.1, 0.08
    description?: string;
    status: 'active' | 'inactive';
    parentId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CategoryTableRow extends Category {
    key: string;
}

export interface CategoryFormData {
    name: string;
    slug: string;
    taxRate: number;
    description?: string;
}