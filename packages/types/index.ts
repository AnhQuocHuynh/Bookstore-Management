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
