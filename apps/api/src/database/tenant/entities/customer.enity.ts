import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Customer {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @OneToOne(() => User, (user) => user.customer, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({
    type: 'int',
    default: 0,
  })
  loyaltyPoints: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  isEmailVerified: boolean;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;
}
