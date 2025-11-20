import { InventoryLogAction, InventoryLogActorType } from '@/common/enums';
import { Inventory, Product } from '@/database/tenant/entities';
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

  @Column({
    type: 'enum',
    enum: InventoryLogActorType,
  })
  actorType: InventoryLogActorType;

  @Column({
    type: 'uuid',
  })
  actorId: string;

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
