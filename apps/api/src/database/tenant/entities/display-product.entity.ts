import { DisplayProductStatus } from '@/common/enums';
import { DisplayLog, DisplayShelf, Product } from '@/database/tenant/entities';
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
export class DisplayProduct {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    type: 'int',
    default: 1,
  })
  quantity: number;

  @Column({ type: 'int', nullable: true })
  displayOrder?: number;

  @Column({
    type: 'enum',
    enum: DisplayProductStatus,
    default: DisplayProductStatus.ACTIVE,
  })
  status: DisplayProductStatus;

  @ManyToOne(() => Product, (product) => product.displayProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'product_id',
  })
  product: Product;

  @ManyToOne(
    () => DisplayShelf,
    (displayShelf) => displayShelf.displayProducts,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'display_shelf_id',
  })
  displayShelf: DisplayShelf;

  @OneToMany(() => DisplayLog, (dl) => dl.displayProduct, {
    cascade: true,
  })
  logs: DisplayLog[];

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;
}
