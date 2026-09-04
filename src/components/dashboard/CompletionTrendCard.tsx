import React, { useState } from 'react';
import { Task } from '../../types';
import { TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface CompletionTrendCardProps {
  tasks: Task[];
}

export const CompletionTrendCard: React.FC<CompletionTrendCardProps> = ({ tasks }) => {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const todayStr = '2026-09-04';

  // Derive weekly milestones for September 2026
  // Week 1: Sep 1-7
  // Week 2: Sep 8-14
  // Week 3: Sep 15-21
  // Week 4: Sep 22-30
  const weeks = [
    { label: 'W1 (Sep 1–7)', start: '2026-09-01', end: '2026-09-07' },
    { label: 'W2 (Sep 8–14)', start: '2026-09-08', end: '2026-09-14' },
    { label: 'W3 (Sep 15–21)', start: '2026-09-15', end: '2026-09-21' },
    { label: 'W4 (Sep 22–30)', start: '2026-09-22', end: '2026-09-30' },
  ];

  const trendData = weeks.map((w) => {
    const dueInWeek = tasks.filter((t) => t.dueDate >= w.start && t.dueDate <= w.end);
    const completed = dueInWeek.filter((t) => t.status === 'DONE').length;
    const total = dueInWeek.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isCurrent = todayStr >= w.start && todayStr <= w.end;
    const isPast = todayStr > w.end;
    return {
      label: w.label,
      total,
      completed,
      rate,
      isCurrent,
      isPast,
    };
  });

  const totalDone = tasks.filter((t) => t.status === 'DONE').length;
  const overallRate = tasks.length > 0 ? Math.round((totalDone / tasks.length) * 100) : 0;

  return (
    <div
      id="card-completion-trend"
      className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col"
    >
      {/* Header - Consistent with TasksAttentionCard */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <TrendingUp className="w-4 h-4 stroke-[2]" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Task Completion Velocity</h3>
            <p className="text-xs text-slate-500">Real-time delivery progress against September 2026 deadlines</p>
          </div>
        </div>

        <div className="text-right flex items-baseline gap-1.5">
          <span className="text-lg font-extrabold text-slate-900">{overallRate}%</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Delivery</span>
        </div>
      </div>

      {/* Visual Chart Bars - Sits immediately under header without awkward gap */}
      <div className="mt-3.5 space-y-2.5">
        {trendData.map((d, index) => {
          const isSelected = selectedPoint === index;
          return (
            <div
              key={d.label}
              onMouseEnter={() => setSelectedPoint(index)}
              onMouseLeave={() => setSelectedPoint(null)}
              className={`p-2.5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-blue-50/60 border-blue-200 shadow-2xs'
                  : d.isCurrent
                  ? 'bg-slate-50/70 border-blue-200/70'
                  : 'bg-slate-50/40 border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{d.label}</span>
                  {d.isCurrent && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 uppercase tracking-wide">
                      Active Sprint
                    </span>
                  )}
                  {d.rate === 100 && d.total > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                      Complete
                    </span>
                  )}
                </div>
                <span className="font-bold text-slate-900">
                  {d.completed} of {d.total} tasks completed ({d.rate}%)
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    d.rate === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${d.rate}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer cleanly anchored to bottom with mt-auto */}
      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>{totalDone} Completed deliverables</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>{tasks.filter((t) => t.status !== 'DONE').length} Active in flight</span>
        </span>
      </div>
    </div>
  );
};
