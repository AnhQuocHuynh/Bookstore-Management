export interface BookStore {
  id: string;
  code: string;
  name: string;
  address: string;
  phoneNumber: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
