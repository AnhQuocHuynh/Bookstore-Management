import { CustomerType } from '@/common/enums';
import { ReturnOrder, Transaction } from '@/database/tenant/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  fullName: string;

  @Column({
    unique: true,
  })
  phoneNumber: string;

  @Column()
  address: string;

  @Column({
    unique: true,
  })
  customerCode: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  note?: string;

  @Column({
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.REGULAR,
  })
  customerType: CustomerType;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;

  @OneToMany(() => ReturnOrder, (ro) => ro.customer, {
    cascade: true,
  })
  returnOrders: ReturnOrder[];

  @OneToMany(() => Transaction, (t) => t.customer, {
    cascade: true,
  })
  readonly transactions: Transaction[];
}
