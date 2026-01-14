export type EmployeeRole = 'ADMIN' | 'STAFF' | 'MANAGER';

export interface Employee {
    id: string;
    email: string;
    username: string;
    isActive: boolean;
    isFirstLogin: boolean;
    role: EmployeeRole;
    fullName: string;
    address: string;
    phoneNumber: string;
    birthDate: string;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeTableRow extends Employee {
    key: string;
}

export interface EmployeeFormData {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    birthDate?: string;
    avatarUrl?: string;
    role?: EmployeeRole;
}

export interface EmployeeListResponse {
    data: Employee[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
