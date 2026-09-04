import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GntLogo } from '../../components/common/GntLogo';
import {
  ShieldCheck,
  KeyRound,
  ArrowRight,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { users, login, resetToDemoData } = useApp();

  const [selectedUserId, setSelectedUserId] = useState<string>(() => users[0]?.id || 'user-admin-1');
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Synchronize selectedUserId when users list updates or if selected ID is invalid
  useEffect(() => {
    if (users && users.length > 0) {
      const exists = users.some((u) => u.id === selectedUserId);
      if (!exists) {
        setSelectedUserId(users[0].id);
      }
    }
  }, [users, selectedUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetUserId = selectedUserId || users[0]?.id;
    if (!targetUserId) {
      setError('Please select a valid user account.');
      return;
    }
    if (!pin || pin.trim().length < 4) {
      setError('Please enter your 4-digit security PIN (Demo default: 1234).');
      return;
    }

    setLoading(true);
    const res = await login(targetUserId, pin.trim());
    setLoading(false);

    if (!res.success) {
      setError(res.errorMessage || 'Invalid credentials. Please verify your PIN.');
    }
  };

  const quickLoginAs = async (userId: string, defaultPin: string = '1234') => {
    setError('');
    setSelectedUserId(userId);
    setPin(defaultPin);
    setLoading(true);
    await login(userId, defaultPin);
    setLoading(false);
  };

  const selectedUserObj = users.find((u) => u.id === selectedUserId) || users[0];

  // Pick prominent demo accounts dynamically from loaded users
  const adminUser = users.find((u) => u.role === 'ADMIN') || users[0];
  const managerUser = users.find((u) => u.role === 'MANAGER') || users[1] || users[0];
  const employeeUser = users.find((u) => u.role === 'EMPLOYEE') || users[2] || users[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Official GNT Logo */}
        <div className="flex justify-center mb-4">
          <GntLogo variant="full" size="xl" className="drop-shadow-xs" />
        </div>

        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
          Task Ownership System
        </h1>
        <p className="mt-1 text-xs font-medium text-slate-500 max-w-xs mx-auto">
          Operational accountability & deliverables management for enterprise teams
        </p>

        {/* Accountability Creed */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>One Owner • One Deadline • Clear Next Action</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {/* Select User Account */}
            <div>
              <label htmlFor="login-user-select" className="block text-xs font-bold text-slate-700 mb-1">
                Select Team Account
              </label>
              <select
                id="login-user-select"
                value={selectedUserId || users[0]?.id || ''}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role} ({u.department || 'Operations'})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected User preview pill */}
            {selectedUserObj && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                    {selectedUserObj.initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{selectedUserObj.name}</p>
                    <p className="text-[11px] text-slate-400">{selectedUserObj.email}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedUserObj.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : selectedUserObj.role === 'MANAGER'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {selectedUserObj.role}
                </span>
              </div>
            )}

            {/* PIN Entry */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-pin-input" className="block text-xs font-bold text-slate-700">
                  4-Digit Security PIN
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Demo default: 1234</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-pin-input"
                  type="password"
                  maxLength={6}
                  required
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono tracking-widest bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Role Presets */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Role Demonstration
            </p>

            <div className="space-y-2">
              {adminUser && (
                <button
                  id="btn-quick-login-admin"
                  type="button"
                  onClick={() => quickLoginAs(adminUser.id, '1234')}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-left flex items-center justify-between text-xs transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center">
                      {adminUser.initials}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 group-hover:text-purple-700">
                        {adminUser.name}
                      </span>
                      <span className="text-slate-400 text-[10px] ml-1.5">(Admin • Full Control)</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                    Quick Login
                  </span>
                </button>
              )}

              {managerUser && (
                <button
                  id="btn-quick-login-manager"
                  type="button"
                  onClick={() => quickLoginAs(managerUser.id, '1234')}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left flex items-center justify-between text-xs transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                      {managerUser.initials}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 group-hover:text-blue-700">
                        {managerUser.name}
                      </span>
                      <span className="text-slate-400 text-[10px] ml-1.5">(Manager • Operations)</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    Quick Login
                  </span>
                </button>
              )}

              {employeeUser && (
                <button
                  id="btn-quick-login-employee"
                  type="button"
                  onClick={() => quickLoginAs(employeeUser.id, '1234')}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left flex items-center justify-between text-xs transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center">
                      {employeeUser.initials}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 group-hover:text-emerald-700">
                        {employeeUser.name}
                      </span>
                      <span className="text-slate-400 text-[10px] ml-1.5">(Employee • Assignee)</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Quick Login
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Reset Demo Data link */}
          <div className="mt-5 pt-3 border-t border-slate-100 text-center">
            <button
              id="btn-login-reset-demo"
              type="button"
              onClick={resetToDemoData}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset test workspace to original demo data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
