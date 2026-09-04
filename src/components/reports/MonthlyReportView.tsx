import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GntLogo } from '../common/GntLogo';
import { reportService, GeneratedMonthlyReport } from '../../services/reportService';
import { MonthlyReportFilter, TaskStatus, TaskPriority } from '../../types';
import { StatusBadge, PriorityBadge, ProjectStatusBadge } from '../ui/StatusBadge';
import {
  FileBarChart2,
  Download,
  Printer,
  Calendar,
  Filter,
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Search,
  RotateCcw,
} from 'lucide-react';

export const MonthlyReportView: React.FC = () => {
  const { users, projects, showToast } = useApp();

  // Selected Month (Default: '2026-09')
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'ALL'>('ALL');
  const [dueDateFrom, setDueDateFrom] = useState<string>('');
  const [dueDateTo, setDueDateTo] = useState<string>('');

  const filter: MonthlyReportFilter = useMemo(
    () => ({
      month: selectedMonth,
      employeeId: selectedEmployeeId || undefined,
      projectId: selectedProjectId || undefined,
      status: selectedStatus,
      priority: selectedPriority,
      dueDateFrom: dueDateFrom || undefined,
      dueDateTo: dueDateTo || undefined,
    }),
    [selectedMonth, selectedEmployeeId, selectedProjectId, selectedStatus, selectedPriority, dueDateFrom, dueDateTo]
  );

  // Generate dynamic real report from current storage data
  const report: GeneratedMonthlyReport = useMemo(() => {
    return reportService.generateMonthlyReport(filter);
  }, [filter]);

  const handleExportCSV = () => {
    reportService.exportReportToCSV(report);
    showToast(
      'Report Exported Successfully',
      `Monthly operational review report (${selectedMonth}) exported as CSV`,
      'success'
    );
  };

  const handlePrint = () => {
    showToast(
      'Print Preview Initialized',
      'Opening browser print preview dialog for executive PDF archiving',
      'info'
    );
    setTimeout(() => window.print(), 200);
  };

  const handleResetFilters = () => {
    setSelectedEmployeeId('');
    setSelectedProjectId('');
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
    setDueDateFrom('');
    setDueDateTo('');
    showToast(
      'Report Filters Reset',
      'All review filters have been restored to defaults',
      'info'
    );
  };

  // Available month selection options (last 6 months and next 3 months)
  const monthOptions = [
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-09', label: 'September 2026 (Current Review Cycle)' },
    { value: '2026-10', label: 'October 2026' },
  ];

  return (
    <div id="monthly-report-view" className="space-y-6">
      {/* Top Filter and Actions Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 no-print">
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <label htmlFor="select-report-month" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Review Cycle Period
            </label>
            <select
              id="select-report-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="font-bold text-slate-900 text-sm bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Employee Filter (Great for 1-on-1 reviews) */}
          <select
            id="report-filter-employee"
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:ring-1 focus:ring-blue-500 max-w-[150px] truncate"
          >
            <option value="">All Team Members</option>
            {users
              .filter((u) => u.active)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>

          {/* Project Filter */}
          <select
            id="report-filter-project"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:ring-1 focus:ring-blue-500 max-w-[140px] truncate"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectName}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="report-filter-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="BLOCKED">Blocked</option>
            <option value="DONE">Done</option>
          </select>

          {/* Reset button */}
          {(selectedEmployeeId || selectedProjectId || selectedStatus !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              title="Reset report filters"
              className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Export CSV Button */}
          <button
            id="btn-export-report-csv"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Print / Save PDF Button */}
          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <div className="flex justify-center mb-2">
          <GntLogo variant="full" size="md" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
          GNT Task Ownership System — Monthly Performance Review
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Reporting Cycle: {report.monthLabel} • Generated: {new Date(report.generatedAt).toLocaleString()}
        </p>
      </div>

      {/* Section 1: Summary Metrics Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Monthly Deliverables & Velocity Summary
          </h2>
          <span className="text-xs text-slate-400">
            {report.summary.totalTasks} total planned & active deliverables in scope
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Tasks */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Deliverables</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{report.summary.totalTasks}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Assigned scope</p>
          </div>

          {/* Completed */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-600">Completed</span>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{report.summary.completed}</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">{report.summary.completionRate}% completion rate</p>
          </div>

          {/* On-Time Completion */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-blue-600">On-Time Delivery</span>
            <p className="text-2xl font-extrabold text-blue-700 mt-1">{report.summary.onTimeCompletion}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Delivered on/before due date</p>
          </div>

          {/* Active in flight */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">Active in Flight</span>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{report.summary.active}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Progressing</p>
          </div>

          {/* Overdue */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-rose-600">Overdue</span>
            <p className="text-2xl font-extrabold text-rose-700 mt-1">{report.summary.overdue}</p>
            <p className="text-[10px] text-rose-600 mt-0.5">Past deadline</p>
          </div>

          {/* Blocked */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-rose-700">Blocked</span>
            <p className="text-2xl font-extrabold text-rose-800 mt-1">{report.summary.blocked}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Requires manager action</p>
          </div>
        </div>
      </div>

      {/* Section 2: Employee Performance Summary Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Employee Accountability & Review Table
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Evaluates on-time execution, active backlog, and blocker frequencies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table id="table-report-employee-performance" className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200/80 text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Team Member</th>
                <th className="py-2.5 px-3">Role & Dept</th>
                <th className="py-2.5 px-3 text-center">Assigned</th>
                <th className="py-2.5 px-3 text-center">Completed</th>
                <th className="py-2.5 px-3 text-center">Active</th>
                <th className="py-2.5 px-3 text-center">Overdue</th>
                <th className="py-2.5 px-3 text-center">Blocked</th>
                <th className="py-2.5 px-3 text-center">Completion Rate</th>
                <th className="py-2.5 px-4 text-center">On-Time Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.employeePerformance.map((emp) => (
                <tr key={emp.employeeId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{emp.employeeName}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <span className="font-semibold text-slate-800">{emp.role}</span>
                    <span className="text-slate-400"> • {emp.department}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-900">{emp.assigned}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{emp.completed}</td>
                  <td className="py-2.5 px-3 text-center text-slate-700">{emp.active}</td>
                  <td className="py-2.5 px-3 text-center">
                    {emp.overdue > 0 ? (
                      <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                        {emp.overdue}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {emp.blocked > 0 ? (
                      <span className="font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                        {emp.blocked}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-bold text-slate-900">{emp.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        emp.onTimeCompletionRate >= 80
                          ? 'bg-emerald-50 text-emerald-700'
                          : emp.onTimeCompletionRate >= 50
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {emp.onTimeCompletionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Project Performance Summary Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Project Delivery & Client Health
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Aggregated milestone progress</span>
        </div>

        <div className="overflow-x-auto">
          <table id="table-report-project-summary" className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200/80 text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Project</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Deliverables</th>
                <th className="py-2.5 px-3 text-center">Completed</th>
                <th className="py-2.5 px-3 text-center">Active</th>
                <th className="py-2.5 px-3 text-center">Overdue</th>
                <th className="py-2.5 px-3 text-center">Blocked</th>
                <th className="py-2.5 px-4 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.projectPerformance.map((p) => (
                <tr key={p.projectId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{p.projectName}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-medium">{p.clientName}</td>
                  <td className="py-2.5 px-3">
                    <ProjectStatusBadge status={p.status} />
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-900">{p.totalTasks}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{p.completed}</td>
                  <td className="py-2.5 px-3 text-center text-slate-700">{p.active}</td>
                  <td className="py-2.5 px-3 text-center">
                    {p.overdue > 0 ? (
                      <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                        {p.overdue}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {p.blocked > 0 ? (
                      <span className="font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                        {p.blocked}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-blue-700">{p.completionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Detailed Task Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Detailed Deliverables Breakdown ({report.detailedTasks.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Shows deadlines, completion timeliness, and recorded next action
          </span>
        </div>

        <div className="overflow-x-auto">
          <table id="table-report-detailed-tasks" className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200/80 text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Task Deliverable</th>
                <th className="py-2.5 px-3">Owner</th>
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3">Deadline</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Delivery Outcome</th>
                <th className="py-2.5 px-4 min-w-[220px]">Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.detailedTasks.map((t) => (
                <tr key={t.taskId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900 max-w-[260px] truncate">
                    {t.title}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">
                    {t.ownerName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{t.projectName}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">{t.dueDate}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge status={t.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {t.status === 'DONE' ? (
                      t.isOnTime ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>On-Time</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3" />
                          <span>Delayed Completion</span>
                        </span>
                      )
                    ) : t.isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3" />
                        <span>Overdue</span>
                      </span>
                    ) : t.status === 'BLOCKED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                        <span>Blocked</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500">In Progress</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 max-w-[280px]">
                    <span className="text-slate-700 line-clamp-1">{t.nextAction}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
