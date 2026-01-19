import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// JSON types cho từng section
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
  morningShiftStart?: string;
  morningShiftEnd?: string;
  afternoonShiftStart?: string;
  afternoonShiftEnd?: string;
  eveningShiftStart?: string;
  eveningShiftEnd?: string;
}

export interface InventorySettings {
  lowStockThreshold?: number;
  autoReorder?: boolean;
  enableEmailAlert?: boolean;
}

@Entity('store_settings')
export class StoreSettings {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ type: 'jsonb', default: {} })
  general: GeneralSettings;

  @Column({ type: 'jsonb', default: {} })
  pos: PosSettings;

  @Column({ type: 'jsonb', default: {} })
  hr: HrSettings;

  @Column({ type: 'jsonb', default: {} })
  inventory: InventorySettings;

  @CreateDateColumn({ type: 'timestamp' })
  readonly createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  readonly updatedAt: Date;
}
