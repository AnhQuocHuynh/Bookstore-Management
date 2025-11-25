import { InventoryLogAction } from '@/common/enums';
import { Employee, Inventory } from '@/database/tenant/entities';
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
export class InventoryLog {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @ManyToOne(() => Inventory, (inventory) => inventory.logs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'inventory_id',
  })
  inventory: Inventory;

  @Column({ type: 'int' })
  quantityChange: number;

  @Column({
    type: 'enum',
    enum: InventoryLogAction,
  })
  action: InventoryLogAction;

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

  @ManyToOne(() => Employee, (employee) => employee.inventoryLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'employee_id',
  })
  employee: Employee;
}
