import React from 'react';
import { useApp } from '../../context/AppContext';
import { BentoKpiCard } from '../../components/dashboard/BentoKpiCard';
import { WorkloadCard } from '../../components/dashboard/WorkloadCard';
import { TasksAttentionCard } from '../../components/dashboard/TasksAttentionCard';
import { ProjectProgressCard } from '../../components/dashboard/ProjectProgressCard';
import { CompletionTrendCard } from '../../components/dashboard/CompletionTrendCard';
import { getLocalDateString } from '../../utils/dateUtils';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Plus,
} from 'lucide-react';

interface ManagerDashboardProps {
  onOpenCreateTask: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onOpenCreateTask }) => {
  const { tasks, users, projects, navigateTo, currentUser } = useApp();
  const todayStr = getLocalDateString();

  const totalTasks = tasks.length;
  const activeTasks = tasks.filter((t) => t.status !== 'DONE').length;
  const dueTodayTasks = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'DONE').length;
  const overdueTasks = tasks.filter((t) => t.dueDate < todayStr && t.status !== 'DONE').length;
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED').length;
  const reviewTasks = tasks.filter((t) => t.status === 'REVIEW').length;
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;

  return (
    <div id="manager-dashboard-view" className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Welcome, {currentUser?.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operations & Team Delivery Command Center • {currentUser?.department || 'Operations'}
          </p>
        </div>

        <button
          id="btn-manager-create-task"
          onClick={onOpenCreateTask}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Deliverable</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <BentoKpiCard
          label="Total Deliverables"
          value={totalTasks}
          subtext="All tracked tasks"
          icon={CheckSquare}
          colorScheme="slate"
          onClick={() => navigateTo('/manager/tasks', { quickFilter: 'all' })}
        />

        <BentoKpiCard
          label="Active in Flight"
          value={activeTasks}
          subtext="In progress or review"
          icon={Clock}
          colorScheme="blue"
          onClick={() => navigateTo('/manager/tasks', { status: 'IN_PROGRESS' })}
        />

        <BentoKpiCard
          label="Due Today"
          value={dueTodayTasks}
          subtext="Today's deadlines"
          icon={Calendar}
          colorScheme="amber"
          isUrgent={dueTodayTasks > 0}
          onClick={() => navigateTo('/manager/tasks', { quickFilter: 'today' })}
        />

        <BentoKpiCard
          label="Overdue Warnings"
          value={overdueTasks}
          subtext="Past deadline"
          icon={AlertCircle}
          colorScheme="rose"
          isUrgent={overdueTasks > 0}
          onClick={() => navigateTo('/manager/tasks', { quickFilter: 'overdue' })}
        />

        <BentoKpiCard
          label="Pending Review"
          value={reviewTasks}
          subtext="Ready for sign-off"
          icon={Clock}
          colorScheme="purple"
          isUrgent={reviewTasks > 0}
          onClick={() => navigateTo('/manager/tasks', { status: 'REVIEW' })}
        />

        <BentoKpiCard
          label="Completed"
          value={completedTasks}
          subtext="Delivered work"
          icon={CheckCircle2}
          colorScheme="emerald"
          onClick={() => navigateTo('/manager/tasks', { quickFilter: 'completed' })}
        />
      </div>

      {/* Attention & Workload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TasksAttentionCard tasks={tasks} />
        <WorkloadCard users={users} tasks={tasks} />
      </div>

      {/* Projects & Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CompletionTrendCard tasks={tasks} />
        <ProjectProgressCard projects={projects} tasks={tasks} />
      </div>
    </div>
  );
};
