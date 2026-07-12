import api from './axios';
import { mockNotifications } from './mockData';

const useMockFallback = true; 

let localNotifications = [...mockNotifications];

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
