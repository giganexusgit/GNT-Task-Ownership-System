import { Notification } from '../types';
import { storageService } from './storageService';

class NotificationService {
  public async getNotifications(userId: string): Promise<Notification[]> {
    const list = storageService.getNotifications();
    return list
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getUnreadCount(userId: string): Promise<number> {
    const list = storageService.getNotifications();
    return list.filter((n) => n.userId === userId && !n.read).length;
  }

  public async markAsRead(notificationId: string): Promise<void> {
    const list = storageService.getNotifications();
    const target = list.find((n) => n.id === notificationId);
    if (target && !target.read) {
      target.read = true;
      storageService.setNotifications(list);
    }
  }

  public async markAllAsRead(userId: string): Promise<void> {
    const list = storageService.getNotifications();
    let changed = false;
    list.forEach((n) => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        changed = true;
      }
    });
    if (changed) {
      storageService.setNotifications(list);
    }
  }

  public async createNotification(
    data: Omit<Notification, 'id' | 'createdAt'>
  ): Promise<Notification> {
    const list = storageService.getNotifications();
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      taskId: data.taskId,
      read: data.read ?? false,
      createdAt: new Date().toISOString(),
    };

    list.unshift(newNotif);
    storageService.setNotifications(list);
    return newNotif;
  }
}

export const notificationService = new NotificationService();
