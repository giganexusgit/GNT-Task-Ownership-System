import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface BentoKpiCardProps {
  id?: string;
  label: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  colorScheme?: 'blue' | 'slate' | 'amber' | 'rose' | 'emerald' | 'purple';
  onClick?: () => void;
  trend?: string;
  isUrgent?: boolean;
}

export const BentoKpiCard: React.FC<BentoKpiCardProps> = ({
  id,
  label,
  value,
  subtext,
  icon: Icon,
  colorScheme = 'slate',
  onClick,
  trend,
  isUrgent,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/70',
      iconColor: 'text-blue-600',
      borderHover: 'hover:border-blue-300',
      badgeBg: 'bg-blue-100 text-blue-800',
    },
    slate: {
      bg: 'bg-slate-50',
      iconColor: 'text-slate-600',
      borderHover: 'hover:border-slate-300',
      badgeBg: 'bg-slate-100 text-slate-700',
    },
    amber: {
      bg: 'bg-amber-50/70',
      iconColor: 'text-amber-600',
      borderHover: 'hover:border-amber-300',
      badgeBg: 'bg-amber-100 text-amber-800',
    },
    rose: {
      bg: 'bg-rose-50/70',
      iconColor: 'text-rose-600',
      borderHover: 'hover:border-rose-300',
      badgeBg: 'bg-rose-100 text-rose-800',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      iconColor: 'text-emerald-600',
      borderHover: 'hover:border-emerald-300',
      badgeBg: 'bg-emerald-100 text-emerald-800',
    },
    purple: {
      bg: 'bg-indigo-50/70',
      iconColor: 'text-indigo-600',
      borderHover: 'hover:border-indigo-300',
      badgeBg: 'bg-indigo-100 text-indigo-800',
    },
  };

  const scheme = colorMap[colorScheme];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`group relative p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md ' + scheme.borderHover : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl ${scheme.bg} flex items-center justify-center ${scheme.iconColor}`}>
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>
        {trend && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${scheme.badgeBg}`}>
            {trend}
          </span>
        )}
        {onClick && !trend && (
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
          {isUrgent && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Requires immediate review" />
          )}
        </div>
        <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{label}</p>
        {subtext && <p className="text-[11px] text-slate-400 mt-0.5 font-normal">{subtext}</p>}
      </div>
    </div>
  );
};
