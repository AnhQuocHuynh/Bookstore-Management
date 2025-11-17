import { Book } from '@/database/tenant/entities';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @OneToOne(() => Book, (book) => book.inventory, {
    cascade: true,
  })
  book: Book;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  reserved: number;

  @Column({ type: 'int', default: 0 })
  damaged: number;

  @Column({ type: 'int' })
  available: number;

  @CreateDateColumn({ type: 'timestamp' })
  readonly createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  readonly updatedAt: Date;

  @BeforeInsert()
  setAvailable() {
    if (this.available === undefined || this.available === null) {
      this.available = this.quantity || 0;
    }
  }
}
