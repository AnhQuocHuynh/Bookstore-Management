import { ProductType } from '@/common/enums';
import { DecimalTransformer } from '@/common/transformers';
import {
  Book,
  Category,
  DisplayProduct,
  Inventory,
  PurchaseOrderDetail,
  ReturnOrderDetail,
  Supplier,
  TransactionDetail,
} from '@/database/tenant/entities';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    unique: true,
  })
  sku: string;

  @Column({
    unique: true,
  })
  name: string;

  @Column({
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: DecimalTransformer,
  })
  price: number;

  @Column({
    type: 'enum',
    enum: ProductType,
  })
  type: ProductType;

  @Column({
    type: 'boolean',
    default: false,
  })
  isActive: boolean;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;

  @ManyToOne(() => Supplier, (supplier) => supplier.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'supplier_id',
  })
  supplier: Supplier;

  @OneToOne(() => Inventory, (inventory) => inventory.product, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'inventory_id',
  })
  inventory: Inventory;

  @ManyToMany(() => Category, (category) => category.products, {
    cascade: true,
  })
  @JoinTable({
    name: 'product_category',
    joinColumn: {
      name: 'product_id',
    },
    inverseJoinColumn: {
      name: 'category_id',
    },
  })
  categories: Category[];

  @OneToOne(() => Book, (book) => book.product, {
    cascade: true,
  })
  book?: Book;

  @OneToMany(() => DisplayProduct, (dp) => dp.product, {
    cascade: true,
  })
  displayProducts: DisplayProduct[];

  @OneToMany(() => PurchaseOrderDetail, (pod) => pod.product, {
    cascade: true,
  })
  purchaseOrderDetails: PurchaseOrderDetail[];

  @OneToMany(() => ReturnOrderDetail, (rod) => rod.newProduct, {
    cascade: true,
  })
  returnOrderDetails: ReturnOrderDetail[];

  @DeleteDateColumn({
    type: 'timestamp',
  })
  readonly deletedAt?: Date;

  @OneToMany(() => TransactionDetail, (td) => td.product)
  transactionDetails: TransactionDetail[];
}
