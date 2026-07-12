import api from './axios';
import { mockAllocations, mockAssets } from './mockData';
import { logActivity } from './activityLogApi';

const useMockFallback = true; 

/**
 * GET /allocations/
 * Retrieves asset allocations and transfer history.
 * Role Access: Admin, Asset Manager, Department Head (dept only)
 */
export const getAllocations = async () => {
  try {
    const response = await api.get('/allocations/');
    return response.data;
  } catch (error) {
    console.error("API Error (getAllocations), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [...mockAllocations];
    }
    throw error;
  }
};

/**
 * POST /allocations/allocate/
 * Allocates an available asset to an employee.
 * Role Access: Admin, Asset Manager
 */
export const allocateAsset = async (allocationData) => {
  try {
    const response = await api.post('/allocations/allocate/', allocationData);
    return response.data;
  } catch (error) {
    console.error("API Error (allocateAsset), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newAllocation = {
        ...allocationData,
        id: Date.now(),
        assignedDate: new Date().toISOString().split('T')[0],
        status: 'Active'
      };
      mockAllocations.push(newAllocation);
      
      // Update asset status
      const asset = mockAssets.find(a => a.id.toString() === allocationData.assetId.toString());
      if (asset) {
        asset.status = 'Allocated';
        asset.assignedTo = allocationData.assignedTo;
      }
      
      logActivity(`Allocated ${allocationData.assetName} to ${allocationData.assignedTo}`);
      return newAllocation;
    }
    throw error;
  }
};

/**
 * POST /allocations/transfer/
 * Requests a transfer for an asset currently held by someone else.
 * Role Access: Employee, Department Head
 */
export const requestTransfer = async (transferData) => {
  try {
    const response = await api.post('/allocations/transfer/', transferData);
    return response.data;
  } catch (error) {
    console.error("API Error (requestTransfer), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newTransfer = {
        ...transferData,
        id: Date.now(),
        requestDate: new Date().toISOString().split('T')[0],
        status: 'Pending'
      };
      mockAllocations.push(newTransfer);
      logActivity(`Requested transfer of ${transferData.assetName} to ${transferData.requestedBy}`);
      return newTransfer;
    }
    throw error;
  }
};

/**
 * GET /allocations/transfers/
 * Retrieves pending transfer requests.
 * Role Access: Admin, Asset Manager, Department Head (dept specific)
 */
export const getTransferRequests = async () => {
  try {
    const response = await api.get('/allocations/transfers/');
    return response.data;
  } catch (error) {
    console.error("API Error (getTransferRequests), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockAllocations.filter(a => a.status === 'Pending');
    }
    throw error;
  }
};

/**
 * POST /allocations/transfers/:id/approve/
 * Approves a transfer request.
 * Role Access: Admin, Asset Manager, Department Head
 */
export const approveTransfer = async (transferId) => {
  try {
    const response = await api.post(`/allocations/transfers/${transferId}/approve/`);
    return response.data;
  } catch (error) {
    console.error("API Error (approveTransfer), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const reqIndex = mockAllocations.findIndex(a => a.id === transferId);
      if (reqIndex !== -1) {
        mockAllocations[reqIndex].status = 'Active';
        mockAllocations[reqIndex].assignedDate = new Date().toISOString().split('T')[0];
        
        // Find previous active allocation for this asset and mark it as Transferred/Returned
        const assetId = mockAllocations[reqIndex].assetId;
        const prevAllocIndex = mockAllocations.findIndex(a => a.assetId === assetId && a.status === 'Active' && a.id !== transferId);
        if(prevAllocIndex !== -1) {
          mockAllocations[prevAllocIndex].status = 'Returned';
        }
        
        // Update asset
        const asset = mockAssets.find(a => a.id.toString() === assetId.toString());
        if (asset) {
          asset.assignedTo = mockAllocations[reqIndex].requestedBy;
        }
        logActivity(`Approved transfer of ${mockAllocations[reqIndex].assetName} to ${mockAllocations[reqIndex].requestedBy}`);
      }
      return { success: true };
    }
    throw error;
  }
};

/**
 * POST /allocations/:id/return/
 * Processes the return of an allocated asset.
 * Role Access: Admin, Asset Manager
 */
export const returnAsset = async (allocationId, condition) => {
  try {
    const response = await api.post(`/allocations/${allocationId}/return/`, { condition });
    return response.data;
  } catch (error) {
    console.error("API Error (returnAsset), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const allocIndex = mockAllocations.findIndex(a => a.id === allocationId);
      if (allocIndex !== -1) {
        mockAllocations[allocIndex].status = 'Returned';
        mockAllocations[allocIndex].returnCondition = condition;
        mockAllocations[allocIndex].actualReturnDate = new Date().toISOString().split('T')[0];
        
        // Update asset
        const asset = mockAssets.find(a => a.id.toString() === mockAllocations[allocIndex].assetId.toString());
        if (asset) {
          asset.status = 'Available';
          asset.assignedTo = null;
        }
        logActivity(`Asset returned: ${mockAllocations[allocIndex].assetName} (${condition})`);
      }
      return { success: true };
    }
    throw error;
  }
};
