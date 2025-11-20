import { DecimalTransformer } from '@/common/transformers';
import { InventoryLog, Product } from '@/database/tenant/entities';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @OneToOne(() => Product, (product) => product.inventory, {
    cascade: true,
  })
  product: Product;

  @OneToMany(() => InventoryLog, (log) => log.inventory, {
    cascade: true,
  })
  logs: Inventory[];

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'int', default: 0 })
  displayQuantity: number;

  @Column({ type: 'int', default: 0 })
  availableQuantity: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: DecimalTransformer,
  })
  costPrice: number;

  @CreateDateColumn({ type: 'timestamp' })
  readonly createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  readonly updatedAt: Date;

  @BeforeInsert()
  setAvailable() {
    if (
      this.availableQuantity === undefined ||
      this.availableQuantity === null
    ) {
      this.availableQuantity = this.stockQuantity || 0;
    }
  }
}
