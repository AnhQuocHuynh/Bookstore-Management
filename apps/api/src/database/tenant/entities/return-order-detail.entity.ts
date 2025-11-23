import {
  ReturnExchangeDetailStatus,
  ReturnExchangeDetailType,
} from '@/common/enums';
import { DecimalTransformer } from '@/common/transformers';
import { Product } from '@/database/tenant/entities/product.entity';
import { ReturnOrder } from '@/database/tenant/entities/return-order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ReturnOrderDetail {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({
    type: 'enum',
    enum: ReturnExchangeDetailType,
  })
  type: ReturnExchangeDetailType;

  @ManyToOne(() => Product, (product) => product.returnOrderDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'new_product_id',
  })
  newProduct?: Product;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: DecimalTransformer,
  })
  refundAmount: number;

  @Column({
    type: 'enum',
    enum: ReturnExchangeDetailStatus,
    default: ReturnExchangeDetailStatus.PENDING,
  })
  status: ReturnExchangeDetailStatus;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  @ManyToOne(() => ReturnOrder, (ro) => ro.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'return_order_id',
  })
  returnOrder: ReturnOrder;
}
