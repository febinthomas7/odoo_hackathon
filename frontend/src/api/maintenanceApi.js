import api from './axios';
import { mockMaintenanceRequests } from './mockData';

const useMockFallback = true; 

let localRequests = [...mockMaintenanceRequests];

export const getMaintenanceRequests = async () => {
  try {
    const response = await api.get('/maintenance/');
    return response.data;
  } catch (error) {
    console.error("API Error (getMaintenanceRequests), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return localRequests;
    }
    throw error;
  }
};

export const raiseRequest = async (requestData) => {
  try {
    const response = await api.post('/maintenance/', requestData);
    return response.data;
  } catch (error) {
    console.error("API Error (raiseRequest), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newRequest = {
        ...requestData,
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        technician: null,
      };
      localRequests.push(newRequest);
      return newRequest;
    }
    throw error;
  }
};

export const updateRequestStatus = async (requestId, updates) => {
  try {
    const response = await api.patch(`/maintenance/${requestId}/`, updates);
    return response.data;
  } catch (error) {
    console.error("API Error (updateRequestStatus), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      localRequests = localRequests.map(r => r.id === requestId ? { ...r, ...updates } : r);
      return { success: true };
    }
    throw error;
  }
};
