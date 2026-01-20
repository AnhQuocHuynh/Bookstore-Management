import { ReceiverType } from '@/common/enums';
import { Notification } from '@/database/tenant/entities';
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
export class UserNotification {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column('text', { array: true })
  content: string[];

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata?: any;

  @Column({
    type: 'boolean',
    default: false,
  })
  isRead: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  readAt?: Date;

  @ManyToOne(() => Notification, (notif) => notif.userNotifications, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'notification_id',
  })
  notification: Notification;

  @Column({
    type: 'enum',
    enum: ReceiverType,
  })
  receiverType: ReceiverType;

  @Column({
    type: 'uuid',
  })
  receiverId: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  readonly updatedAt: Date;
}
