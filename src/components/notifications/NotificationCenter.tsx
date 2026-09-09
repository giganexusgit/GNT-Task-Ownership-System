import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../ui/EmptyState';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Trash2,
  X,
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    currentUser,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearNotifications,
    openTaskDetail,
  } = useApp();

  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  if (!currentUser) return null;

  // Strict user scoping ensures each user only sees notifications assigned directly to them
  let userNotifs = notifications.filter((n) => n.userId === currentUser.id);

  if (filterUnreadOnly) {
    userNotifs = userNotifs.filter((n) => !n.read);
  }

  const unreadCount = notifications.filter((n) => n.userId === currentUser.id && !n.read).length;
  const hasReadNotifs = notifications.some((n) => n.userId === currentUser.id && n.read);
  const totalUserNotifsCount = notifications.filter((n) => n.userId === currentUser.id).length;

  const handleNotificationClick = (id: string, taskId?: string) => {
    markNotificationRead(id);
    if (taskId) {
      openTaskDetail(taskId);
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Operational Notifications</h2>
            <p className="text-xs text-slate-500">
              {unreadCount} unread alert{unreadCount === 1 ? '' : 's'} requiring your attention
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Button 1: Filter Unread Toggle */}
          <button
            type="button"
            id="btn-notif-filter-unread"
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterUnreadOnly
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {filterUnreadOnly ? 'Showing Unread' : 'Filter Unread'}
          </button>

          {/* Button 2: Mark All Read */}
          {unreadCount > 0 && (
            <button
              type="button"
              id="btn-notif-mark-all-read"
              onClick={() => markAllNotificationsRead()}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark all read</span>
            </button>
          )}

          {/* Button 3a: Clear Read */}
          {hasReadNotifs && (
            <button
              type="button"
              id="btn-notif-clear-read"
              onClick={() => clearNotifications(true)}
              title="Clear all read notifications"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Clear Read</span>
            </button>
          )}

          {/* Button 3b: Clear All */}
          {totalUserNotifsCount > 0 && (
            <button
              type="button"
              id="btn-notif-clear-all"
              onClick={() => clearNotifications(false)}
              title="Clear all notifications"
              className="px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {userNotifs.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={
            filterUnreadOnly
              ? 'You have caught up on all unread notifications.'
              : 'You have no notifications in your activity log.'
          }
        />
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {userNotifs.map((n) => {
            let Icon = Bell;
            let iconColor = 'text-blue-600 bg-blue-50';

            if (n.type === 'BLOCKED') {
              Icon = ShieldAlert;
              iconColor = 'text-rose-600 bg-rose-50';
            } else if (n.type === 'OVERDUE') {
              Icon = AlertCircle;
              iconColor = 'text-rose-600 bg-rose-50';
            } else if (n.type === 'RETURNED_FOR_REVIEW') {
              Icon = Clock;
              iconColor = 'text-indigo-600 bg-indigo-50';
            } else if (n.type === 'COMPLETED') {
              Icon = CheckCircle2;
              iconColor = 'text-emerald-600 bg-emerald-50';
            }

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n.id, n.taskId)}
                className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3.5 group relative ${
                  !n.read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" title="Unread" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(n.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>

                  {n.taskId && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800">
                      <span>View related task deliverable</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Individual Dismiss Button */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteItem(e, n.id)}
                  title="Dismiss notification"
                  className="absolute right-3 top-3.5 p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
