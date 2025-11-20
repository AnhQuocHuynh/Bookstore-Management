import {
  AuthorizationCode,
  Otp,
  Transaction,
  User,
} from '@/database/tenant/entities';
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

  @Column()
  readonly password: string;

  @Column({ default: true })
  isActive: boolean;

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
