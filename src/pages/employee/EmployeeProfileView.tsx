import React from 'react';
import { useApp } from '../../context/AppContext';
import { ResetPinSection } from '../../components/profile/ResetPinSection';

export const EmployeeProfileView: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  return (
    <div id="employee-profile-view" className="space-y-6 max-w-2xl">
      {/* Account Details Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 font-bold text-base flex items-center justify-center border border-blue-200 shrink-0">
            {currentUser.initials}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{currentUser.name}</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">{currentUser.email}</span>
              <span>•</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
            <p className="font-bold text-slate-900 mt-0.5">{currentUser.department || 'Operations'}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Account ID</span>
            <p className="font-mono text-slate-700 mt-0.5 break-all">{currentUser.id}</p>
          </div>
        </div>
      </div>

      {/* Security Credentials: Reset Security PIN section */}
      <ResetPinSection />
    </div>
  );
};
