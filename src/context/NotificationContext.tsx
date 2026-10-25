import React, { createContext, useContext, useState } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface NotificationContextType {
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;
  dismissToast: (id: string) => void;
  requestBrowserNotificationPermission: () => Promise<NotificationPermission>;
  sendBrowserNotification: (title: string, options?: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const requestBrowserNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      showToast('info', 'Notifications Not Supported', 'Your browser does not support web push notifications.');
      return 'denied';
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      showToast('success', 'Notifications Enabled', 'You will receive scheduled health and medication reminders.');
    } else {
      showToast('info', 'Permission Denied', 'In-app reminders will continue to show on your dashboard.');
    }
    return permission;
  };

  const sendBrowserNotification = (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.svg',
          ...options
        });
      } catch (err) {
        console.warn('Browser notification trigger failed:', err);
      }
    }
  };

  return (
    <NotificationContext.Provider value={{ toasts, showToast, dismissToast, requestBrowserNotificationPermission, sendBrowserNotification }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-card shadow-soft-md border transition-all transform translate-y-0 opacity-100 flex items-start gap-3 ${
              toast.type === 'success'
                ? 'bg-white border-botanical-green/40 text-text-primary'
                : toast.type === 'error'
                ? 'bg-white border-red-300 text-red-900'
                : toast.type === 'warning'
                ? 'bg-butter-cream/90 border-amber-300 text-amber-900'
                : 'bg-white border-border-soft text-text-primary'
            }`}
          >
            <div className="flex-1">
              <h4 className="text-sm font-semibold">{toast.title}</h4>
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-text-secondary hover:text-text-primary text-xs p-1"
              aria-label="Dismiss toast"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
