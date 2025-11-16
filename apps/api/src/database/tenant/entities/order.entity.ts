import { OrderStatus, PaymentMethod } from '@/common/enums';
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
import { Invoice } from './invoice.entity';
import { OrderDetail } from './order-detail.entity';
import { Payment } from './payment.entity';
import { ReturnExchangeDetail } from '@/database/tenant/entities';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, (customer) => customer.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'customer_id',
  })
  customer: Customer;

  @ManyToOne(() => Employee, (employee) => employee.orders, {
    onDelete: 'SET NULL',
  })
  employee: Employee;

  @OneToMany(() => OrderDetail, (detail) => detail.order, { cascade: true })
  details: OrderDetail[];

  @OneToMany(() => Invoice, (invoice) => invoice.order, { cascade: true })
  invoices: Invoice[];

  @OneToMany(() => Payment, (payment) => payment.order, { cascade: true })
  payments: Payment[];

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  finalAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ unique: true })
  orderCode: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @OneToMany(
    () => ReturnExchangeDetail,
    (returnExchangeDetail) => returnExchangeDetail.order,
    {
      cascade: true,
    },
  )
  returnExchangeDetails: ReturnExchangeDetail[];
}
