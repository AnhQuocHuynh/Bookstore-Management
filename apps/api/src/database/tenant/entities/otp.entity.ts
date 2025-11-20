import { OtpTypeEnum } from '@/common/enums';
import { Employee } from '@/database/tenant/entities/employee.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    type: 'enum',
    enum: OtpTypeEnum,
  })
  type: OtpTypeEnum;

  @Column()
  otp: string;

  @Column({
    type: 'timestamp',
  })
  expiresAt: Date;

  @Column({
    type: 'json',
    nullable: true,
  })
  metadata?: any;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.otps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'employee_id',
  })
  employee: Employee;
}
