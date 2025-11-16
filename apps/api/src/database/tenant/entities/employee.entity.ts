import { Order, User } from '@/database/tenant/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Employee {
  @PrimaryColumn()
  userId: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isFirstLogin: boolean;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;

  @OneToOne(() => User, (user) => user.employee, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @OneToMany(() => Order, (order) => order.employee, {
    cascade: true,
  })
  orders: Order[];
}
