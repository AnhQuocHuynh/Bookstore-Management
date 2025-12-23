import { AuthorizationCodeTypeEnum } from '@/common/enums';
import { Employee } from '@/database/tenant/entities';
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
export class AuthorizationCode {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  code: string;

  @Column({
    type: 'timestamp',
  })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: AuthorizationCodeTypeEnum,
  })
  type: AuthorizationCodeTypeEnum;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.authorizationCodes, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({
    name: 'employee_id',
    referencedColumnName: 'id',
  })
  employee?: Employee;
}
