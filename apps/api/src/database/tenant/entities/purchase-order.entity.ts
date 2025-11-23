import { PurchaseStatus } from '@/common/enums';
import { DecimalTransformer } from '@/common/transformers';
import {
  Employee,
  PurchaseOrderDetail,
  Supplier,
} from '@/database/tenant/entities';
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

@Entity()
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.purchaseOrders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'supplier_id',
  })
  supplier: Supplier;

  @ManyToOne(() => Employee, (employee) => employee.purchaseOrders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'employee_id',
  })
  employee: Employee;

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

  @OneToMany(() => PurchaseOrderDetail, (pod) => pod.purchaseOrder, {
    cascade: true,
  })
  details: PurchaseOrderDetail[];

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;
}
