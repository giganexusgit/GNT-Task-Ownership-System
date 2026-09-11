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
      bg: 'bg-blue-50/80 border-blue-200/60',
      iconColor: 'text-blue-600',
      borderHover: 'hover:border-blue-400 hover:shadow-blue-500/10',
      badgeBg: 'bg-blue-100 text-blue-800',
      accentGlow: 'from-blue-500/10 to-transparent',
    },
    slate: {
      bg: 'bg-slate-50 border-slate-200/70',
      iconColor: 'text-slate-600',
      borderHover: 'hover:border-slate-300 hover:shadow-slate-500/10',
      badgeBg: 'bg-slate-100 text-slate-700',
      accentGlow: 'from-slate-500/10 to-transparent',
    },
    amber: {
      bg: 'bg-amber-50/80 border-amber-200/60',
      iconColor: 'text-amber-600',
      borderHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
      badgeBg: 'bg-amber-100 text-amber-800',
      accentGlow: 'from-amber-500/10 to-transparent',
    },
    rose: {
      bg: 'bg-rose-50/80 border-rose-200/60',
      iconColor: 'text-rose-600',
      borderHover: 'hover:border-rose-400 hover:shadow-rose-500/10',
      badgeBg: 'bg-rose-100 text-rose-800',
      accentGlow: 'from-rose-500/10 to-transparent',
    },
    emerald: {
      bg: 'bg-emerald-50/80 border-emerald-200/60',
      iconColor: 'text-emerald-600',
      borderHover: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      accentGlow: 'from-emerald-500/10 to-transparent',
    },
    purple: {
      bg: 'bg-purple-50/80 border-purple-200/60',
      iconColor: 'text-purple-600',
      borderHover: 'hover:border-purple-400 hover:shadow-purple-500/10',
      badgeBg: 'bg-purple-100 text-purple-800',
      accentGlow: 'from-purple-500/10 to-transparent',
    },
  };

  const scheme = colorMap[colorScheme];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`group relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-all duration-200 flex flex-col justify-between ${
        onClick
          ? `cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${scheme.borderHover}`
          : ''
      }`}
    >
      {/* Subtle top ambient glow gradient */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${scheme.accentGlow}`}
      />

      <div className="flex items-center justify-between">
        <div
          className={`w-9 h-9 rounded-xl border ${scheme.bg} flex items-center justify-center ${scheme.iconColor} shadow-2xs group-hover:scale-105 transition-transform duration-200`}
        >
          <Icon className="w-4 h-4 stroke-[2.2]" />
        </div>
        {trend && (
          <span
            className={`text-[10px] font-bold tracking-tight px-2 py-0.5 rounded-full ${scheme.badgeBg}`}
          >
            {trend}
          </span>
        )}
        {onClick && !trend && (
          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 transition-colors shrink-0" />
        )}
      </div>

      <div className="mt-3.5">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
            {value}
          </span>
          {isUrgent && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          )}
        </div>
        <p className="text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-wider line-clamp-1">
          {label}
        </p>
        {subtext && (
          <p className="text-[11px] text-slate-400 mt-0.5 font-normal truncate">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

