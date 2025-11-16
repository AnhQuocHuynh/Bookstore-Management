import { InvitationStatusEnum } from '@/common/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  email: string;

  @Column()
  token: string;

  @Column({
    type: 'enum',
    enum: InvitationStatusEnum,
    default: InvitationStatusEnum.PENDING,
  })
  status: InvitationStatusEnum;

  @Column({
    type: 'timestamp',
  })
  expiresAt: Date;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;
}
