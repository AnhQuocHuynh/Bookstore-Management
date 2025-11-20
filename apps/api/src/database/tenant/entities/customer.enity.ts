import { CustomerType } from '@/common/enums';
import { CustomerCompany } from '@/database/tenant/entities';
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
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  note?: string;

  @Column({
    type: 'enum',
    enum: CustomerType,
  })
  customerType: CustomerType;

  @OneToOne(() => User, (user) => user.customer, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;

  @OneToOne(() => CustomerCompany, (cc) => cc.customer, {
    cascade: true,
  })
  company: CustomerCompany;
}
