import { Employee, Shift } from '@/database/tenant/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['employee', 'workDate', 'shift'])
export class SchedulerEntry {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    type: 'date',
  })
  workDate: Date;

  @Column({
    nullable: true,
  })
  note?: string;

  @ManyToOne(() => Shift, (shift) => shift.entries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'shift_id',
  })
  shift: Shift;

  @ManyToOne(() => Employee, (e) => e.entries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'employee_id',
  })
  employee: Employee;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;
}
