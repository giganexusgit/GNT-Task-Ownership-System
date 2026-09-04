import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';
import {
  Users,
  Plus,
  KeyRound,
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

interface TeamTableProps {
  onOpenAddUser: () => void;
  onOpenResetPin: (user: User) => void;
}

export const TeamTable: React.FC<TeamTableProps> = ({ onOpenAddUser, onOpenResetPin }) => {
  const { users, tasks, currentUser, toggleUserActive, navigateTo } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const canManageUsers = authService.canManageUsers(currentUser);

  let filtered = users.filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter & Add Team Member */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-team-search"
            type="text"
            placeholder="Search by team member name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            id="select-team-role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admins</option>
            <option value="MANAGER">Managers</option>
            <option value="EMPLOYEE">Employees</option>
          </select>

          {canManageUsers && (
            <button
              id="btn-add-team-member"
              onClick={onOpenAddUser}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Team Member Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="table-team-members" className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200/80 text-[11px] tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3 text-center">Active Tasks</th>
                <th className="py-3 px-3 text-center">Completed</th>
                <th className="py-3 px-3">Status</th>
                {canManageUsers && <th className="py-3 px-4 text-right">Admin Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => {
                const userTasks = tasks.filter((t) => t.assignedEmployeeId === u.id);
                const activeCount = userTasks.filter((t) => t.status !== 'DONE').length;
                const completedCount = userTasks.filter((t) => t.status === 'DONE').length;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Member */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200/60">
                          {u.initials}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : u.role === 'MANAGER'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {u.department || 'Operations'}
                    </td>

                    {/* Active Tasks */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          const targetRoute = currentUser?.role === 'ADMIN' ? '/admin/tasks' : '/manager/tasks';
                          navigateTo(targetRoute, { employeeId: u.id, status: 'ALL' });
                        }}
                        className="font-bold text-blue-600 hover:underline px-2 py-0.5 rounded bg-blue-50"
                      >
                        {activeCount}
                      </button>
                    </td>

                    {/* Completed Tasks */}
                    <td className="py-3 px-3 text-center font-semibold text-emerald-700">
                      {completedCount}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {u.active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <UserX className="w-3 h-3" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>

                    {/* Admin Actions */}
                    {canManageUsers && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-reset-pin-${u.id}`}
                            onClick={() => onOpenResetPin(u)}
                            title="Reset 4-Digit Security PIN"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-1"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-semibold">PIN</span>
                          </button>

                          <button
                            id={`btn-toggle-active-${u.id}`}
                            onClick={() => toggleUserActive(u.id)}
                            title={u.active ? 'Deactivate Member' : 'Reactivate Member'}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                              u.active
                                ? 'text-rose-600 hover:bg-rose-50 border border-slate-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200 bg-emerald-50/50'
                            }`}
                          >
                            {u.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
