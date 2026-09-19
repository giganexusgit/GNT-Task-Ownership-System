import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, Volume2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useApp } from '../../context/AppContext';

export const BrowserNotificationBanner: React.FC = () => {
  const { showToast } = useApp();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    notificationService.getBrowserPermission()
  );
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('gnt_dismiss_notif_prompt') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    setPermission(notificationService.getBrowserPermission());
  }, []);

  if (permission !== 'default' || isDismissed) {
    return null;
  }

  const handleEnable = async () => {
    const res = await notificationService.requestBrowserPermission();
    setPermission(res);
    if (res === 'granted') {
      showToast('Notifications Active', 'Site notifications enabled successfully!', 'success');
    } else if (res === 'denied') {
      showToast('Notifications Blocked', 'You can allow notifications anytime via your browser address bar site settings.', 'info');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('gnt_dismiss_notif_prompt', 'true');
    } catch {}
  };

  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-2.5 sm:px-6 shadow-sm flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white tracking-wide">Enable Site Notifications</p>
          <p className="text-blue-100/90 text-[11px] truncate hidden sm:block">
            Receive instant desktop alerts and audio chimes for new task assignments, blocker updates, and deadlines.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          id="btn-banner-enable-notifications"
          onClick={handleEnable}
          className="px-3.5 py-1.5 rounded-lg bg-white text-blue-800 hover:bg-blue-50 font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Enable Alerts</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Dismiss for now"
          aria-label="Dismiss for now"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
