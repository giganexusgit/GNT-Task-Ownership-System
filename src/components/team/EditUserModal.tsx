import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { X, AlertCircle, UserCheck, Shield, KeyRound, Building, Mail, User as UserIcon } from 'lucide-react';

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose }) => {
  const { updateUser, currentUser } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [department, setDepartment] = useState('Operations');
  const [pin, setPin] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setDepartment(user.department || 'Operations');
      setPin(user.pin || '1234');
      setActive(user.active ?? true);
      setError('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Employee full name is required');
    if (!email.trim() || !email.includes('@')) return setError('Valid company email is required');
    if (pin.trim() && pin.length < 4) return setError('PIN must be at least 4 digits');

    setLoading(true);
    const updates: Partial<Omit<User, 'id' | 'createdAt'>> = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      department: department.trim(),
      active,
    };

    if (pin.trim()) {
      updates.pin = pin.trim();
    }

    const res = await updateUser(user.id, updates);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Failed to update employee details');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div
        id="modal-edit-user"
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
              {user.initials}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Employee Details</h2>
              <p className="text-xs text-slate-500">Update identity, department assignment, and access role</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="edit-user-name" className="block font-bold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="edit-user-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="edit-user-email" className="block font-bold text-slate-700 mb-1">
              Company Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="edit-user-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium"
              />
            </div>
          </div>

          {/* Department & Role Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-user-department" className="block font-bold text-slate-700 mb-1">
                Department
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="edit-user-department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Engineering, SEO, Design"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-user-role" className="block font-bold text-slate-700 mb-1">
                Access Role
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="edit-user-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium"
                >
                  <option value="EMPLOYEE">Employee (Executes Tasks)</option>
                  <option value="MANAGER">Manager (Creates & Delegates)</option>
                  <option value="ADMIN">Administrator (Full Access)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security PIN */}
          <div>
            <label htmlFor="edit-user-pin" className="block font-bold text-slate-700 mb-1">
              Security PIN (4-6 digits)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="edit-user-pin"
                type="text"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4-6 digit numeric PIN"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Used for employee PIN-based fast authentication.</p>
          </div>

          {/* Account Status Toggle */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800">Account Status</span>
              <p className="text-[11px] text-slate-500">Deactivated employees cannot log in or be assigned tasks</p>
            </div>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
                active
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{active ? 'Active' : 'Inactive'}</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
