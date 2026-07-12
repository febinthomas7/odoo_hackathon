import { mockActivityLogs } from './mockData';

const useMockFallback = true; 

export const pushLog = async (userId, action) => {
  try {
    // This would normally be an API call to a backend logging endpoint
    // await api.post('/activity-logs/', { userId, action });
    // But since it's an internal helper primarily for cross-module mock sync:
    throw new Error('Force mock');
  } catch (error) {
    if (useMockFallback) {
      mockActivityLogs.unshift({
        id: Date.now(),
        userId,
        action,
        timestamp: new Date().toISOString()
      });
      return { success: true };
    }
    throw error;
  }
};

export const getActivityLogs = async () => {
  try {
    // await api.get('/activity-logs/');
    throw new Error('Force mock');
  } catch (error) {
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [...mockActivityLogs]; // Return copy
    }
    throw error;
  }
};
