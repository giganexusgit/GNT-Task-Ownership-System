import React from 'react';
import { TaskStatus, TaskPriority, ProjectStatus } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'NOT_STARTED':
      return (
        <span
          id={`status-badge-not-started`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Not Started
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span
          id={`status-badge-in-progress`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          In Progress
        </span>
      );
    case 'REVIEW':
      return (
        <span
          id={`status-badge-review`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          Review
        </span>
      );
    case 'BLOCKED':
      return (
        <span
          id={`status-badge-blocked`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          Blocked
        </span>
      );
    case 'DONE':
      return (
        <span
          id={`status-badge-done`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Done
        </span>
      );
    default:
      return null;
  }
};

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'URGENT':
      return (
        <span
          id="priority-badge-urgent"
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md bg-rose-100 text-rose-800 border border-rose-200"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          Urgent
        </span>
      );
    case 'HIGH':
      return (
        <span
          id="priority-badge-high"
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-200"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          id="priority-badge-medium"
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200"
        >
          Medium
        </span>
      );
    case 'LOW':
      return (
        <span
          id="priority-badge-low"
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-slate-50 text-slate-500 border border-slate-200"
        >
          Low
        </span>
      );
  }
};

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          Completed
        </span>
      );
    case 'ON_HOLD':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          On Hold
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-500 border border-slate-200">
          Archived
        </span>
      );
  }
};
