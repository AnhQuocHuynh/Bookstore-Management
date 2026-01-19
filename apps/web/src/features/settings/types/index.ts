// Types cho Settings
export interface BookStoreSettings {
  id: string;
  code: string;
  name: string;
  address: string;
  phoneNumber: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBookStoreDto {
  name?: string;
  phoneNumber?: string;
  address?: string;
  logoUrl?: string;
}

// General Settings Form
export interface GeneralSettingsFormData {
  storeName: string;
  logo?: string;
  contactPhone: string;
  contactEmail?: string;
  address: string;
}

// Sales Settings (local storage for now - can be extended with backend later)
export interface SalesSettingsFormData {
  taxRate: number;
  receiptFooter?: string;
  enableCash: boolean;
  enableCard: boolean;
  enableBankTransfer: boolean;
  enableMomo: boolean;
  enableZaloPay: boolean;
}

// HR Settings (local storage for now - can be extended with backend later)
export interface HRSettingsFormData {
  baseSalary: number;
  morningShiftStart: string;
  morningShiftEnd: string;
  afternoonShiftStart: string;
  afternoonShiftEnd: string;
  eveningShiftStart: string;
  eveningShiftEnd: string;
}

// Security Settings
export interface SecuritySettingsFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
