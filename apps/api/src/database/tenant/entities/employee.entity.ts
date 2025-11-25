import { EmployeeRole } from '@/common/enums';
import {
  AuthorizationCode,
  DisplayLog,
  InventoryLog,
  Otp,
  PurchaseOrder,
  ReturnOrder,
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
  })
  email: string;

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
    nullable: true,
  })
  address: string;

  @Column({
    unique: true,
  })
  phoneNumber: string;

  @Column({
    type: 'timestamp',
  })
  birthDate: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  avatarUrl?: string;

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

  @OneToMany(() => PurchaseOrder, (po) => po.employee, {
    cascade: true,
  })
  purchaseOrders: PurchaseOrder[];

  @OneToMany(() => ReturnOrder, (ro) => ro.employee, {
    cascade: true,
  })
  returnOrders: ReturnOrder[];

  @OneToMany(() => DisplayLog, (dl) => dl.employee, {
    cascade: true,
  })
  displayLogs: DisplayLog[];

  @OneToMany(() => InventoryLog, (il) => il.employee, {
    cascade: true,
  })
  inventoryLogs: InventoryLog[];
}
