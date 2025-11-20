import {
  ReturnExchangeDetailStatus,
  ReturnExchangeDetailType,
} from '@/common/enums';
import { DecimalTransformer } from '@/common/transformers';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Book } from './book.entity';

@Entity()
export class ReturnExchangeDetail {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({
    type: 'enum',
    enum: ReturnExchangeDetailType,
  })
  type: ReturnExchangeDetailType;

  @ManyToOne(() => Book, { nullable: true })
  newBook?: Book;

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
}
