import { CustomerType } from '@/common/enums';
import { CustomerCompany, ReturnOrder } from '@/database/tenant/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
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
    type: 'text',
    nullable: true,
  })
  note?: string;

  @Column({
    type: 'enum',
    enum: CustomerType,
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

  @OneToOne(() => CustomerCompany, (cc) => cc.customer, {
    cascade: true,
  })
  company: CustomerCompany;

  @OneToMany(() => ReturnOrder, (ro) => ro.customer, {
    cascade: true,
  })
  returnOrders: ReturnOrder[];
}
