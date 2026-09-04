import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id = 'empty-state',
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div
      id={id}
      className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-white border border-slate-200/80 p-8 my-4"
    >
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3 border border-slate-200/60">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
