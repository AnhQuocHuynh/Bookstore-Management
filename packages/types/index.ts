export interface Transaction {
  id: string;
  totalAmount: number;
  cashierId?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export type LoginRole = "admin" | "owner" | "employee";

const EmployeeRole = {
  STORE_MANAGER: "STORE_MANAGER",
  STAFF: "STAFF",
  CASHIER: "CASHIER",
  INVENTORY: "INVENTORY",
  ACCOUNTANT: "ACCOUNTANT",
} as const;

const UserRole = {
  ADMIN: "ADMIN",
  OWNER: "OWNER",
  EMPLOYEE: "EMPLOYEE",
  CUSTOMER: "CUSTOMER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export type EmployeeRole = (typeof EmployeeRole)[keyof typeof EmployeeRole];
