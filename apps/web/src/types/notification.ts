export type Notification = {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
};

export type UserNotification = {
  id: string;
  content: string[];
  metadata?: any;
  isRead: boolean;
  readAt?: string;
  receiverType: string;
  receiverId: string;
  createdAt: string;
  updatedAt: string;
  notification: Notification;
};
