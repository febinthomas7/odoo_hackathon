import { mockActivityLog, mockNotifications } from './mockData';
import { getSession } from '../utils/session';

/**
 * Logs an action to the global activity log (visible to Admins/Asset Managers)
 * and optionally pushes a notification to a specific user or role.
 */
export const logActivity = (actionText, notificationTarget = null) => {
  const session = getSession();
  
  const logEntry = {
    id: Date.now(),
    userId: session?.userId || 0,
    userName: session?.name || 'System',
    action: actionText,
    timestamp: new Date().toISOString()
  };

  mockActivityLog.unshift(logEntry);

  if (notificationTarget) {
    const notification = {
      id: Date.now() + 1,
      userId: notificationTarget.userId || null, 
      role: notificationTarget.role || null,
      type: notificationTarget.type || 'Info',
      message: actionText,
      date: new Date().toISOString(),
      read: false
    };
    mockNotifications.unshift(notification);
  } else {
    // By default, let's also create an Info notification for the user who did it, or just push a general one.
    // We'll push a general broadcast for Admins.
    const notification = {
      id: Date.now() + 1,
      userId: null,
      role: 'Admin',
      type: 'Info',
      message: actionText,
      date: new Date().toISOString(),
      read: false
    };
    mockNotifications.unshift(notification);
  }
};

export const getActivityLog = async () => {
  return [...mockActivityLog];
};

export const getNotifications = async () => {
  const session = getSession();
  if (!session) return [];
  
  // Return notifications where userId matches or role matches
  return mockNotifications.filter(n => 
    (n.userId && n.userId.toString() === session.userId.toString()) || 
    (n.role && n.role === session.role)
  );
};

export const markAsRead = async (id) => {
  const idx = mockNotifications.findIndex(n => n.id === id);
  if (idx !== -1) {
    mockNotifications[idx].read = true;
  }
  return { success: true };
};

export const markAllAsRead = async () => {
  const session = getSession();
  if (!session) return { success: false };
  
  mockNotifications.forEach(n => {
    if ((n.userId && n.userId.toString() === session.userId.toString()) || 
        (n.role && n.role === session.role)) {
      n.read = true;
    }
  });
  return { success: true };
};
