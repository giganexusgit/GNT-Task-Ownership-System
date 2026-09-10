import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskPriority, TaskAttachment } from '../../types';
import { X, Check, Calendar, AlertCircle, Link, FileText, User as UserIcon } from 'lucide-react';
import { DocumentUploadSection } from './DocumentUploadSection';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({ isOpen, onClose }) => {
  const { projects, users, createTask, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectInput, setProjectInput] = useState(
    projects[0] ? `${projects[0].projectName} (${projects[0].clientName})` : ''
  );
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(
    users.find((u) => u.active && u.role === 'EMPLOYEE')?.id || ''
  );
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [nextAction, setNextAction] = useState('');
  const [notes, setNotes] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [estimatedEffort, setEstimatedEffort] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Eligible assignees (active users)
  const assignees = users.filter((u) => u.active);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Task description is required.');
      return;
    }

    if (!assignedEmployeeId) {
      setError('An assigned owner is required.');
      return;
    }
    if (!dueDate) {
      setError('Due date deadline is required.');
      return;
    }


    setLoading(true);
    const res = await createTask({
      title,
      description,
      projectId: projectInput.trim(),
      assignedEmployeeId,
      priority,
      dueDate,
      nextAction,
      notes,
      referenceLink,
      estimatedEffort,
      attachments,
    });
    setLoading(false);

    if (res.success) {
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setProjectInput('');
      setNextAction('');
      setNotes('');
      setReferenceLink('');
      setEstimatedEffort('');
      setAttachments([]);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in overflow-x-hidden">
      <div
        id="modal-create-task"
        className="w-full max-w-2xl min-w-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between min-w-0">
          <div className="min-w-0 pr-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">Create & Assign New Task</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">Every deliverable must have one owner, one deadline, and one next action</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden space-y-4 text-xs min-w-0">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="task-title-input" className="block font-bold text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              placeholder="e.g. Implement RBAC authorization middleware and unit checks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description-input" className="block font-bold text-slate-700 mb-1">
              Description & Deliverable Scope <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="task-description-input"
              rows={3}
              required
              placeholder="Provide exact context, expected criteria, and technical or operational constraints..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs leading-relaxed"
            />
          </div>

          {/* Project & Assignee Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-project-input" className="block font-bold text-slate-700 mb-1">
                Project or Client
              </label>
              <input
                id="task-project-input"
                type="text"
                // required
                list="project-suggestions-create"
                placeholder="e.g. Phoenix Enterprise Cloud (Phoenix Financial)"
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs bg-white"
              />
              <datalist id="project-suggestions-create">
                {projects.map((p) => (
                  <option key={p.id} value={`${p.projectName} (${p.clientName})`}>
                    {p.projectName}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="task-assignee-select" className="block font-bold text-slate-700 mb-1">
                Assigned Owner (Single Accountability) <span className="text-rose-500">*</span>
              </label>
              <select
                id="task-assignee-select"
                required
                value={assignedEmployeeId}
                onChange={(e) => setAssignedEmployeeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs bg-white"
              >
                {assignees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.department || u.role} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Due Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority-select" className="block font-bold text-slate-700 mb-1">
                Priority Level <span className="text-rose-500">*</span>
              </label>
              <select
                id="task-priority-select"
                required
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs bg-white"
              >
                <option value="LOW">Low (Routine maintenance)</option>
                <option value="MEDIUM">Medium (Standard deliverable)</option>
                <option value="HIGH">High (Key business milestone)</option>
                <option value="URGENT">Urgent (Immediate blocker / client SLA)</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-due-date-input" className="block font-bold text-slate-700 mb-1">
                Hard Due Date Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                id="task-due-date-input"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs bg-white"
              >
              </input>
            </div>
          </div>

          {/* Mandatory Next Action */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1">
            <label htmlFor="task-next-action-input" className="block font-bold text-blue-950">
              Immediate Next Action<span className="text-rose-500">*</span> </label>
            <p className="text-[11px] text-blue-700">
              State the exact first physical or logical step the owner must take to begin.
            </p>
            <input
              id="task-next-action-input"
              type="text"

              placeholder="e.g. Schedule design sync with Sarah and draft API contract"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-blue-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-xs mt-1"
            />
          </div>

          {/* Documents Upload Section (PRD / FRD / Specs) */}
          <DocumentUploadSection
            attachments={attachments}
            onChange={setAttachments}
            currentUserName={currentUser?.name}
          />

          {/* Optional Supporting Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-reflink-input" className="block font-medium text-slate-600 mb-1">
                Reference Link / Docs URL (Optional)
              </label>
              <input
                id="task-reflink-input"
                type="url"
                placeholder="https://docs.google.com/..."
                value={referenceLink}
                onChange={(e) => setReferenceLink(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label htmlFor="task-effort-input" className="block font-medium text-slate-600 mb-1">
                Estimated Effort (Optional)
              </label>
              <input
                id="task-effort-input"
                type="text"
                placeholder="e.g. 6 hours / 2 sprints"
                value={estimatedEffort}
                onChange={(e) => setEstimatedEffort(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label htmlFor="task-notes-input" className="block font-medium text-slate-600 mb-1">
              Internal Planning Notes (Optional)
            </label>
            <textarea
              id="task-notes-input"
              rows={2}
              placeholder="Dependencies, stakeholder contact details, or special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors w-full sm:w-auto text-center"
            >
              Cancel
            </button>
            <button
              id="btn-submit-create-task"
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {loading
                ? 'Creating Task...'
                : attachments.length > 0
                  ? `Assign & Create Task (${attachments.length} ${attachments.length === 1 ? 'doc' : 'docs'})`
                  : 'Assign & Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
