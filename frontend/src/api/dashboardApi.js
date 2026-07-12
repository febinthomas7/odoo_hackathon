import api from './axios';
import { mockDashboardData } from './mockData';

const useMockFallback = true; 

export const getDashboardData = async (role) => {
  try {
    const response = await api.get('/dashboard/', { params: { role } });
    return response.data;
  } catch (error) {
    console.error("API Error (getDashboardData), falling back to mock:", error);
    if (useMockFallback) {
      // Simulate network delay for realistic feel
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // If Department Head, maybe mock filtered data? For now, we'll return the same mock data 
      // but in a real backend this is where the filtering happens based on `role` or the user's token.
      return mockDashboardData;
    }
    throw error;
  }
};
