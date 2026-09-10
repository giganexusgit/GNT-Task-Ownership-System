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

  public async deleteNotification(notificationId: string): Promise<void> {
    const list = storageService.getNotifications();
    const target = list.find((n) => n.id === notificationId);
    if (target && target.type === 'OVERDUE' && target.taskId) {
      storageService.addClearedOverdueKey(`${target.userId}_${target.taskId}`);
    }
    const filtered = list.filter((n) => n.id !== notificationId);
    if (filtered.length !== list.length) {
      storageService.setNotifications(filtered);
    }
  }

  public async clearNotifications(userId: string, readOnly: boolean = false): Promise<void> {
    const list = storageService.getNotifications();
    list.forEach((n) => {
      if (n.userId === userId && n.type === 'OVERDUE' && n.taskId) {
        if (!readOnly || n.read) {
          storageService.addClearedOverdueKey(`${n.userId}_${n.taskId}`);
        }
      }
    });

    const filtered = list.filter((n) => {
      if (n.userId !== userId) return true;
      if (readOnly) return !n.read;
      return false;
    });

    if (filtered.length !== list.length) {
      storageService.setNotifications(filtered);
    }
  }

  public async syncOverdueNotifications(): Promise<void> {
    const tasks = storageService.getTasks();
    const users = storageService.getUsers();
    let notifications = storageService.getNotifications();
    const clearedKeys = storageService.getClearedOverdueKeys();
    const todayStr = new Date().toISOString().split('T')[0];

    // Step 1: Purge any existing duplicate notifications and orphan notifications for deleted tasks
    const activeTaskIds = new Set(tasks.map((t) => t.id));
    const seenMap = new Set<string>();
    const validNotifs: Notification[] = [];
    let hadChanges = false;

    for (const n of notifications) {
      if (n.taskId && !activeTaskIds.has(n.taskId)) {
        hadChanges = true;
        continue;
      }
      const key = `${n.userId}_${n.taskId || 'general'}_${n.type}`;
      if (!seenMap.has(key)) {
        seenMap.add(key);
        validNotifs.push(n);
      } else {
        hadChanges = true;
      }
    }

    if (hadChanges) {
      notifications = validNotifs;
      storageService.setNotifications(notifications);
    }

    const overdueTasks = tasks.filter((t) => t.dueDate < todayStr && t.status !== 'DONE');
    if (overdueTasks.length === 0) return;

    let changed = false;
    const newNotifs: Notification[] = [];

    for (const task of overdueTasks) {
      // Collect recipient user IDs: assigned employee + all admins/managers
      const recipientIds = new Set<string>();
      if (task.assignedEmployeeId) {
        recipientIds.add(task.assignedEmployeeId);
      }
      users.forEach((u) => {
        if (u.role === 'ADMIN' || u.role === 'MANAGER') {
          recipientIds.add(u.id);
        }
      });

      for (const userId of recipientIds) {
        const clearedKey = `${userId}_${task.id}`;
        if (clearedKeys.includes(clearedKey)) {
          // User has explicitly cleared/dismissed overdue alert for this task -> do not re-create
          continue;
        }

        const deterministicId = `notif-overdue-${userId}-${task.id}`;

        const existingInList = notifications.find(
          (n) => n.id === deterministicId || (n.taskId === task.id && n.userId === userId && n.type === 'OVERDUE')
        );
        const existingInNew = newNotifs.find(
          (n) => n.id === deterministicId || (n.taskId === task.id && n.userId === userId && n.type === 'OVERDUE')
        );

        if (!existingInList && !existingInNew) {
          newNotifs.push({
            id: deterministicId,
            userId,
            type: 'OVERDUE',
            title: 'Task Overdue Alert',
            message: `Deliverable "${task.title}" assigned to ${task.assignedEmployeeName} passed deadline (${task.dueDate}).`,
            taskId: task.id,
            read: false,
            createdAt: new Date().toISOString(),
          });
          changed = true;
        }
      }
    }

    if (changed && newNotifs.length > 0) {
      const updatedList = [...newNotifs, ...notifications];
      storageService.setNotifications(updatedList);
    }
  }
}

export const notificationService = new NotificationService();
