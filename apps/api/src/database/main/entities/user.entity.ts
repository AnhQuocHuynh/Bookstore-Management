import { AuthorizationCode, BookStore, Otp } from '@/database/main/entities';
import { UserRole } from '@/modules/users/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  logoUrl?: string;

  @Column({
    type: 'timestamp',
  })
  birthDate?: Date;

  @Column()
  address?: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isActive: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isEmailVerified: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.OWNER,
  })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp' })
  readonly createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt!: Date;

  @OneToMany(() => BookStore, (bookStore) => bookStore.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  readonly bookStores: BookStore[];

  @OneToMany(() => Otp, (otp) => otp.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  otps: Otp[];

  @OneToMany(
    () => AuthorizationCode,
    (authorizationCode) => authorizationCode.user,
    {
      cascade: true,
      orphanedRowAction: 'delete',
    },
  )
  authorizationCodes: AuthorizationCode[];
}
