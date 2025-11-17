import { BookStatus } from '@/common/enums';
import {
  DisplayLog,
  DisplayProduct,
  Inventory,
  Publisher,
  ReturnExchangeDetail,
} from '@/database/tenant/entities';
import { OrderDetail } from '@/database/tenant/entities/order-detail.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Author } from './author.entity';
import { Category } from './category.entity';
import { PurchaseDetail } from './purchase-detail.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  isbn: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'date', nullable: true })
  publicationDate?: Date;

  @Column({ nullable: true })
  edition?: string;

  @Column({ nullable: true })
  language?: string;

  @Column({
    type: 'text',
  })
  coverImage: string;

  @ManyToOne(() => Author, (author) => author.books, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'author_id',
  })
  author: Author;

  @ManyToOne(() => Publisher, (publisher) => publisher.books, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'publisher_id',
  })
  publisher: Publisher;

  @ManyToMany(() => Category, (category) => category.books)
  @JoinTable({
    name: 'category_book',
  })
  categories: Category[];

  @OneToMany(() => PurchaseDetail, (pd) => pd.book)
  purchaseDetails: PurchaseDetail[];

  @Column({
    type: 'enum',
    enum: BookStatus,
    default: BookStatus.AVAILABLE,
  })
  status: BookStatus;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.book, {
    cascade: true,
  })
  orderDetails: OrderDetail[];

  @OneToMany(
    () => ReturnExchangeDetail,
    (returnExchangeDetail) => returnExchangeDetail.book,
    {
      cascade: true,
    },
  )
  returnExchangeDetails: ReturnExchangeDetail[];

  @OneToOne(() => Inventory, (inventory) => inventory.book, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @OneToMany(() => DisplayProduct, (dp) => dp.book, {
    cascade: true,
  })
  displayProducts: DisplayProduct[];

  @OneToMany(() => DisplayLog, (dl) => dl.book, {
    cascade: true,
  })
  displayLogs: DisplayLog[];
}
