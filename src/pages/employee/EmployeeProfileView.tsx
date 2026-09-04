import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, KeyRound, ShieldCheck, Mail, Building, CheckCircle2, AlertCircle } from 'lucide-react';

export const EmployeeProfileView: React.FC = () => {
  const { currentUser, resetUserPin, showToast } = useApp();

  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!currentUser) return null;

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);
    const res = await resetUserPin(currentUser.id, newPin.trim());
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setNewPin('');
      setConfirmPin('');
      showToast('PIN Updated', 'Your security PIN has been updated successfully', 'success');
    } else {
      setError(res.message);
    }
  };

  return (
    <div id="employee-profile-view" className="space-y-6 max-w-2xl">
      {/* Account Details Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 font-bold text-base flex items-center justify-center border border-blue-200">
            {currentUser.initials}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{currentUser.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 font-medium">{currentUser.email}</span>
              <span>•</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
            <p className="font-bold text-slate-900 mt-0.5">{currentUser.department || 'Operations'}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Account ID</span>
            <p className="font-mono text-slate-700 mt-0.5">{currentUser.id}</p>
          </div>
        </div>
      </div>

      {/* Security Credentials: PIN change */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <KeyRound className="w-4 h-4 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Change 4-Digit Security PIN</h3>
            <p className="text-xs text-slate-500">Update the PIN used to sign into your workspace account</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePin} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>PIN updated successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-pin" className="block font-bold text-slate-700 mb-1">
                New Security PIN (4-6 digits)
              </label>
              <input
                id="new-pin"
                type="password"
                maxLength={6}
                required
                placeholder="••••"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-center tracking-widest bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="confirm-pin" className="block font-bold text-slate-700 mb-1">
                Confirm Security PIN
              </label>
              <input
                id="confirm-pin"
                type="password"
                maxLength={6}
                required
                placeholder="••••"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-center tracking-widest bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              id="btn-update-profile-pin"
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              {loading ? 'Saving...' : 'Update Security PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
