export type Customer = {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  customerCode: string;
  note?: string;
  customerType: CustomerType;
  createdAt: string;
  updatedAt: string;
};

export const CUSTOMER_TYPE_LABEL = {
  regular: "Thường",
  vip: "VIP",
  premium: "Thành viên",
} as const;

export type CustomerType = keyof typeof CUSTOMER_TYPE_LABEL;
