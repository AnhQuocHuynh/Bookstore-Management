export type AuthorStatus = 'active' | 'retired' | 'deceased';

export interface Author {
    id: string;
    fullName: string;
    penName?: string;
    email?: string;
    phone?: string;
    nationality?: string;
    bio?: string;
    status: AuthorStatus;
    createdAt: string;
    updatedAt: string;
}

export interface AuthorTableRow extends Author {
    key: string;
}

export interface AuthorFormData {
    fullName: string;
    penName?: string;
    email?: string;
    phone?: string;
    nationality?: string;
    bio?: string;
    status?: AuthorStatus;
}