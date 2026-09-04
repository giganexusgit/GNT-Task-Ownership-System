import { TaskActivity } from '../types';
import { storageService } from './storageService';

class ActivityService {
  public async getActivities(limit?: number, taskId?: string): Promise<TaskActivity[]> {
    let list = storageService.getActivities();
    if (taskId) {
      list = list.filter((a) => a.taskId === taskId);
    }
    // Sort descending by timestamp
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (limit && limit > 0) {
      return list.slice(0, limit);
    }
    return list;
  }

  public async recordActivity(
    data: Omit<TaskActivity, 'id' | 'timestamp'>
  ): Promise<TaskActivity> {
    const activities = storageService.getActivities();
    const newActivity: TaskActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      taskId: data.taskId,
      taskTitle: data.taskTitle,
      userId: data.userId,
      userName: data.userName,
      userRole: data.userRole,
      action: data.action,
      previousValue: data.previousValue,
      newValue: data.newValue,
      timestamp: new Date().toISOString(),
    };

    activities.unshift(newActivity);
    storageService.setActivities(activities);
    return newActivity;
  }
}

export const activityService = new ActivityService();
