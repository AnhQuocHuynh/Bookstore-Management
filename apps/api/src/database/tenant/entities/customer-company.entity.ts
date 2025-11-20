import { Customer } from '@/database/tenant/entities/customer.enity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class CustomerCompany {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  companyName: string;

  @Column()
  taxCode: string;

  @Column()
  billingAddress: string;

  @Column()
  contactPerson: string;

  @Column({
    unique: true,
  })
  contactPhone: string;

  @Column({
    unique: true,
  })
  contactEmail: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;

  @OneToOne(() => Customer, (customer) => customer.company, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'customer_id',
  })
  customer: Customer;
}
