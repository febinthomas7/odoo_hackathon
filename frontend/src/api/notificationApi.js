import api from './axios';
import { mockNotifications } from './mockData';

const useMockFallback = true; 

let localNotifications = [...mockNotifications];

/**
 * GET /notifications/
 * Retrieves notifications and activity logs for the current user.
 * Role Access: All Roles (returns only notifications relevant to the authenticated user's role and department)
 */
export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications/');
    return response.data;
  } catch (error) {
    console.error("API Error (getNotifications), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return localNotifications;
    }
    throw error;
  }
};

/**
 * PATCH /notifications/:id/read/
 * Marks a specific notification as read.
 * Role Access: All Roles (for their own notifications)
 */
export const markAsRead = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/read/`);
    return response.data;
  } catch (error) {
    console.error("API Error (markAsRead), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      localNotifications = localNotifications.map(n => n.id === id ? { ...n, read: true } : n);
      return { success: true };
    }
    throw error;
  }
};
