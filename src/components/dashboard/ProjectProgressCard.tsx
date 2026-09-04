import React from 'react';
import { Project, Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { ProjectStatusBadge } from '../ui/StatusBadge';
import { FolderKanban, ArrowRight } from 'lucide-react';

interface ProjectProgressCardProps {
  projects: Project[];
  tasks: Task[];
}

export const ProjectProgressCard: React.FC<ProjectProgressCardProps> = ({ projects, tasks }) => {
  const { navigateTo, currentUser } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  const projectStats = projects.map((proj) => {
    const projTasks = tasks.filter((t) => t.projectId === proj.id);
    const total = projTasks.length;
    const completed = projTasks.filter((t) => t.status === 'DONE').length;
    const overdue = projTasks.filter((t) => t.dueDate < todayStr && t.status !== 'DONE').length;
    const blocked = projTasks.filter((t) => t.status === 'BLOCKED').length;
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      project: proj,
      total,
      completed,
      overdue,
      blocked,
      completionPct,
    };
  });

  return (
    <div
      id="card-project-progress"
      className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <FolderKanban className="w-4 h-4 stroke-[2]" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Project Delivery Progress</h3>
            <p className="text-xs text-slate-500">Client milestones & operational execution</p>
          </div>
        </div>

        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => navigateTo('/admin/projects')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {projectStats.map(({ project, total, completed, overdue, blocked, completionPct }) => (
          <div
            key={project.id}
            onClick={() => {
              const targetRoute = currentUser?.role === 'ADMIN' ? '/admin/tasks' : '/manager/tasks';
              navigateTo(targetRoute, { projectId: project.id, status: 'ALL' });
            }}
            className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/50 cursor-pointer transition-all group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {project.projectName}
                  </h4>
                  <ProjectStatusBadge status={project.status} />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Client: {project.clientName}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-900">{completionPct}%</span>
                <p className="text-[10px] text-slate-400">
                  {completed}/{total} Done
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completionPct === 100
                    ? 'bg-emerald-500'
                    : completionPct > 50
                    ? 'bg-blue-600'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${completionPct}%` }}
              />
            </div>

            {/* Sub stats */}
            <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500 font-medium">
              <span>{total - completed} active tasks</span>
              {overdue > 0 && <span className="text-rose-600 font-bold">• {overdue} overdue</span>}
              {blocked > 0 && <span className="text-rose-500 font-bold">• {blocked} blocked</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
