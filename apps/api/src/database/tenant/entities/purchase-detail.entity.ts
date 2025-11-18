import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Book } from './book.entity';
import { Purchase } from './purchase.entity';
import { DecimalTransformer } from '@/common/transformers';

@Entity()
export class PurchaseDetail {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @ManyToOne(() => Purchase, (purchase) => purchase.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'purchase_id',
  })
  purchase: Purchase;

  @ManyToOne(() => Book, (book) => book.purchaseDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'book_id',
  })
  book: Book;

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
