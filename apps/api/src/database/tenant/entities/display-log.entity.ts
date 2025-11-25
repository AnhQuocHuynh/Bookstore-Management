import { DisplayLogAction } from '@/common/enums';
import {
  DisplayProduct,
  DisplayShelf,
  Employee,
} from '@/database/tenant/entities';
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
export class DisplayLog {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @ManyToOne(() => DisplayProduct, (dp) => dp.logs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'display_product_id',
  })
  displayProduct: DisplayProduct;

  @ManyToOne(() => DisplayShelf, (ds) => ds.displayLogs, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'display_shelf_id',
  })
  shelf: DisplayShelf;

  @Column({ type: 'int', nullable: true })
  quantity?: number;

  @ManyToOne(() => Employee, (employee) => employee.displayLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'employee_id',
  })
  employee: Employee;

  @Column({
    type: 'enum',
    enum: DisplayLogAction,
  })
  action: DisplayLogAction;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;
}
