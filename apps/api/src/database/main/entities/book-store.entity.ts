import { DatabaseConnection, User } from '@/database/main/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class BookStore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({
    unique: true,
  })
  name: string;

  @Column()
  address: string;

  @Column({
    unique: true,
  })
  phoneNumber: string;

  @Column({ default: false })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.bookStores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => DatabaseConnection, (db) => db.bookStore, {
    cascade: true,
  })
  connection: DatabaseConnection;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;
}
