import { PaymentMethod } from '@/common/enums';
import { DecimalTransformer } from '@/common/transformers';
import {
  Employee,
  ReturnOrder,
  TransactionDetail,
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
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @ManyToOne(() => Employee, (employee) => employee.transactions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'cashier_id',
  })
  cashier: Employee;

  @OneToMany(() => TransactionDetail, (detail) => detail.transaction, {
    cascade: true,
  })
  details: TransactionDetail[];

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: DecimalTransformer,
  })
  totalAmount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: DecimalTransformer,
  })
  discountAmount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: DecimalTransformer,
  })
  taxAmount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: DecimalTransformer,
  })
  finalAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'text',
    nullable: true,
  })
  note?: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;

  @OneToMany(() => ReturnOrder, (ro) => ro.transaction, {
    cascade: true,
  })
  returnOrders: ReturnOrder[];
}
