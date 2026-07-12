import api from './axios';
import { mockReportsData } from './mockData';

const useMockFallback = true; 

/**
 * GET /reports/
 * Retrieves analytic data for reports (utilization, maintenance, allocation).
 * Role Access: Admin, Asset Manager, Department Head (department-filtered data)
 */
export const getReportsData = async () => {
  try {
    const response = await api.get('/reports/');
    return response.data;
  } catch (error) {
    console.error("API Error (getReportsData), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockReportsData;
    }
    throw error;
  }
};
