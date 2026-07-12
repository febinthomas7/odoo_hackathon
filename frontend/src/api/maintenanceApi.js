import api from './axios';
import { mockMaintenanceRequests, mockAssets } from './mockData';
import { logActivity } from './activityLogApi';

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
      return [...mockMaintenanceRequests];
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
        technician: null,
      };
      mockMaintenanceRequests.push(newRequest);
      
      // Sync asset status to Under Maintenance immediately upon raising request?
      // Or maybe wait for approval. We'll wait for approval for cross-module sync.
      
      logActivity(`Maintenance request raised for ${requestData.assetName} by ${requestData.reportedBy}`);
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
export const updateRequestStatus = async (requestId, updates) => {
  try {
    const response = await api.patch(`/maintenance/${requestId}/`, updates);
    return response.data;
  } catch (error) {
    console.error("API Error (updateRequestStatus), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const reqIndex = mockMaintenanceRequests.findIndex(r => r.id === requestId);
      if (reqIndex !== -1) {
        mockMaintenanceRequests[reqIndex] = { ...mockMaintenanceRequests[reqIndex], ...updates };
        
        // Cross-module asset sync based on status
        const assetId = mockMaintenanceRequests[reqIndex].assetId;
        const asset = mockAssets.find(a => a.id.toString() === assetId.toString());
        if (asset) {
          if (updates.status === 'In Progress' || updates.status === 'Approved') {
            asset.status = 'Under Maintenance';
          } else if (updates.status === 'Resolved' || updates.status === 'Rejected') {
            asset.status = 'Available'; // Assume it goes back to available, or we could leave it if allocated. For simplicity, Available.
          }
        }
        
        logActivity(`Maintenance request ${requestId} status updated to ${updates.status}`);
      }
      return { success: true };
    }
    throw error;
  }
};
