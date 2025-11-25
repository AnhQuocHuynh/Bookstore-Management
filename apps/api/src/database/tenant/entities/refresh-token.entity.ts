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

@Entity({
  name: 'refresh_token',
})
export class RT {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  token: string;

  @ManyToOne(() => Employee)
  @JoinColumn({
    name: 'employee_id',
  })
  employee: Employee;

  @Column({
    type: 'timestamp',
  })
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;
}
