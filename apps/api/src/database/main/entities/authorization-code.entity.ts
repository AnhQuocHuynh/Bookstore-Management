import { AuthorizationCodeTypeEnum } from '@/common/enums';
import { User } from '@/database/main/entities/user.entity';
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
export class AuthorizationCode {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  code: string;

  @Column({
    type: 'timestamp',
  })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: AuthorizationCodeTypeEnum,
  })
  type: AuthorizationCodeTypeEnum;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;

  @ManyToOne(() => User, (user) => user.authorizationCodes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
