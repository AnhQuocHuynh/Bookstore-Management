import { ReturnOrderStatus } from '@/common/enums';
import { DecimalTransformer } from '@/common/transformers';
import { ReturnOrderDetail, Transaction } from '@/database/tenant/entities';
import { Customer } from '@/database/tenant/entities/customer.enity';
import { Employee } from '@/database/tenant/entities/employee.entity';
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
export class ReturnOrder {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @ManyToOne(() => Employee, (employee) => employee.returnOrders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'employee_id',
  })
  employee: Employee;

  @ManyToOne(() => Customer, (customer) => customer.returnOrders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'customer_id',
  })
  customer: Customer;

  @ManyToOne(() => Transaction, (transaction) => transaction.returnOrders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'transaction_id',
  })
  transaction: Transaction;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: DecimalTransformer,
  })
  totalRefundAmount: number;

  @Column({
    type: 'enum',
    enum: ReturnOrderStatus,
    default: ReturnOrderStatus.PENDING,
  })
  status: ReturnOrderStatus;

  @OneToMany(() => ReturnOrderDetail, (detail) => detail.returnOrder, {
    cascade: true,
  })
  details: ReturnOrderDetail[];

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;
}
