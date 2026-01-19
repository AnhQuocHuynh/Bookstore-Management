// Types matching backend entity

export interface GeneralSettings {
  storeName?: string;
  slogan?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  facebook?: string;
}

export interface PosSettings {
  vatRate?: number;
  receiptFooter?: string;
  wifiName?: string;
  wifiPassword?: string;
  enableCash?: boolean;
  enableCard?: boolean;
  enableBankTransfer?: boolean;
  enableMomo?: boolean;
  enableZaloPay?: boolean;
  showLogoOnReceipt?: boolean;
}

export interface HrSettings {
  baseSalary?: number;
  hourlyRate?: number;
  overtimeMultiplier?: number;
  latePenalty?: number;
  standardWorkDays?: number;
}

export interface InventorySettings {
  lowStockThreshold?: number;
  autoReorder?: boolean;
  enableEmailAlert?: boolean;
}

// Full settings object from API
export interface StoreSettings {
  id: string;
  general: GeneralSettings;
  pos: PosSettings;
  hr: HrSettings;
  inventory: InventorySettings;
  createdAt: string;
  updatedAt: string;
}

// DTO for partial updates
export interface UpdateSettingsDto {
  general?: Partial<GeneralSettings>;
  pos?: Partial<PosSettings>;
  hr?: Partial<HrSettings>;
  inventory?: Partial<InventorySettings>;
}
