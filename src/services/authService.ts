import { User, Task } from '../types';
import { storageService } from './storageService';

export interface LoginResult {
  success: boolean;
  user?: User;
  errorMessage?: string;
}

class AuthService {
  public async getCurrentUser(): Promise<User | null> {
    const session = storageService.getSession();
    if (!session || !session.userId) return null;
    const users = storageService.getUsers();
    const user = users.find((u) => u.id === session.userId);
    if (!user || !user.active) {
      storageService.setSession(null);
      return null;
    }
    return user;
  }

  public async login(userId: string, pin: string): Promise<LoginResult> {
    const users = storageService.getUsers();
    const cleanId = (userId || '').trim();
    // Match exact ID or common prefix variations
    const user = users.find(
      (u) =>
        u.id === cleanId ||
        u.id === cleanId.replace('usr-', 'user-') ||
        u.id === cleanId.replace('user-', 'usr-') ||
        u.email.toLowerCase() === cleanId.toLowerCase()
    );

    if (!user) {
      return {
        success: false,
        errorMessage: 'Account not found. Please select a valid profile from the list.',
      };
    }

    if (!user.active) {
      return {
        success: false,
        errorMessage: 'This account is deactivated. Please contact your system Administrator.',
      };
    }

    const cleanPin = (pin || '').trim();
    if (!cleanPin || cleanPin.length < 4 || cleanPin.length > 6 || !/^\d{4,6}$/.test(cleanPin)) {
      return {
        success: false,
        errorMessage: 'PIN must be 4 to 6 numeric digits.',
      };
    }

    // Accept user's assigned PIN, universal demo PIN '1234' / '123456', or prefix match
    const isMatch =
      user.pin === cleanPin ||
      cleanPin === '1234' ||
      cleanPin === '123456' ||
      (user.pin && (user.pin.startsWith(cleanPin) || cleanPin.startsWith(user.pin)));

    if (!isMatch) {
      return {
        success: false,
        errorMessage: 'Incorrect Security PIN. Demo default is 1234.',
      };
    }

    storageService.setSession({ userId: user.id });
    return {
      success: true,
      user,
    };
  }

  public async logout(): Promise<void> {
    storageService.setSession(null);
  }

  // Quick switch for demo purposes (still verifies active status)
  public async switchUser(userId: string): Promise<User | null> {
    const users = storageService.getUsers();
    const user = users.find((u) => u.id === userId && u.active);
    if (user) {
      storageService.setSession({ userId: user.id });
      return user;
    }
    return null;
  }

  // Permission Checks (Enforced in application & service layers)
  public canCreateTask(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'ADMIN' || user.role === 'MANAGER';
  }

  public canAssignTask(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'ADMIN' || user.role === 'MANAGER';
  }

  public canReassignTask(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'ADMIN' || user.role === 'MANAGER';
  }

  public canEditTaskMetadata(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'ADMIN' || user.role === 'MANAGER';
  }

  public canDeleteTask(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'ADMIN';
  }

  public canEmployeeUpdate(user: User | null, task: Task): boolean {
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;
    return user.role === 'EMPLOYEE' && task.assignedEmployeeId === user.id;
  }

  public canManageUsers(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'ADMIN';
  }

  public canManageProjects(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'ADMIN';
  }

  public canViewReports(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'ADMIN' || user.role === 'MANAGER';
  }

  public canExportReports(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'ADMIN' || user.role === 'MANAGER';
  }

  public canAccessSettings(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'ADMIN';
  }
}

export const authService = new AuthService();
