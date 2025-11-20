import { CategoryStatus } from '@/common/enums';
import { DecimalTransformer } from '@/common/transformers';
import { Product } from '@/database/tenant/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'parent_id',
  })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent, {
    cascade: true,
  })
  children: Category[];

  @Column({
    type: 'enum',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  status: CategoryStatus;

  @Column({
    type: 'decimal',
    precision: 4,
    scale: 2,
    default: 0.1,
    transformer: DecimalTransformer,
  })
  taxRate: number;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  @ManyToMany(() => Product, (product) => product.categories)
  products: Product[];
}
