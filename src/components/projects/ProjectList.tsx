import React, { useState } from 'react';
import { Project, ProjectStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { ProjectStatusBadge } from '../ui/StatusBadge';
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface ProjectListProps {
  onOpenCreateProject: () => void;
  onOpenEditProject: (project: Project) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  onOpenCreateProject,
  onOpenEditProject,
}) => {
  const { projects, tasks, deleteProject, navigateTo, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const canManageProjects = currentUser?.role === 'ADMIN';

  let filtered = projects.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        p.projectName.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Actions */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-project-search"
            type="text"
            placeholder="Search projects or client accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            id="select-project-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {canManageProjects && (
            <button
              id="btn-add-project"
              onClick={onOpenCreateProject}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((proj) => {
          const projTasks = tasks.filter((t) => t.projectId === proj.id);
          const total = projTasks.length;
          const completed = projTasks.filter((t) => t.status === 'DONE').length;
          const overdue = projTasks.filter((t) => t.dueDate < todayStr && t.status !== 'DONE').length;
          const blocked = projTasks.filter((t) => t.status === 'BLOCKED').length;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <div
              key={proj.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {proj.projectName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Client: <span className="text-slate-800 font-semibold">{proj.clientName}</span>
                    </p>
                  </div>
                  <ProjectStatusBadge status={proj.status} />
                </div>

                {proj.description && (
                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                )}

                {/* Progress */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-600">Completion</span>
                    <span className="font-bold text-slate-900">
                      {pct}% ({completed}/{total} tasks)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Sub counts */}
                <div className="mt-3 flex items-center gap-3 text-[11px] font-medium text-slate-500">
                  <span>{total - completed} active deliverables</span>
                  {overdue > 0 && <span className="text-rose-600 font-bold">• {overdue} overdue</span>}
                  {blocked > 0 && <span className="text-rose-500 font-bold">• {blocked} blocked</span>}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    const targetRoute = currentUser?.role === 'ADMIN' ? '/admin/tasks' : '/manager/tasks';
                    navigateTo(targetRoute, { projectId: proj.id, status: 'ALL' });
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>View Deliverables ({total})</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                {canManageProjects && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditProject(proj)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      title="Edit Project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {confirmDeleteId === proj.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={async () => {
                            await deleteProject(proj.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(proj.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
