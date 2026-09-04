import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Shield, UserCheck, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface ChangeRoleModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'ADMIN',
    title: 'Administrator',
    description: 'Full organizational authority. Manage deliverables, projects, employee accounts, and system configuration.',
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: ShieldAlert,
  },
  {
    role: 'MANAGER',
    title: 'Operations Manager',
    description: 'Project and team oversight. Create deliverables, evaluate progress, unblock impediments, and conduct monthly reviews.',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Shield,
  },
  {
    role: 'EMPLOYEE',
    title: 'Employee / Contributor',
    description: 'Single task ownership. Track active deliverables, update progress, flag blockers, and submit execution records.',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: UserCheck,
  },
];

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({ user, isOpen, onClose }) => {
  const { changeUserRole, currentUser } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('EMPLOYEE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setError('');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isCurrentSelf = currentUser?.id === user.id;
  const isNoChange = user.role === selectedRole;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNoChange) {
      onClose();
      return;
    }

    setError('');
    setLoading(true);
    const res = await changeUserRole(user.id, selectedRole);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Failed to change role');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div
        id="modal-change-role"
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Change Employee Role</h2>
              <p className="text-xs text-slate-500">Update system access tier and operational permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Employee Info Header */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                {user.initials}
              </span>
              <div>
                <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                <p className="text-[11px] text-slate-400">{user.email}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider mb-0.5">Current Role</span>
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {user.role}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isCurrentSelf && selectedRole !== 'ADMIN' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>Warning: Demoting your own admin account will immediately restrict your administrative privileges.</span>
            </div>
          )}

          {/* Role Selection Cards */}
          <div className="space-y-2.5">
            <label className="block font-bold text-slate-700 mb-1">
              Select New Access Role <span className="text-rose-500">*</span>
            </label>
            {ROLE_OPTIONS.map((opt) => {
              const isSelected = selectedRole === opt.role;
              const Icon = opt.icon;

              return (
                <div
                  key={opt.role}
                  id={`role-option-${opt.role.toLowerCase()}`}
                  onClick={() => setSelectedRole(opt.role)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/10'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{opt.title}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${opt.badgeClass}`}
                        >
                          {opt.role}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{opt.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-change-role"
              type="submit"
              disabled={loading || isNoChange}
              className={`px-5 py-2 rounded-xl font-bold shadow-xs transition-colors flex items-center gap-2 ${
                isNoChange
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : 'Update Role'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
