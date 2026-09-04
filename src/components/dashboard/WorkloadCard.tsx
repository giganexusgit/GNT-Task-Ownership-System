import React from 'react';
import { User, Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { Users, AlertCircle, ArrowRight } from 'lucide-react';

interface WorkloadCardProps {
  users: User[];
  tasks: Task[];
}

export const WorkloadCard: React.FC<WorkloadCardProps> = ({ users, tasks }) => {
  const { navigateTo, currentUser } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter to employees and managers who can be assigned tasks
  const eligibleUsers = users.filter((u) => u.active && (u.role === 'EMPLOYEE' || u.role === 'MANAGER'));

  const workloadStats = eligibleUsers.map((u) => {
    const userTasks = tasks.filter((t) => t.assignedEmployeeId === u.id);
    const active = userTasks.filter((t) => t.status !== 'DONE').length;
    const dueToday = userTasks.filter((t) => t.dueDate === todayStr && t.status !== 'DONE').length;
    const overdue = userTasks.filter((t) => t.dueDate < todayStr && t.status !== 'DONE').length;
    const blocked = userTasks.filter((t) => t.status === 'BLOCKED').length;
    const completed = userTasks.filter((t) => t.status === 'DONE').length;

    return {
      user: u,
      total: userTasks.length,
      active,
      dueToday,
      overdue,
      blocked,
      completed,
    };
  });

  const handleUserClick = (employeeId: string) => {
    const targetRoute = currentUser?.role === 'ADMIN' ? '/admin/tasks' : '/manager/tasks';
    navigateTo(targetRoute, { employeeId, status: 'ALL', quickFilter: 'all' });
  };

  return (
    <div
      id="card-team-workload"
      className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Users className="w-4 h-4 stroke-[2]" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Team Workload & Accountability</h3>
            <p className="text-xs text-slate-500">Live operational distribution across assignees</p>
          </div>
        </div>

        <button
          onClick={() => navigateTo(currentUser?.role === 'ADMIN' ? '/admin/team' : '/manager/team')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>Manage Team</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 uppercase font-semibold border-b border-slate-100 pb-2">
              <th className="py-2 font-semibold">Assignee</th>
              <th className="py-2 text-center font-semibold">Active</th>
              <th className="py-2 text-center font-semibold">Due Today</th>
              <th className="py-2 text-center font-semibold">Overdue</th>
              <th className="py-2 text-center font-semibold">Blocked</th>
              <th className="py-2 text-center font-semibold">Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workloadStats.map(({ user, active, dueToday, overdue, blocked, completed }) => (
              <tr
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                title={`Filter tasks for ${user.name}`}
              >
                <td className="py-2.5 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                      {user.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{user.department}</p>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 text-center font-bold text-slate-900">{active}</td>
                <td className="py-2.5 text-center">
                  {dueToday > 0 ? (
                    <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      {dueToday}
                    </span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="py-2.5 text-center">
                  {overdue > 0 ? (
                    <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                      {overdue}
                    </span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="py-2.5 text-center">
                  {blocked > 0 ? (
                    <span className="font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                      {blocked}
                    </span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="py-2.5 text-center font-semibold text-emerald-700">{completed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 pt-2 text-[11px] text-slate-400 text-center border-t border-slate-100">
        Click any team member to view their dedicated task accountability backlog
      </div>
    </div>
  );
};
