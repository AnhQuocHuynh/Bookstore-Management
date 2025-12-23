import { EmployeeRole } from '@/common/enums';
import { BookStore } from '@/database/main/entities';
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
export class EmployeeMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @ManyToOne(() => BookStore, (bs) => bs.employeeMappings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bookstore_id' })
  bookstore: BookStore;

  @Column({
    type: 'enum',
    enum: EmployeeRole,
  })
  role: EmployeeRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;
}
