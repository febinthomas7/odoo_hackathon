import api from './axios';
import { mockAssets, mockAllocations, mockBookings } from './mockData';
import { getSession } from '../utils/session';

const useMockFallback = true; 

/**
 * GET /dashboard/
 * Retrieves summary dashboard data based on role.
 * Role Access: Admin, Asset Manager, Department Head, Employee
 */
export const getDashboardData = async (role) => {
  try {
    const response = await api.get('/dashboard/', { params: { role } });
    return response.data;
  } catch (error) {
    console.error("API Error (getDashboardData), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const session = getSession();
      const userDept = session?.departmentId || 'IT Support';
      const userName = session?.name || 'Current User';

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      // Filter state depending on role
      const assets = role === 'Department Head' ? mockAssets.filter(a => a.department === userDept) : mockAssets;
      const allocations = role === 'Department Head' ? mockAllocations.filter(a => mockAssets.find(as => as.id === a.assetId)?.department === userDept) : mockAllocations;
      const bookings = role === 'Department Head' ? mockBookings.filter(b => mockAssets.find(as => as.id === b.assetId)?.department === userDept) : mockBookings;

      // Base KPIs
      const kpi = {
        available: assets.filter(a => a.status === 'Available').length,
        allocated: assets.filter(a => a.status === 'Allocated').length,
        maintenance: assets.filter(a => a.status === 'Under Maintenance').length,
        activeBookings: bookings.filter(b => b.status === 'Ongoing' || b.status === 'Upcoming').length,
        pendingTransfers: allocations.filter(a => a.status === 'Pending').length,
        upcomingReturns: allocations.filter(a => a.status === 'Active' && a.expectedReturnDate && a.expectedReturnDate >= todayStr).length
      };

      // Returns
      const allActiveReturns = allocations.filter(a => a.status === 'Active' && a.expectedReturnDate);
      
      const overdueReturns = allActiveReturns.filter(a => a.expectedReturnDate < todayStr).map(a => {
        const asset = mockAssets.find(as => as.id === a.assetId);
        return {
          id: a.id,
          assetName: a.assetName,
          tag: a.assetTag,
          holder: a.assignedTo,
          due: a.expectedReturnDate,
          dept: asset?.department || 'Unknown'
        };
      });

      const upcomingReturns = allActiveReturns.filter(a => a.expectedReturnDate >= todayStr).map(a => {
        const asset = mockAssets.find(as => as.id === a.assetId);
        return {
          id: a.id,
          assetName: a.assetName,
          tag: a.assetTag,
          holder: a.assignedTo,
          due: a.expectedReturnDate,
          dept: asset?.department || 'Unknown'
        };
      });

      if (role === 'Employee') {
        const assignedAssets = allocations.filter(a => a.status === 'Active' && a.assignedTo === userName).map(a => ({
          id: a.id,
          name: a.assetName,
          tag: a.assetTag,
          allocatedOn: a.assignedDate
        }));

        const upcomingBookingsList = mockBookings.filter(b => (b.status === 'Upcoming' || b.status === 'Ongoing') && b.bookedBy === userName).map(b => ({
          id: b.id,
          resource: b.assetName,
          date: b.date,
          time: `${b.startTime} - ${b.endTime}`
        }));

        return {
          assignedAssets,
          upcomingBookings: upcomingBookingsList
        };
      }

      return {
        kpi,
        overdueReturns,
        upcomingReturns
      };
    }
    throw error;
  }
};
