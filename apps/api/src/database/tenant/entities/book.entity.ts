import { BookStatus } from '@/common/enums';
import { Product, Publisher } from '@/database/tenant/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Author } from './author.entity';
import { PurchaseDetail } from './purchase-detail.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  isbn: string;

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

  @OneToOne(() => Product, (product) => product.book, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'product_id',
  })
  product: Product;
}
