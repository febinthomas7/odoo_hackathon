import api from './axios';
import { mockMaintenanceRequests, mockAssets, mockEmployees } from './mockData';
import { pushLog } from './activityLogApi';

const useMockFallback = true; 

/**
 * GET /maintenance/
 * Retrieves maintenance requests.
 * Role Access: Admin, Asset Manager, Department Head (dept only), Employee (own requests)
 */
export const getMaintenanceRequests = async () => {
  try {
    const response = await api.get('/maintenance/');
    return response.data;
  } catch (error) {
    console.error("API Error (getMaintenanceRequests), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockMaintenanceRequests.map(req => {
        const asset = mockAssets.find(a => a.id === req.assetId);
        const reporter = mockEmployees.find(e => e.id === req.reportedById);
        const tech = mockEmployees.find(e => e.id === req.technicianId);
        return {
          ...req,
          assetName: asset ? asset.name : 'Unknown Asset',
          reportedBy: reporter ? reporter.name : 'Unknown User',
          technician: tech ? tech.name : (req.vendorName || null)
        };
      });
    }
    throw error;
  }
};

/**
 * POST /maintenance/
 * Raises a new maintenance/repair request.
 * Role Access: Employee, Department Head
 */
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
        technicianId: null,
      };
      mockMaintenanceRequests.push(newRequest);
      
      const asset = mockAssets.find(a => a.id === parseInt(requestData.assetId));
      await pushLog(requestData.reportedById, `Raised maintenance request for ${asset?.name}`);
      return newRequest;
    }
    throw error;
  }
};

/**
 * PATCH /maintenance/:id
 * Updates request status and assigns technicians.
 * Role Access: Admin, Asset Manager, Department Head
 */
export const updateRequestStatus = async (requestId, updates, updaterId) => {
  try {
    const response = await api.patch(`/maintenance/${requestId}/`, updates);
    return response.data;
  } catch (error) {
    console.error("API Error (updateRequestStatus), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const req = mockMaintenanceRequests.find(r => r.id === requestId);
      if(req) {
        Object.assign(req, updates);
        
        // Sync asset status if status is Approved or Resolved
        const asset = mockAssets.find(a => a.id === req.assetId);
        if(asset) {
           if(req.status === 'Approved' || req.status === 'In Progress') {
               asset.status = 'Under Maintenance';
           } else if(req.status === 'Resolved') {
               asset.status = 'Available';
           }
        }
        
        await pushLog(updaterId, `Updated maintenance request #${req.id} to ${req.status}`);
      }
      return { success: true };
    }
    throw error;
  }
};
