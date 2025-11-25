import { SupplyStatus } from '@/common/enums';
import { Product, PurchaseOrder } from '@/database/tenant/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    unique: true,
  })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ type: 'text' })
  address: string;

  @Column({
    type: 'enum',
    enum: SupplyStatus,
    default: SupplyStatus.ACTIVE,
  })
  status: SupplyStatus;

  @Column({
    nullable: true,
  })
  taxCode?: string;

  @Column({ nullable: true })
  contactPerson?: string;

  @Column({ nullable: true, type: 'text' })
  note?: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;

  @OneToMany(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.supplier, {
    cascade: true,
  })
  purchaseOrders: PurchaseOrder[];

  @OneToMany(() => Product, (product) => product.supplier, {
    cascade: true,
  })
  products: Product[];
}
