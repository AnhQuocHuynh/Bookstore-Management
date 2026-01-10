export interface Publisher {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    description?: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface PublisherTableRow extends Publisher {
    key: string;
}

export interface PublisherFormData {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    description?: string;
}