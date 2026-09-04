import { User, Project, Task, TaskActivity, Notification } from '../types';

/**
 * Fresh System Initial Users
 * Clean starter accounts for Admin, Manager, and Employee
 */
export const SEED_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Admin User',
    email: 'admin@gnt.com',
    role: 'ADMIN',
    pin: '1234',
    active: true,
    initials: 'AU',
    department: 'Administration',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-mgr-1',
    name: 'Operations Manager',
    email: 'manager@gnt.com',
    role: 'MANAGER',
    pin: '1234',
    active: true,
    initials: 'OM',
    department: 'Operations',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-emp-1',
    name: 'Team Member',
    email: 'employee@gnt.com',
    role: 'EMPLOYEE',
    pin: '1234',
    active: true,
    initials: 'TM',
    department: 'Engineering',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Fresh empty projects, tasks, audit logs, and notifications
 */
export const SEED_PROJECTS: Project[] = [];
export const SEED_TASKS: Task[] = [];
export const SEED_ACTIVITIES: TaskActivity[] = [];
export const SEED_NOTIFICATIONS: Notification[] = [];
