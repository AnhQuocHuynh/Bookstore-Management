import { OrderStatus, PaymentMethod } from '@/common/enums';
import { ReturnExchangeDetail } from '@/database/tenant/entities';
import { Customer } from '@/database/tenant/entities/customer.enity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { OrderDetail } from './order-detail.entity';
import { DecimalTransformer } from '@/common/transformers';

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

  @OneToMany(() => OrderDetail, (detail) => detail.order, { cascade: true })
  details: OrderDetail[];

  @OneToOne(() => Invoice, (invoice) => invoice.order, {
    cascade: true,
  })
  invoice: Invoice;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: DecimalTransformer,
  })
  totalAmount: number;

  @Column({
    type: 'text',
  })
  shippingAddress: string;

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

  @OneToMany(
    () => ReturnExchangeDetail,
    (returnExchangeDetail) => returnExchangeDetail.order,
    {
      cascade: true,
    },
  )
  returnExchangeDetails: ReturnExchangeDetail[];
}
