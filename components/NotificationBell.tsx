'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCircle2, Info, AlertCircle, ShieldCheck, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notificationService';
import { useRouter } from 'next/navigation';
import { AppNotification } from '@/types';

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const { notifications, unreadCount } = useNotifications(user?.uid);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead && notification.id) {
      await markNotificationAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.uid && unreadCount > 0) {
      await markAllNotificationsAsRead(user.uid);
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'booking': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'complaint': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'verification': return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'inquiry': return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default: return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-900 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed left-4 right-4 top-[88px] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-white border border-slate-900 shadow-xl z-50 overflow-hidden sm:origin-top-right">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 flex gap-4 cursor-pointer transition-colors hover:bg-slate-50 ${!notification.isRead ? 'bg-slate-50/50' : 'bg-white'}`}
                  >
                    <div className="shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2">
                        {notification.createdAt?.toDate ? notification.createdAt.toDate().toLocaleString() : 'Just now'}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="shrink-0 flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Showing last 50 notifications
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
