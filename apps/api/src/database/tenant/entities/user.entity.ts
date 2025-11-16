import {
  AuthorizationCode,
  Customer,
  Employee,
  Otp,
} from '@/database/tenant/entities';
import { UserRole } from '@/modules/users/enums';
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
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column()
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;

  @OneToOne(() => Customer, (customer) => customer.user, {
    cascade: true,
    orphanedRowAction: 'delete',
    nullable: true,
  })
  customer?: Customer;

  @OneToOne(() => Employee, (employee) => employee.user, {
    cascade: true,
    orphanedRowAction: 'delete',
    nullable: true,
  })
  employee?: Employee;

  @OneToMany(
    () => AuthorizationCode,
    (authorizationCode) => authorizationCode.user,
    {
      cascade: true,
      orphanedRowAction: 'delete',
    },
  )
  authorizationCodes: AuthorizationCode[];

  @OneToMany(() => Otp, (otp) => otp.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  otps: Otp[];
}
