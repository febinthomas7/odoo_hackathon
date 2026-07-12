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
    userId: session.userId || 0,
    userName: session.name || 'System',
    action: actionText,
    timestamp: new Date().toISOString()
  };

  mockActivityLog.unshift(logEntry); // Add to beginning of array

  if (notificationTarget) {
    const notification = {
      id: Date.now() + 1,
      userId: notificationTarget.userId || null, 
      role: notificationTarget.role || null, // if role is specified, targets all users of that role
      type: notificationTarget.type || 'Info',
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
