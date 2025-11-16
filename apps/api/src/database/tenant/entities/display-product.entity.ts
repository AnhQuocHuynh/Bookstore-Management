import { DisplayProductStatus } from '@/common/enums';
import { Book } from '@/database/tenant/entities/book.entity';
import { DisplayShelf } from '@/database/tenant/entities/display-shelf.entity';
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
export class DisplayProduct {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    type: 'int',
    default: 1,
  })
  quantity: number;

  @Column({ type: 'int', nullable: true })
  displayOrder?: number;

  @Column({
    type: 'enum',
    enum: DisplayProductStatus,
    default: DisplayProductStatus.ACTIVE,
  })
  status: DisplayProductStatus;

  @ManyToOne(() => Book, (book) => book.displayProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'book_id',
  })
  book: Book;

  @ManyToOne(
    () => DisplayShelf,
    (displayShelf) => displayShelf.displayProducts,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'display_shelf_id',
  })
  displayShelf: DisplayShelf;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;
}
