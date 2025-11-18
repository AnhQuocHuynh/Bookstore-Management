import { Book, Cart } from '@/database/tenant/entities';
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
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    type: 'int',
  })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  @ManyToOne(() => Cart, (cart) => cart.cartItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'cart_id',
  })
  cart: Cart;

  @ManyToOne(() => Book, (book) => book.cartItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'book_id',
  })
  book: Book;
}
