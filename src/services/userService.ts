import { User, UserRole } from '../types';
import { storageService } from './storageService';
import { authService } from './authService';

class UserService {
  public async getUsers(): Promise<User[]> {
    return storageService.getUsers();
  }

  public async getUserById(id: string): Promise<User | null> {
    const users = storageService.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  public async getActiveUsers(): Promise<User[]> {
    const users = storageService.getUsers();
    return users.filter((u) => u.active);
  }

  public async getActiveEmployees(): Promise<User[]> {
    const users = storageService.getUsers();
    return users.filter((u) => u.active && (u.role === 'EMPLOYEE' || u.role === 'MANAGER'));
  }

  public async createUser(
    userData: {
      name: string;
      email: string;
      role: UserRole;
      pin: string;
      department?: string;
      active?: boolean;
    },
    actor: User
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    if (!authService.canManageUsers(actor)) {
      return { success: false, message: 'Unauthorized: Only Admins can add team members.' };
    }

    if (!userData.name.trim()) return { success: false, message: 'Name is required.' };
    if (!userData.email.trim() || !userData.email.includes('@')) {
      return { success: false, message: 'A valid work email is required.' };
    }
    const cleanPin = (userData.pin || '').trim();
    if (!cleanPin || cleanPin.length < 4 || cleanPin.length > 6 || !/^\d{4,6}$/.test(cleanPin)) {
      return { success: false, message: 'PIN must be 4 to 6 numeric digits.' };
    }

    const users = storageService.getUsers();
    if (users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase().trim())) {
      return { success: false, message: 'A user with this email address already exists.' };
    }

    const initials = userData.name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0].toUpperCase())
      .slice(0, 2)
      .join('');

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      role: userData.role,
      pin: userData.pin,
      active: userData.active ?? true,
      initials: initials || 'U',
      department: userData.department?.trim() || 'Operations',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    storageService.setUsers(users);

    return { success: true, user: newUser, message: 'Team member added successfully.' };
  }

  public async toggleUserActive(
    userId: string,
    actor: User
  ): Promise<{ success: boolean; message: string; user?: User }> {
    if (!authService.canManageUsers(actor)) {
      return { success: false, message: 'Unauthorized: Only Admins can change user activation status.' };
    }

    const users = storageService.getUsers();
    const targetIndex = users.findIndex((u) => u.id === userId);
    if (targetIndex === -1) return { success: false, message: 'User not found.' };

    const targetUser = users[targetIndex];

    // Safety check: Prevent deactivating the last active Admin
    if (targetUser.role === 'ADMIN' && targetUser.active) {
      const activeAdmins = users.filter((u) => u.role === 'ADMIN' && u.active);
      if (activeAdmins.length <= 1) {
        return {
          success: false,
          message: 'Action prohibited: Cannot deactivate the only active Administrator in the system.',
        };
      }
    }

    targetUser.active = !targetUser.active;
    targetUser.updatedAt = new Date().toISOString();
    users[targetIndex] = targetUser;
    storageService.setUsers(users);

    const actionWord = targetUser.active ? 'activated' : 'deactivated';
    return {
      success: true,
      message: `User ${targetUser.name} has been ${actionWord}.`,
      user: targetUser,
    };
  }

  public async resetPin(
    userId: string,
    newPin: string,
    actor: User
  ): Promise<{ success: boolean; message: string }> {
    if (!authService.canManageUsers(actor) && actor.id !== userId) {
      return { success: false, message: 'Unauthorized: You do not have permission to reset this PIN.' };
    }

    const cleanPin = (newPin || '').trim();
    if (!cleanPin || cleanPin.length < 4 || cleanPin.length > 6 || !/^\d{4,6}$/.test(cleanPin)) {
      return { success: false, message: 'PIN must be 4 to 6 numeric digits.' };
    }

    const users = storageService.getUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'User not found.' };

    target.pin = newPin;
    target.updatedAt = new Date().toISOString();
    storageService.setUsers(users);

    return { success: true, message: `PIN for ${target.name} reset successfully.` };
  }

  public async updateUser(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'createdAt'>>,
    actor: User
  ): Promise<{ success: boolean; message: string; user?: User }> {
    if (!authService.canManageUsers(actor) && actor.id !== userId) {
      return { success: false, message: 'Unauthorized to edit user details.' };
    }

    const users = storageService.getUsers();
    const targetIndex = users.findIndex((u) => u.id === userId);
    if (targetIndex === -1) return { success: false, message: 'User not found.' };

    // Prevent changing the last admin role
    if (users[targetIndex].role === 'ADMIN' && updates.role && updates.role !== 'ADMIN') {
      const activeAdmins = users.filter((u) => u.role === 'ADMIN' && u.active);
      if (activeAdmins.length <= 1) {
        return { success: false, message: 'Cannot demote the only remaining Administrator.' };
      }
    }

    const updatedUser: User = {
      ...users[targetIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.name) {
      updatedUser.initials = updates.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0].toUpperCase())
        .slice(0, 2)
        .join('');
    }

    users[targetIndex] = updatedUser;
    storageService.setUsers(users);

    return { success: true, message: 'User updated successfully.', user: updatedUser };
  }
}

export const userService = new UserService();
