import React from 'react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../ui/StatusBadge';
<<<<<<< HEAD
import { AlertCircle, Clock, ShieldAlert, ArrowRight, CheckCircle2, User, ChevronRight } from 'lucide-react';
=======
import { AlertCircle, Clock, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getLocalDateString } from '../../utils/dateUtils';
>>>>>>> origin/main

interface TasksAttentionCardProps {
  tasks: Task[];
}

export const TasksAttentionCard: React.FC<TasksAttentionCardProps> = ({ tasks }) => {
  const { openTaskDetail, navigateTo, currentUser } = useApp();
  const todayStr = getLocalDateString();

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
      className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
    >
<<<<<<< HEAD
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
            <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tasks Requiring Attention</h3>
=======
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-600 shadow-2xs">
            <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Tasks Requiring Attention</h3>
>>>>>>> origin/main
            <p className="text-[11px] text-slate-500">Early blocker detection & critical deadline warnings</p>
          </div>
        </div>

<<<<<<< HEAD
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/70">
=======
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/70 text-rose-700">
>>>>>>> origin/main
          {attentionTasks.length} Urgent Item{attentionTasks.length === 1 ? '' : 's'}
        </span>
      </div>

<<<<<<< HEAD
      {/* Task List */}
      <div className="mt-3.5 space-y-2.5">
        {attentionTasks.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-800">All deliverables on track</p>
=======
      <div className="mt-3 divide-y divide-slate-100/90">
        {attentionTasks.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 border border-emerald-200/60">
              <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            </div>
            <p className="text-xs font-bold text-slate-800">All deliverables on track</p>
>>>>>>> origin/main
            <p className="text-[11px] text-slate-400 mt-0.5">No overdue, blocked, or high-risk tasks right now</p>
          </div>
        ) : (
          attentionTasks.map((task) => {
            const isOverdue = task.dueDate < todayStr;
            const isBlocked = task.status === 'BLOCKED';
            const isDueToday = task.dueDate === todayStr;

            // Card border accent based on issue type
            let accentBg = 'bg-slate-50/80 hover:bg-slate-100/70 border-slate-200/80';
            let borderLeft = 'border-l-4 border-l-slate-300';
            let issueReasonTag = null;

            if (isBlocked) {
              accentBg = 'bg-rose-50/30 hover:bg-rose-50/60 border-rose-200/80';
              borderLeft = 'border-l-4 border-l-rose-500';
              issueReasonTag = (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 tracking-wide uppercase flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                  Blocked
                </span>
              );
            } else if (isOverdue) {
              accentBg = 'bg-rose-50/20 hover:bg-rose-50/50 border-rose-200/60';
              borderLeft = 'border-l-4 border-l-rose-400';
              issueReasonTag = (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 tracking-wide uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-600 shrink-0" />
                  Overdue ({task.dueDate})
                </span>
              );
            } else if (isDueToday) {
              accentBg = 'bg-amber-50/30 hover:bg-amber-50/60 border-amber-200/70';
              borderLeft = 'border-l-4 border-l-amber-500';
              issueReasonTag = (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 tracking-wide uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                  Due Today
                </span>
              );
            } else if (task.status === 'REVIEW') {
              accentBg = 'bg-blue-50/20 hover:bg-blue-50/50 border-blue-200/60';
              borderLeft = 'border-l-4 border-l-blue-500';
              issueReasonTag = (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 tracking-wide uppercase">
                  Needs Review
                </span>
              );
            }

            return (
              <div
                key={task.id}
                onClick={() => openTaskDetail(task.id)}
<<<<<<< HEAD
                className={`p-3 rounded-xl border ${accentBg} ${borderLeft} cursor-pointer transition-all duration-150 group shadow-2xs`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {/* Header line: Tags & Issue Tag */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={task.status} size="sm" />
                        <PriorityBadge priority={task.priority} />
                      </div>
                      {issueReasonTag}
=======
                className="py-3 px-2.5 rounded-xl hover:bg-slate-50/80 cursor-pointer transition-all duration-150 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <StatusBadge status={task.status} size="sm" />
                      <PriorityBadge priority={task.priority} />
                      {isOverdue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200/60">
                          OVERDUE ({task.dueDate})
                        </span>
                      )}
                      {!isOverdue && task.dueDate === todayStr && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200/60">
                          DUE TODAY
                        </span>
                      )}
>>>>>>> origin/main
                    </div>

                    {/* Task Title */}
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {task.title}
                    </p>

<<<<<<< HEAD
                    {/* Blocker alert box if blocked */}
                    {isBlocked && task.blocker && (
                      <div className="p-2 rounded-lg bg-rose-100/70 border border-rose-200 text-[11px] text-rose-900 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="leading-tight">
                          <strong className="font-bold text-rose-950">Blocker Reason:</strong>{' '}
                          <span>{task.blocker}</span>
                        </div>
                      </div>
                    )}

                    {/* Footer line: Owner & Next Action */}
                    <div className="pt-0.5 flex items-center justify-between text-[11px] text-slate-500 gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[9px] font-bold flex items-center justify-center shrink-0">
                          {task.assignedEmployeeName.charAt(0)}
                        </span>
                        <span className="truncate max-w-[110px]">{task.assignedEmployeeName}</span>
                      </div>

                      {task.nextAction && (
                        <div className="text-slate-500 truncate max-w-[200px] text-[11px]">
                          <span className="text-slate-400 font-semibold">Next:</span>{' '}
                          <span className="text-slate-700 font-medium">{task.nextAction}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 shrink-0 mt-1 transition-all" />
=======
                    {/* Blocker alert callout */}
                    {isBlocked && task.blocker && (
                      <div className="mt-2 p-2 rounded-xl bg-rose-50/90 border border-rose-200/80 text-[11px] text-rose-900 flex items-start gap-2 shadow-2xs">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">
                          <strong className="font-bold text-rose-950">Blocker:</strong> {task.blocker}
                        </span>
                      </div>
                    )}

                    {/* Next Action & Owner Pill */}
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                      <div className="flex items-center gap-1 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/50">
                        <span className="text-slate-400 font-medium">Owner:</span>
                        <span className="text-slate-900 font-bold">{task.assignedEmployeeName}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="truncate text-slate-600">
                        <span className="font-semibold text-blue-700 mr-1">Next:</span>
                        <span className="truncate">{task.nextAction}</span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 shrink-0 mt-2 transition-all duration-200" />
>>>>>>> origin/main
                </div>
              </div>
            );
          })
        )}
      </div>

<<<<<<< HEAD
      {/* Footer Navigation */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
=======
      <div className="mt-auto pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
>>>>>>> origin/main
        <button
          onClick={() => {
            const targetRoute = currentUser?.role === 'ADMIN' ? '/admin/tasks' : '/manager/tasks';
            navigateTo(targetRoute, { quickFilter: 'blocked' });
          }}
<<<<<<< HEAD
          className="font-semibold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1"
=======
          className="px-3 py-1.5 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-rose-700 border border-rose-200/60 font-bold text-xs transition-colors cursor-pointer"
>>>>>>> origin/main
        >
          <span>View blocked ({tasks.filter((t) => t.status === 'BLOCKED').length})</span>
        </button>
        <button
          onClick={() => {
            const targetRoute = currentUser?.role === 'ADMIN' ? '/admin/tasks' : '/manager/tasks';
            navigateTo(targetRoute, { quickFilter: 'overdue' });
          }}
<<<<<<< HEAD
          className="font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
=======
          className="px-3 py-1.5 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/60 font-bold text-xs transition-colors cursor-pointer"
>>>>>>> origin/main
        >
          <span>View overdue ({tasks.filter((t) => t.dueDate < todayStr && t.status !== 'DONE').length})</span>
        </button>
      </div>
    </div>
  );
};
