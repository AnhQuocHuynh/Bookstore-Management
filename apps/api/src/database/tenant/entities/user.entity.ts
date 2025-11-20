import { UserTenantRole } from '@/common/enums';
import { Customer, Employee } from '@/database/tenant/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({
    type: 'enum',
    enum: UserTenantRole,
  })
  role: UserTenantRole;

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
}
