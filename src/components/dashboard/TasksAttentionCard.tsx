import React from 'react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../ui/StatusBadge';
import { AlertCircle, Clock, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

interface TasksAttentionCardProps {
  tasks: Task[];
}

export const TasksAttentionCard: React.FC<TasksAttentionCardProps> = ({ tasks }) => {
  const { openTaskDetail, navigateTo, currentUser } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  // Prioritize: Blocked, Overdue, Due Today, Review
  const attentionTasks = tasks
    .filter((t) => {
      if (t.status === 'DONE') return false;
      const isOverdue = t.dueDate < todayStr;
      const isDueToday = t.dueDate === todayStr;
      const isBlocked = t.status === 'BLOCKED';
      const isReview = t.status === 'REVIEW';
      return isBlocked || isOverdue || isDueToday || isReview;
    })
    .sort((a, b) => {
      // Order priority: BLOCKED (0), OVERDUE (1), DUE TODAY (2), REVIEW (3)
      const rank = (t: Task) => {
        if (t.status === 'BLOCKED') return 0;
        if (t.dueDate < todayStr) return 1;
        if (t.dueDate === todayStr) return 2;
        return 3;
      };
      return rank(a) - rank(b);
    })
    .slice(0, 4);

  return (
    <div
      id="card-tasks-requiring-attention"
      className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
            <ShieldAlert className="w-4 h-4 stroke-[2]" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tasks Requiring Attention</h3>
            <p className="text-xs text-slate-500">Early blocker detection & critical deadline warnings</p>
          </div>
        </div>

        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
          {attentionTasks.length} Urgent Item{attentionTasks.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mt-3 divide-y divide-slate-100">
        {attentionTasks.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-800">All deliverables on track</p>
            <p className="text-[11px] text-slate-400 mt-0.5">No overdue, blocked, or high-risk tasks right now</p>
          </div>
        ) : (
          attentionTasks.map((task) => {
            const isOverdue = task.dueDate < todayStr;
            const isBlocked = task.status === 'BLOCKED';

            return (
              <div
                key={task.id}
                onClick={() => openTaskDetail(task.id)}
                className="py-2 px-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusBadge status={task.status} size="sm" />
                      <PriorityBadge priority={task.priority} />
                      {isOverdue && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                          OVERDUE ({task.dueDate})
                        </span>
                      )}
                      {!isOverdue && task.dueDate === todayStr && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          DUE TODAY
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {task.title}
                    </p>

                    {/* Blocker alert callout if blocked */}
                    {isBlocked && task.blocker && (
                      <div className="mt-1.5 p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          <strong>Blocker:</strong> {task.blocker}
                        </span>
                      </div>
                    )}

                    {/* Next Action visible */}
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Owner:</span>
                      <span className="text-slate-900 font-medium">{task.assignedEmployeeName}</span>
                      <span>•</span>
                      <span className="text-slate-400 truncate">
                        Next: <span className="text-slate-600">{task.nextAction}</span>
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 shrink-0 mt-2 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={() => {
            const targetRoute = currentUser?.role === 'ADMIN' ? '/admin/tasks' : '/manager/tasks';
            navigateTo(targetRoute, { quickFilter: 'blocked' });
          }}
          className="font-semibold text-rose-600 hover:text-rose-800"
        >
          View all blocked ({tasks.filter((t) => t.status === 'BLOCKED').length})
        </button>
        <button
          onClick={() => {
            const targetRoute = currentUser?.role === 'ADMIN' ? '/admin/tasks' : '/manager/tasks';
            navigateTo(targetRoute, { quickFilter: 'overdue' });
          }}
          className="font-semibold text-blue-600 hover:text-blue-800"
        >
          View all overdue ({tasks.filter((t) => t.dueDate < todayStr && t.status !== 'DONE').length})
        </button>
      </div>
    </div>
  );
};
