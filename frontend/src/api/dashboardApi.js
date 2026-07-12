import api from './axios';

const useMockFallback = true; 

// Mock Data Objects for different roles
const globalData = {
  kpi: { available: 128, allocated: 76, maintenance: 4, activeBookings: 9, pendingTransfers: 3, upcomingReturns: 12 },
  overdueReturns: [
    { id: 1, assetName: 'Delivery Van', tag: 'AF-0005', holder: 'Logistics Team', due: '2023-11-20', dept: 'Logistics' },
    { id: 2, assetName: 'MacBook Pro', tag: 'AF-0112', holder: 'John Doe', due: '2023-11-22', dept: 'Engineering' }
  ],
  upcomingReturns: [
    { id: 3, assetName: 'Projector', tag: 'AF-0062', holder: 'Jane Smith', due: '2023-12-01', dept: 'HR' }
  ]
};

const deptData = {
  kpi: { available: 45, allocated: 20, maintenance: 1, activeBookings: 2, pendingTransfers: 0, upcomingReturns: 3 },
  overdueReturns: [],
  upcomingReturns: [
    { id: 4, assetName: 'Dell XPS 15', tag: 'AF-0001', holder: 'Mike Tech', due: '2023-12-15', dept: 'IT Support' }
  ]
};

const employeeData = {
  assignedAssets: [
    { id: 1, name: 'Dell XPS 15', tag: 'AF-0001', allocatedOn: '2023-01-15' },
    { id: 2, name: 'Ergonomic Chair', tag: 'AF-0044', allocatedOn: '2023-03-10' }
  ],
  upcomingBookings: [
    { id: 1, resource: 'Conference Room A', date: '2023-11-28', time: '10:00 - 11:30' }
  ]
};

/**
 * GET /dashboard/
 * Retrieves summary dashboard data based on role.
 * Role Access: Admin, Asset Manager, Department Head, Employee
 * Note: Backend will filter data implicitly based on authenticated user's role.
 */
export const getDashboardData = async (role) => {
  try {
    const response = await api.get('/dashboard/', { params: { role } });
    return response.data;
  } catch (error) {
    console.error("API Error (getDashboardData), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (role === 'Department Head') {
        return deptData;
      } else if (role === 'Employee') {
        return employeeData;
      }
      return globalData; // Admin & Asset Manager
    }
    throw error;
  }
};
