import { DisplayLog } from '@/database/tenant/entities/display-log.entity';
import { DisplayProduct } from '@/database/tenant/entities/display-product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class DisplayShelf {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    unique: true,
  })
  name: string;

  @Column({
    type: 'text',
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

  @OneToMany(() => DisplayProduct, (dp) => dp.displayShelf, {
    cascade: true,
  })
  displayProducts: DisplayProduct[];

  @OneToMany(() => DisplayLog, (dl) => dl.shelf, {
    cascade: true,
  })
  displayLogs: DisplayLog[];
}
