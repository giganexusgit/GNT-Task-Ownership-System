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

      <div className="mt-3 space-y-1.5 max-h-[360px] overflow-y-auto pr-0.5">
        {workloadStats.map(({ user, active, dueToday, overdue, blocked }) => (
          <div
            key={user.id}
            onClick={() => handleUserClick(user.id)}
              className="p-2 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/80 cursor-pointer transition-all duration-150 flex items-center justify-between gap-2.5 group"
              title={`View ${user.name}'s task backlog`}
            >
              {/* Assignee Identity */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                  {user.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user.department || user.role}
                  </p>
                </div>
              </div>

              {/* Status & Workload Badges */}
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                {/* Urgent indicator tags */}
                {blocked > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200" title={`${blocked} blocked`}>
                    {blocked} blocked
                  </span>
                )}
                {overdue > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200" title={`${overdue} overdue`}>
                    {overdue} overdue
                  </span>
                )}
                {dueToday > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200" title={`${dueToday} due today`}>
                    {dueToday} today
                  </span>
                )}

                {/* Active workload count pill */}
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                  {active} active
                </span>

                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors hidden sm:block" />
              </div>
            </div>
          ))}
      </div>

      <div className="mt-3 pt-2 text-[11px] text-slate-400 text-center border-t border-slate-100">
        Click any team member to view their live task deliverables
      </div>
    </div>
  );
};
