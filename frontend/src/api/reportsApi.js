import api from './axios';
import { mockAssets, mockAllocations, mockMaintenanceRequests } from './mockData';

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
      
      // Compute Utilization by Category
      const categories = [...new Set(mockAssets.map(a => a.category))];
      const utilization = categories.map(cat => {
        const catAssets = mockAssets.filter(a => a.category === cat);
        const allocated = catAssets.filter(a => a.status === 'Allocated' || a.status === 'Under Maintenance').length;
        const percentage = catAssets.length === 0 ? 0 : Math.round((allocated / catAssets.length) * 100);
        return { category: cat, percentage };
      });
      
      // Compute Department Allocation
      const departments = [...new Set(mockAssets.map(a => a.department))];
      const departmentAllocation = departments.map(dept => {
        const count = mockAssets.filter(a => a.department === dept).length;
        return { dept, count };
      }).sort((a, b) => b.count - a.count); // sort descending
      
      // Compute Maintenance Frequency
      const maintenanceCountMap = {};
      mockMaintenanceRequests.forEach(req => {
        maintenanceCountMap[req.assetName] = (maintenanceCountMap[req.assetName] || 0) + 1;
      });
      const maintenance = Object.keys(maintenanceCountMap).map(assetName => ({
        asset: assetName,
        incidents: maintenanceCountMap[assetName]
      })).sort((a, b) => b.incidents - a.incidents).slice(0, 5); // top 5
      
      // Fallbacks if empty
      if (maintenance.length === 0) {
        maintenance.push({ asset: 'No Incidents', incidents: 0 });
      }

      return {
        utilization,
        departmentAllocation,
        maintenance
      };
    }
    throw error;
  }
};
