import { DisplayLogAction, DisplayLogActorType } from '@/common/enums';
import { Book } from '@/database/tenant/entities/book.entity';
import { DisplayShelf } from '@/database/tenant/entities/display-shelf.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DisplayLog {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @ManyToOne(() => Book, (book) => book.displayLogs, {
    onDelete: 'RESTRICT',
  })
  book: Book;

  @ManyToOne(() => DisplayShelf, (ds) => ds.displayLogs, {
    onDelete: 'RESTRICT',
  })
  shelf: DisplayShelf;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'enum',
    enum: DisplayLogAction,
  })
  action: DisplayLogAction;

  @Column({
    type: 'enum',
    enum: DisplayLogActorType,
  })
  actorType: DisplayLogActorType;

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
