import { DecimalTransformer } from '@/common/transformers';
import { Transaction } from '@/database/tenant/entities';
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
export class TransactionDetail {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    type: 'int',
    default: 1,
  })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: DecimalTransformer,
  })
  unitPrice: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: DecimalTransformer,
  })
  discount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: DecimalTransformer,
  })
  totalPrice: number;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;

  @ManyToOne(() => Transaction, (transaction) => transaction, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'transaction_id',
  })
  transaction: Transaction;
}
