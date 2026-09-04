import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Task, Project, TaskActivity, Notification, TaskStatus, TaskPriority, ProjectStatus, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { authService, LoginResult } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { projectService } from '../services/projectService';
import { notificationService } from '../services/notificationService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  activities: TaskActivity[];
  notifications: Notification[];
  unreadNotificationCount: number;
  toasts: ToastMessage[];
  activeRoute: string;
  selectedTaskId: string | null;
  taskFilterState: {
    status?: TaskStatus | 'ALL';
    priority?: TaskPriority | 'ALL';
    employeeId?: string;
    projectId?: string;
    quickFilter?: 'all' | 'today' | 'upcoming' | 'overdue' | 'blocked' | 'completed';
    search?: string;
  };

  // Actions
  login: (userId: string, pin: string) => Promise<LoginResult>;
  signInWithEmail: (email: string, password: string) => Promise<LoginResult>;
  signUpWithEmail: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department?: string;
  }) => Promise<LoginResult>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  navigateTo: (route: string, filterParams?: Record<string, any>) => void;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;
  setTaskFilterState: React.Dispatch<React.SetStateAction<any>>;
  showToast: (
    title: string,
    message?: string,
    type?: 'success' | 'error' | 'info' | 'warning',
    action?: { label: string; onClick: () => void },
    duration?: number
  ) => void;
  dismissToast: (id: string) => void;

  // Task Actions
  createTask: (data: {
    title: string;
    description: string;
    projectId: string;
    assignedEmployeeId: string;
    priority: TaskPriority;
    dueDate: string;
    nextAction: string;
    notes?: string;
    referenceLink?: string;
    estimatedEffort?: string;
    expectedCompletionDate?: string;
  }) => Promise<{ success: boolean; message: string; task?: Task }>;

  employeeUpdateTask: (
    taskId: string,
    updates: {
      status?: TaskStatus;
      progress?: number;
      blocker?: string;
      nextAction?: string;
      notes?: string;
      expectedCompletionDate?: string;
    }
  ) => Promise<{ success: boolean; message: string; task?: Task }>;

  updateTaskMetadata: (
    taskId: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => Promise<{ success: boolean; message: string; task?: Task }>;

  deleteTask: (taskId: string) => Promise<{ success: boolean; message: string }>;

  // User Actions
  createUser: (data: {
    name: string;
    email: string;
    role: UserRole;
    pin: string;
    department?: string;
    active?: boolean;
  }) => Promise<{ success: boolean; message?: string }>;

  toggleUserActive: (userId: string) => Promise<{ success: boolean; message: string }>;
  resetUserPin: (userId: string, newPin: string) => Promise<{ success: boolean; message: string }>;
  changeUserRole: (userId: string, newRole: UserRole) => Promise<{ success: boolean; message: string; user?: User }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;

  // Project Actions
  createProject: (data: {
    projectName: string;
    clientName: string;
    status: ProjectStatus;
    description?: string;
  }) => Promise<{ success: boolean; message: string; project?: Project }>;

  updateProject: (
    id: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt'>>
  ) => Promise<{ success: boolean; message: string }>;

  deleteProject: (id: string) => Promise<{ success: boolean; message: string }>;

  // Notification Actions
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // System Actions
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [projects, setProjects] = useState<Project[]>(() => storageService.getProjects());
  const [tasks, setTasks] = useState<Task[]>(() => storageService.getTasks());
  const [activities, setActivities] = useState<TaskActivity[]>(() => storageService.getActivities());
  const [notifications, setNotifications] = useState<Notification[]>(() => storageService.getNotifications());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeRoute, setActiveRoute] = useState<string>('/login');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskFilterState, setTaskFilterState] = useState<any>({
    status: 'ALL',
    priority: 'ALL',
    quickFilter: 'all',
    search: '',
  });

  const refreshAllState = useCallback(async () => {
    const allUsers = storageService.getUsers();
    const allProjects = storageService.getProjects();
    const allTasks = storageService.getTasks();
    const allActivities = storageService.getActivities();
    const allNotifs = storageService.getNotifications();
    const curr = await authService.getCurrentUser();

    setUsers(allUsers);
    setProjects(allProjects);
    setTasks(allTasks);
    setActivities(allActivities);
    setNotifications(allNotifs);
    setCurrentUser(curr);

    // If logged in and route is login, route to default dashboard
    if (curr) {
      setActiveRoute((prev) => {
        if (prev === '/login') {
          if (curr.role === 'ADMIN') return '/admin/dashboard';
          if (curr.role === 'MANAGER') return '/manager/dashboard';
          return '/employee/tasks';
        }
        return prev;
      });
    } else {
      setActiveRoute('/login');
    }
  }, []);

  useEffect(() => {
    refreshAllState();

    // Trigger initial cloud sync with Supabase
    storageService.syncWithSupabase().then(() => {
      refreshAllState();
    });

    const unsubscribe = storageService.subscribe(() => {
      refreshAllState();
    });

    // Real-time Supabase postgres_changes listener
    const channel = supabase
      .channel('public:db-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        storageService.syncWithSupabase();
      })
      .subscribe();

    return () => {
      unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [refreshAllState]);

  const showToast = useCallback(
    (
      title: string,
      message?: string,
      type: 'success' | 'error' | 'info' | 'warning' = 'info',
      action?: { label: string; onClick: () => void },
      duration: number = 4500
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      setToasts((prev) => [...prev, { id, title, message, type, action, duration }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<LoginResult> => {
    const res = await authService.signInWithEmail(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      showToast(
        'Signed In Successfully',
        `Welcome, ${res.user.name} (${res.user.role} workspace active)`,
        'success'
      );
      if (res.user.role === 'ADMIN') setActiveRoute('/admin/dashboard');
      else if (res.user.role === 'MANAGER') setActiveRoute('/manager/dashboard');
      else setActiveRoute('/employee/tasks');
    } else {
      showToast('Authentication Failed', res.errorMessage || 'Invalid email or password', 'error');
    }
    return res;
  };

  const signUpWithEmail = async (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department?: string;
  }): Promise<LoginResult> => {
    const res = await authService.signUpWithEmail(data);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      showToast(
        'Account Created Successfully',
        `Welcome to GNT Workboard, ${res.user.name}!`,
        'success'
      );
      if (res.user.role === 'ADMIN') setActiveRoute('/admin/dashboard');
      else if (res.user.role === 'MANAGER') setActiveRoute('/manager/dashboard');
      else setActiveRoute('/employee/tasks');
    } else {
      showToast('Registration Failed', res.errorMessage || 'Unable to create account', 'error');
    }
    return res;
  };

  const login = async (userId: string, pin: string): Promise<LoginResult> => {
    const res = await authService.login(userId, pin);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      showToast(
        'Signed In Successfully',
        `Welcome back, ${res.user.name} (${res.user.role} workspace active)`,
        'success'
      );
      if (res.user.role === 'ADMIN') setActiveRoute('/admin/dashboard');
      else if (res.user.role === 'MANAGER') setActiveRoute('/manager/dashboard');
      else setActiveRoute('/employee/tasks');
    } else {
      showToast('Authentication Failed', res.errorMessage || 'Invalid credentials or PIN entered', 'error');
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setActiveRoute('/login');
    showToast('Signed Out Successfully', 'Your secure session has ended', 'info');
  };

  const switchUser = async (userId: string) => {
    const user = await authService.switchUser(userId);
    if (user) {
      setCurrentUser(user);
      showToast(
        'Workspace Role Switched',
        `Now operating as ${user.name} (${user.role})`,
        'info'
      );
      if (user.role === 'ADMIN') setActiveRoute('/admin/dashboard');
      else if (user.role === 'MANAGER') setActiveRoute('/manager/dashboard');
      else setActiveRoute('/employee/tasks');
    }
  };

  const navigateTo = (route: string, filterParams?: Record<string, any>) => {
    if (filterParams) {
      setTaskFilterState((prev: any) => ({ ...prev, ...filterParams }));
    }
    setActiveRoute(route);
  };

  const openTaskDetail = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const closeTaskDetail = () => {
    setSelectedTaskId(null);
  };

  // Task Actions
  const createTask = async (data: any) => {
    if (!currentUser) return { success: false, message: 'User not authenticated' };
    const res = await taskService.createTask(data, currentUser);
    if (res.success && res.task) {
      const created = res.task;
      showToast(
        'Task Created Successfully',
        `"${created.title}" assigned to ${created.assignedEmployeeName}`,
        'success',
        {
          label: 'View Task',
          onClick: () => setSelectedTaskId(created.id),
        }
      );
    } else if (res.success) {
      showToast('Task Created Successfully', res.message, 'success');
    } else {
      showToast('Task Creation Failed', res.message, 'error');
    }
    return res;
  };

  const employeeUpdateTask = async (taskId: string, updates: any) => {
    if (!currentUser) return { success: false, message: 'User not authenticated' };
    const res = await taskService.employeeUpdateTask(taskId, updates, currentUser);
    if (res.success && res.task) {
      const updated = res.task;
      showToast(
        'Task Progress Updated',
        `"${updated.title}" marked as ${updated.status.replace('_', ' ')} (${updated.progress}%)`,
        'success',
        {
          label: 'View Task',
          onClick: () => setSelectedTaskId(updated.id),
        }
      );
    } else if (res.success) {
      showToast('Task Updated', res.message, 'success');
    } else {
      showToast('Update Failed', res.message, 'error');
    }
    return res;
  };

  const updateTaskMetadata = async (taskId: string, updates: any) => {
    if (!currentUser) return { success: false, message: 'User not authenticated' };
    const res = await taskService.updateTaskMetadata(taskId, updates, currentUser);
    if (res.success && res.task) {
      const updated = res.task;
      showToast(
        'Task Updated Successfully',
        `Saved modifications to "${updated.title}"`,
        'success',
        {
          label: 'View Task',
          onClick: () => setSelectedTaskId(updated.id),
        }
      );
    } else if (res.success) {
      showToast('Task Configured', res.message, 'success');
    } else {
      showToast('Update Failed', res.message, 'error');
    }
    return res;
  };

  const deleteTask = async (taskId: string) => {
    if (!currentUser) return { success: false, message: 'User not authenticated' };
    const targetTask = tasks.find((t) => t.id === taskId);
    const res = await taskService.deleteTask(taskId, currentUser);
    if (res.success) {
      showToast(
        'Task Deleted Successfully',
        targetTask ? `"${targetTask.title}" was permanently removed from project` : res.message,
        'info'
      );
      if (selectedTaskId === taskId) setSelectedTaskId(null);
    } else {
      showToast('Delete Failed', res.message, 'error');
    }
    return res;
  };

  // User Actions
  const createUser = async (data: any) => {
    if (!currentUser) return { success: false, message: 'User not authenticated' };
    const res = await userService.createUser(data, currentUser);
    if (res.success && res.user) {
      showToast(
        'Team Member Added Successfully',
        `Account created for ${res.user.name} with ${res.user.role} role`,
        'success'
      );
    } else if (res.success) {
      showToast('Team Member Added', res.message, 'success');
    } else {
      showToast('Account Creation Failed', res.message, 'error');
    }
    return res;
  };

  const toggleUserActive = async (userId: string) => {
    if (!currentUser) return { success: false, message: 'User not authenticated' };
    const targetUser = users.find((u) => u.id === userId);
    const res = await userService.toggleUserActive(userId, currentUser);
    if (res.success) {
      showToast(
        'Account Status Changed',
        targetUser ? `${targetUser.name} is now ${targetUser.active ? 'deactivated' : 'activated'}` : res.message,
        'info'
      );
    } else {
      showToast('Action Prohibited', res.message, 'error');
    }
    return res;
  };

  const resetUserPin = async (userId: string, newPin: string) => {
    if (!currentUser) return { success: false, message: 'User not authenticated' };
    const targetUser = users.find((u) => u.id === userId);
    const res = await userService.resetPin(userId, newPin, currentUser);
    if (res.success) {
      showToast(
        'Security PIN Reset Successfully',
        targetUser ? `PIN updated for ${targetUser.name}` : res.message,
        'success'
      );
    } else {
      showToast('PIN Reset Failed', res.message, 'error');
    }
    return res;
  };

  const changeUserRole = async (userId: string, newRole: UserRole) => {
    if (!currentUser) return { success: false, message: 'User not authenticated' };
    const res = await userService.changeUserRole(userId, newRole, currentUser);
    if (res.success) {
      showToast('Role Updated', res.message, 'success');
      // If current user modified their own role, update currentUser state
      if (currentUser.id === userId && res.user) {
        setCurrentUser(res.user);
      }
    } else {
      showToast('Action Prohibited', res.message, 'error');
    }
    return res;
  };

  const deleteUser = async (userId: string) => {
    if (!currentUser) return { success: false, message: 'User not authenticated' };
    const res = await userService.deleteUser(userId, currentUser);
    if (res.success) {
      showToast('Employee Deleted', res.message, 'success');
    } else {
      showToast('Delete Failed', res.message, 'error');
    }
    return res;
  };

  // Project Actions
  const createProject = async (data: any) => {
    if (!currentUser) return { success: false, message: 'User not authenticated' };
    const res = await projectService.createProject(data, currentUser);
    if (res.success) {
      showToast(
        'Project Created Successfully',
        `"${data.projectName}" registered for client "${data.clientName}"`,
        'success'
      );
    } else {
      showToast('Project Creation Failed', res.message, 'error');
    }
    return res;
  };

  const updateProject = async (id: string, updates: any) => {
    if (!currentUser) return { success: false, message: 'User not authenticated' };
    const res = await projectService.updateProject(id, updates, currentUser);
    if (res.success) {
      showToast(
        'Project Updated Successfully',
        res.message || 'Project specifications and timeline saved',
        'success'
      );
    } else {
      showToast('Update Failed', res.message, 'error');
    }
    return res;
  };

  const deleteProject = async (id: string) => {
    if (!currentUser) return { success: false, message: 'User not authenticated' };
    const proj = projects.find((p) => p.id === id);
    const res = await projectService.deleteProject(id, currentUser);
    if (res.success) {
      showToast(
        'Project Removed Successfully',
        proj ? `"${proj.projectName}" was deleted` : res.message,
        'info'
      );
    } else {
      showToast('Action Prohibited', res.message, 'warning');
    }
    return res;
  };

  // Notification Actions
  const markNotificationRead = async (id: string) => {
    await notificationService.markAsRead(id);
    showToast('Notification Read', 'Notice marked as acknowledged', 'info');
  };

  const markAllNotificationsRead = async () => {
    if (currentUser) {
      const count = unreadNotificationCount;
      await notificationService.markAllAsRead(currentUser.id);
      showToast(
        'All Notifications Cleared',
        `${count} notice${count === 1 ? '' : 's'} marked as read`,
        'info'
      );
    }
  };

  const resetToDemoData = () => {
    storageService.resetToSeedData();
    showToast('Demo Environment Restored', 'All initial GNT enterprise demo data loaded', 'success');
    setActiveRoute('/login');
  };

  const unreadNotificationCount = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id && !n.read).length
    : 0;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        projects,
        tasks,
        activities,
        notifications,
        unreadNotificationCount,
        toasts,
        activeRoute,
        selectedTaskId,
        taskFilterState,
        login,
        signInWithEmail,
        signUpWithEmail,
        logout,
        switchUser,
        navigateTo,
        openTaskDetail,
        closeTaskDetail,
        setTaskFilterState,
        showToast,
        dismissToast,
        createTask,
        employeeUpdateTask,
        updateTaskMetadata,
        deleteTask,
        createUser,
        toggleUserActive,
        resetUserPin,
        changeUserRole,
        deleteUser,
        createProject,
        updateProject,
        deleteProject,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
