import { DecimalTransformer } from '@/common/transformers';
import { Product, PurchaseOrder } from '@/database/tenant/entities';
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
export class PurchaseOrderDetail {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'purchase_order_id',
  })
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => Product, (product) => product.purchaseOrderDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'product_id',
  })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: DecimalTransformer,
  })
  unitPrice: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: DecimalTransformer,
  })
  subTotal: number;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;
}
