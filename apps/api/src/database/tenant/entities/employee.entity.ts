import { EmployeeRole } from '@/common/enums';
import {
  AuthorizationCode,
  Otp,
  Transaction,
} from '@/database/tenant/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    unique: true,
    nullable: true,
  })
  email?: string;

  @Column({
    unique: true,
  })
  username: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  isFirstLogin: boolean;

  @Column({
    type: 'enum',
    enum: EmployeeRole,
  })
  role: EmployeeRole;

  @Column()
  fullName: string;

  @Column({
    unique: true,
  })
  phoneNumber: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;

  @OneToMany(() => Transaction, (transasction) => transasction.cashier, {
    cascade: true,
  })
  transactions: Transaction[];

  @OneToMany(
    () => AuthorizationCode,
    (authorizationCode) => authorizationCode.employee,
    {
      cascade: true,
      orphanedRowAction: 'delete',
    },
  )
  authorizationCodes: AuthorizationCode[];

  @OneToMany(() => Otp, (otp) => otp.employee, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  otps: Otp[];
}
