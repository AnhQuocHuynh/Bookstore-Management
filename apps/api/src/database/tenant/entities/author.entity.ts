import { AuthorStatus } from '@/common/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Book } from './book.entity';

@Entity()
export class Author {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  penName?: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ nullable: true, unique: true })
  phone?: string;

  @Column({ nullable: true })
  nationality?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({
    type: 'enum',
    enum: AuthorStatus,
    default: AuthorStatus.ACTIVE,
  })
  status: AuthorStatus;

  @OneToMany(() => Book, (book) => book.author, {
    cascade: true,
  })
  books: Book[];

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;
}
