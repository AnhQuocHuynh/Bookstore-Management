import { BookStore } from '@/database/main/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class DatabaseConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  host: string;

  @Column({ type: 'int' })
  port: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  database: string;

  @Column({ default: 'postgres' })
  type: string;

  @Column({ default: false })
  isConnected: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  lastConnectedAt?: Date;

  @OneToOne(() => BookStore, (store) => store.connection, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'book_store_id' })
  bookStore: BookStore;

  @CreateDateColumn({ type: 'timestamp' })
  readonly createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  readonly updatedAt: Date;
}
