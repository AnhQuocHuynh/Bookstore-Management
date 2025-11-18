import { PurchaseStatus } from '@/common/enums';
import { Supplier } from '@/database/tenant/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PurchaseDetail } from './purchase-detail.entity';
import { DecimalTransformer } from '@/common/transformers';

@Entity()
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.purchases, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'supplier_id',
  })
  supplier: Supplier;

  @Column({
    type: 'uuid',
  })
  managerId: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: DecimalTransformer,
  })
  totalAmount: number;

  @Column({ type: 'timestamp', nullable: true })
  purchaseDate?: Date;

  @Column({
    type: 'enum',
    enum: PurchaseStatus,
    default: PurchaseStatus.PENDING,
  })
  status: PurchaseStatus;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @OneToMany(() => PurchaseDetail, (detail) => detail.purchase, {
    cascade: true,
  })
  details: PurchaseDetail[];

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;
}
