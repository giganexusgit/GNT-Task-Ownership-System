import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../services/supabaseClient';
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight, ArrowLeft, X } from 'lucide-react';

export const ResetPinSection: React.FC = () => {
  const { currentUser, resetUserPin, showToast } = useApp();

  // Step state: 0 = Idle (CTA button), 1 = Prompt Current PIN (Employees), 2 = Prompt New PIN & Confirm
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'ADMIN';

  const resetForm = () => {
    setStep(0);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setError('');
    setSuccess(false);
  };

  const handleStartReset = () => {
    setError('');
    setSuccess(false);
    setStep(1);
  };

  const handleVerifyCurrentPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const inputPin = currentPin.trim();
    const storedPin = currentUser.pin;

    let isValidPin =
      inputPin === storedPin ||
      (storedPin === '123456' && inputPin === '1234') ||
      (storedPin === '1234' && inputPin === '123456') ||
      (!storedPin && (inputPin === '1234' || inputPin === '123456'));

    if (!isValidPin && currentUser.email) {
      try {
        const { data, error: authErr } = await supabase.auth.signInWithPassword({
          email: currentUser.email,
          password: inputPin,
        });
        if (!authErr && data.user) {
          isValidPin = true;
        }
      } catch {
        // continue to error check
      }
    }

    if (!isValidPin) {
      setError('Current Security PIN or Password is incorrect. Please try again.');
      return;
    }

    // Current PIN verified successfully -> Move to Step 2
    setStep(2);
  };

  const handleFinalResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const cleanNewPin = newPin.trim();
    if (!cleanNewPin || cleanNewPin.length < 4 || cleanNewPin.length > 6 || !/^\d{4,6}$/.test(cleanNewPin)) {
      setError('New Security PIN must be 4 to 6 numeric digits.');
      return;
    }

    if (cleanNewPin !== confirmPin.trim()) {
      setError('New PIN and Confirm PIN do not match.');
      return;
    }

    setLoading(true);
    const res = await resetUserPin(currentUser.id, cleanNewPin);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      showToast(
        'Security PIN Reset Successfully',
        'Your security PIN has been updated in database and local session.',
        'success'
      );
      setTimeout(() => {
        resetForm();
      }, 2500);
    } else {
      setError(res.message || 'Failed to reset Security PIN.');
    }
  };

  return (
    <div id="section-reset-security-pin" className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Reset Security PIN</h3>
            <p className="text-xs text-slate-500">
              {step === 0 && 'Update the security PIN used to log into your account'}
              {step === 1 && 'Step 1 of 2: Verify your current Security PIN'}
              {step === 2 && (isAdmin ? 'Set your new Security PIN and confirm' : 'Step 2 of 2: Enter new PIN and confirm')}
            </p>
          </div>
        </div>

        {step > 0 && (
          <button
            type="button"
            onClick={resetForm}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cancel PIN Reset"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="font-semibold leading-tight">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="font-semibold leading-tight">
            Security PIN reset successfully! Your new PIN is active across database and sessions.
          </span>
        </div>
      )}

      {/* STEP 0: Initial CTA State */}
      {step === 0 && !success && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Need to change your security credentials?</p>
            <p className="text-slate-500 mt-0.5">Click below to start the step-by-step PIN reset process.</p>
          </div>
          <button
            type="button"
            id="btn-start-pin-reset"
            onClick={handleStartReset}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Reset Security PIN</span>
          </button>
        </div>
      )}

      {/* STEP 1: Verify Current PIN (For non-admins) */}
      {step === 1 && !isAdmin && (
        <form onSubmit={handleVerifyCurrentPin} className="space-y-4 text-xs animate-in fade-in">
          <div>
            <label htmlFor="input-current-pin" className="block font-bold text-slate-700 mb-1">
              Enter Current Security PIN
            </label>
            <div className="relative max-w-sm">
              <input
                id="input-current-pin"
                type={showCurrentPin ? 'text' : 'password'}
                maxLength={6}
                required
                autoFocus
                placeholder="••••"
                value={currentPin}
                onChange={(e) => {
                  setCurrentPin(e.target.value);
                  setError('');
                }}
                className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-center tracking-widest bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPin(!showCurrentPin)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                title={showCurrentPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Enter New PIN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Enter New PIN and Confirm */}
      {step === 2 && (
        <form onSubmit={handleFinalResetPin} className="space-y-4 text-xs animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* New Security PIN */}
            <div>
              <label htmlFor="input-new-pin" className="block font-bold text-slate-700 mb-1">
                New Security PIN (4-6 digits)
              </label>
              <div className="relative">
                <input
                  id="input-new-pin"
                  type={showNewPin ? 'text' : 'password'}
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => {
                    setNewPin(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-center tracking-widest bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  title={showNewPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Security PIN */}
            <div>
              <label htmlFor="input-confirm-pin" className="block font-bold text-slate-700 mb-1">
                Confirm New Security PIN
              </label>
              <div className="relative">
                <input
                  id="input-confirm-pin"
                  type={showConfirmPin ? 'text' : 'password'}
                  maxLength={6}
                  required
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => {
                    setConfirmPin(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-center tracking-widest bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  title={showConfirmPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                if (isAdmin) {
                  resetForm();
                } else {
                  setStep(1);
                }
                setError('');
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              {isAdmin ? (
                <span>Cancel</span>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </>
              )}
            </button>
            <button
              id="btn-submit-reset-pin"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Saving New PIN...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Reset Security PIN</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
