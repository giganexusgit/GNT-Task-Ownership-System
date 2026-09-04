import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { users, tasks, projects, activities, notifications, resetToDemoData, showToast } = useApp();
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');

  const handleExportJson = () => {
    const backupStr = storageService.exportFullBackup();
    const blob = new Blob([backupStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GNT_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup Created', 'Full enterprise database JSON downloaded', 'success');
  };

  const handleImportJson = () => {
    setImportError('');
    if (!importJson.trim()) {
      setImportError('Please paste valid JSON backup data.');
      return;
    }

    const success = storageService.importFullBackup(importJson.trim());
    if (success) {
      setImportJson('');
      showToast('Database Restored', 'All records safely imported', 'success');
    } else {
      setImportError('Invalid backup structure. Verify JSON format.');
      showToast('Import Failed', 'JSON parsing failed or structure mismatch', 'error');
    }
  };

  return (
    <div id="admin-settings-view" className="space-y-6 max-w-4xl">
      {/* System Status Overview */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Enterprise Data Repository</h2>
            <p className="text-xs text-slate-500">
              Reactive storage engine with full migration abstraction
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Team Accounts</span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{users.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Tasks</span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{tasks.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Projects</span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{projects.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Audit Events</span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{activities.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">Notifications</span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{notifications.length}</p>
          </div>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Database Backup & Portability</h3>
            <p className="text-xs text-slate-500">Export or restore full JSON snapshot of all entities</p>
          </div>
          <button
            onClick={handleExportJson}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON Backup</span>
          </button>
        </div>

        {/* Restore Section */}
        <div className="space-y-2 pt-2">
          <label htmlFor="input-import-json" className="block text-xs font-bold text-slate-700">
            Restore from JSON String
          </label>
          {importError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}
          <textarea
            id="input-import-json"
            rows={3}
            placeholder="Paste raw backup JSON here..."
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            onClick={handleImportJson}
            disabled={!importJson.trim()}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Apply Database Restore</span>
          </button>
        </div>
      </div>

      {/* Supabase Migration Readiness */}
      <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-blue-900">
          <FileCode className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Architecture Blueprint: Supabase Migration Ready
          </h3>
        </div>
        <p className="text-xs text-blue-800 leading-relaxed">
          All service layers (<code>taskService</code>, <code>userService</code>, <code>projectService</code>, <code>activityService</code>) are structured with standard asynchronous signatures. Migrating to Supabase PostgreSQL requires only swapping the inner <code>storageService</code> calls with <code>supabase.from('tasks')</code> queries without touching UI components.
        </p>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm font-bold text-rose-700">Factory Demo Reset</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Restores all original seed users (David, Sarah, Alex, Elena, Marcus), demo projects, tasks, and historical activities.
          </p>
        </div>
        <button
          onClick={resetToDemoData}
          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Workspace Data to Demo State</span>
        </button>
      </div>
    </div>
  );
};
