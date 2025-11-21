import { CustomerType } from '@/common/enums';
import { CustomerCompany } from '@/database/tenant/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
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
  readonly address: string;

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
}
