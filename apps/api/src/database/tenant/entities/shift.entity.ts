import { SchedulerEntry } from '@/database/tenant/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  name: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({
    nullable: true,
  })
  description?: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;

  @OneToMany(() => SchedulerEntry, (se) => se.shift, {
    cascade: true,
  })
  entries: SchedulerEntry[];
}
