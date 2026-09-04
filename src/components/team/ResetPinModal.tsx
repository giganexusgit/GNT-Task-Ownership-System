import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { X, AlertCircle, KeyRound } from 'lucide-react';

interface ResetPinModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ResetPinModal: React.FC<ResetPinModalProps> = ({ user, isOpen, onClose }) => {
  const { resetUserPin } = useApp();
  const [newPin, setNewPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPin.trim() || newPin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setLoading(true);
    const res = await resetUserPin(user.id, newPin.trim());
    setLoading(false);

    if (res.success) {
      onClose();
      setNewPin('');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div
        id="modal-reset-pin"
        className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Reset Security PIN</h2>
              <p className="text-[11px] text-slate-500">For {user.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="reset-pin-input" className="block font-bold text-slate-700 mb-1">
              New 4-6 Digit Security PIN
            </label>
            <input
              id="reset-pin-input"
              type="password"
              maxLength={6}
              required
              autoFocus
              placeholder="e.g. 5678"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono text-center tracking-widest bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              id="btn-submit-reset-pin"
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              {loading ? 'Updating...' : 'Update PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
