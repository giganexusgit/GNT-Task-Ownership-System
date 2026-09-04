import { User, Project, Task, TaskActivity, Notification, SystemStats } from '../types';
import { SEED_USERS, SEED_PROJECTS, SEED_TASKS, SEED_ACTIVITIES, SEED_NOTIFICATIONS } from '../data/seedData';

const STORAGE_KEYS = {
  USERS: 'gnt_users',
  PROJECTS: 'gnt_projects',
  TASKS: 'gnt_tasks',
  ACTIVITIES: 'gnt_task_activity',
  NOTIFICATIONS: 'gnt_notifications',
  SESSION: 'gnt_session',
  SETTINGS: 'gnt_settings',
  INITIALIZED: 'gnt_db_initialized_v1',
};

class StorageService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Storage listener error', e);
      }
    });
  }

  public ensureInitialized(): void {
    try {
      const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!isInit) {
        this.resetToSeedData();
      }
    } catch (e) {
      console.error('Failed checking initialization', e);
    }
  }

  public resetToSeedData(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SEED_PROJECTS));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(SEED_TASKS));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(SEED_ACTIVITIES));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify({
          systemName: 'GNT Task Ownership System',
          version: '1.0-MVP',
          deployedEnvironment: 'Internal Operations',
          updatedAt: new Date().toISOString(),
        })
      );
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      this.notify();
    } catch (e) {
      console.error('Failed to reset to seed data', e);
    }
  }

  // Safe Generic Getters / Setters
  public getItem<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`Failed to parse storage key ${key}, falling back to default`, err);
      return defaultValue;
    }
  }

  public setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (err) {
      console.error(`Failed to set storage key ${key}`, err);
    }
  }

  // Domain accessors
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  }

  public setUsers(users: User[]): void {
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  public getProjects(): Project[] {
    return this.getItem<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
  }

  public setProjects(projects: Project[]): void {
    this.setItem(STORAGE_KEYS.PROJECTS, projects);
  }

  public getTasks(): Task[] {
    return this.getItem<Task[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
  }

  public setTasks(tasks: Task[]): void {
    this.setItem(STORAGE_KEYS.TASKS, tasks);
  }

  public getActivities(): TaskActivity[] {
    return this.getItem<TaskActivity[]>(STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES);
  }

  public setActivities(activities: TaskActivity[]): void {
    this.setItem(STORAGE_KEYS.ACTIVITIES, activities);
  }

  public getNotifications(): Notification[] {
    return this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  }

  public setNotifications(notifications: Notification[]): void {
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  public getSession(): { userId: string } | null {
    return this.getItem<{ userId: string } | null>(STORAGE_KEYS.SESSION, null);
  }

  public setSession(session: { userId: string } | null): void {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      this.notify();
    } else {
      this.setItem(STORAGE_KEYS.SESSION, session);
    }
  }

  // Backup / Export / Import / Stats
  public getSystemStats(): SystemStats {
    const users = this.getUsers();
    const projects = this.getProjects();
    const tasks = this.getTasks();
    const activities = this.getActivities();
    const notifications = this.getNotifications();

    let storageBytes = 0;
    try {
      for (const k in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, k) && k.startsWith('gnt_')) {
          storageBytes += (localStorage[k].length + k.length) * 2;
        }
      }
    } catch {
      storageBytes = 0;
    }

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.active).length,
      totalProjects: projects.length,
      totalTasks: tasks.length,
      totalActivities: activities.length,
      totalNotifications: notifications.length,
      storageUsageBytes: storageBytes,
      lastBackupDate: new Date().toISOString(),
    };
  }

  public exportAllData(): string {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        users: this.getUsers(),
        projects: this.getProjects(),
        tasks: this.getTasks(),
        activities: this.getActivities(),
        notifications: this.getNotifications(),
      },
    };
    return JSON.stringify(payload, null, 2);
  }

  public exportFullBackup(): string {
    return this.exportAllData();
  }

  public importAllData(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !parsed.data) {
        return { success: false, message: 'Invalid backup file format: missing root data object.' };
      }
      const { users, projects, tasks, activities, notifications } = parsed.data;
      if (!Array.isArray(users) || !Array.isArray(tasks) || !Array.isArray(projects)) {
        return { success: false, message: 'Backup file missing essential collections (users, tasks, or projects).' };
      }

      this.setUsers(users);
      this.setProjects(projects);
      this.setTasks(tasks);
      if (Array.isArray(activities)) this.setActivities(activities);
      if (Array.isArray(notifications)) this.setNotifications(notifications);

      return { success: true, message: 'Application data restored successfully.' };
    } catch (err) {
      return { success: false, message: `Failed to import data: ${err instanceof Error ? err.message : 'Syntax error'}` };
    }
  }

  public importFullBackup(jsonString: string): boolean {
    const res = this.importAllData(jsonString);
    return res.success;
  }
}

export const storageService = new StorageService();
