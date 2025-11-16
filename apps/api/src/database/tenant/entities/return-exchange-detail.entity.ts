import {
  ReturnExchangeDetailStatus,
  ReturnExchangeDetailType,
} from '@/common/enums';
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
import { Order } from './order.entity';

@Entity()
export class ReturnExchangeDetail {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @ManyToOne(() => Order, (order) => order.returnExchangeDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'order_id',
  })
  order: Order;

  @ManyToOne(() => Book, (book) => book.returnExchangeDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'book_id',
  })
  book: Book;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({
    type: 'enum',
    enum: ReturnExchangeDetailType,
  })
  type: ReturnExchangeDetailType;

  @ManyToOne(() => Book, { nullable: true })
  newBook?: Book;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
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
}
