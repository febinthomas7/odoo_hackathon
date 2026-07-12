import api from './axios';
import { mockAllocations, mockTransferRequests, mockAssets, mockEmployees } from './mockData';
import { pushLog } from './activityLogApi';

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
      return mockAllocations.map(alloc => {
         const asset = mockAssets.find(a => a.id === alloc.assetId);
         const employee = mockEmployees.find(e => e.id === alloc.assignedToId);
         return {
            ...alloc,
            assetName: asset ? asset.name : 'Unknown Asset',
            assetTag: asset ? asset.tag : 'N/A',
            assignedTo: employee ? employee.name : 'Unknown Employee'
         };
      });
    }
    throw error;
  }
};

/**
 * POST /allocations/allocate/
 * Allocates an available asset to an employee.
 * Role Access: Admin, Asset Manager
 */
export const allocateAsset = async (allocationData, assignedById = 1) => {
  try {
    const response = await api.post('/allocations/allocate/', allocationData);
    return response.data;
  } catch (error) {
    console.error("API Error (allocateAsset), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const asset = mockAssets.find(a => a.id === parseInt(allocationData.assetId));
      if (!asset) throw new Error("Asset not found");
      
      const newAllocation = {
        id: Date.now(),
        assetId: asset.id,
        assignedToId: parseInt(allocationData.assignedToId),
        assignedById,
        assignedDate: new Date().toISOString().split('T')[0],
        expectedReturnDate: allocationData.expectedReturnDate || null,
        status: 'Active',
        conditionNotes: null
      };
      mockAllocations.push(newAllocation);
      
      // Update asset status
      asset.status = 'Allocated';
      
      await pushLog(assignedById, `Allocated asset ${asset.name} to employee ID ${allocationData.assignedToId}`);
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
export const requestTransfer = async (transferData, requestedById = 1) => {
  try {
    const response = await api.post('/allocations/transfer/', transferData);
    return response.data;
  } catch (error) {
    console.error("API Error (requestTransfer), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newTransfer = {
        id: Date.now(),
        assetId: parseInt(transferData.assetId),
        requestedById: requestedById,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'Pending'
      };
      mockTransferRequests.push(newTransfer);
      
      const asset = mockAssets.find(a => a.id === parseInt(transferData.assetId));
      await pushLog(requestedById, `Requested transfer for asset ${asset?.name}`);
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
      return mockTransferRequests
         .filter(a => a.status === 'Pending')
         .map(req => {
             const asset = mockAssets.find(a => a.id === req.assetId);
             const requester = mockEmployees.find(e => e.id === req.requestedById);
             // Find current holder
             const activeAlloc = mockAllocations.find(a => a.assetId === req.assetId && a.status === 'Active');
             const holder = activeAlloc ? mockEmployees.find(e => e.id === activeAlloc.assignedToId) : null;
             
             return {
                 ...req,
                 assetName: asset ? asset.name : 'Unknown Asset',
                 assetTag: asset ? asset.tag : 'N/A',
                 requestedBy: requester ? requester.name : 'Unknown Employee',
                 currentHolder: holder ? holder.name : 'Nobody'
             };
         });
    }
    throw error;
  }
};

/**
 * POST /allocations/transfers/:id/approve/
 * Approves a transfer request.
 * Role Access: Admin, Asset Manager, Department Head
 */
export const approveTransfer = async (transferId, approverId) => {
  try {
    const response = await api.post(`/allocations/transfers/${transferId}/approve/`);
    return response.data;
  } catch (error) {
    console.error("API Error (approveTransfer), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const req = mockTransferRequests.find(r => r.id === transferId);
      if(req) {
        req.status = 'Approved';
        
        // End old allocation
        const oldAlloc = mockAllocations.find(a => a.assetId === req.assetId && a.status === 'Active');
        if(oldAlloc) oldAlloc.status = 'Returned';
        
        // Create new allocation
        const newAlloc = {
          id: Date.now(),
          assetId: req.assetId,
          assignedToId: req.requestedById,
          assignedById: approverId,
          assignedDate: new Date().toISOString().split('T')[0],
          expectedReturnDate: null,
          status: 'Active',
          conditionNotes: null
        };
        mockAllocations.push(newAlloc);
        
        const asset = mockAssets.find(a => a.id === parseInt(req.assetId));
        await pushLog(approverId, `Approved transfer for asset ${asset?.name}`);
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
export const returnAsset = async (allocationId, conditionNotes, returnedById) => {
  try {
    const response = await api.post(`/allocations/${allocationId}/return/`, { conditionNotes });
    return response.data;
  } catch (error) {
    console.error("API Error (returnAsset), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const alloc = mockAllocations.find(a => a.id === allocationId);
      if(alloc) {
        alloc.status = 'Returned';
        alloc.conditionNotes = conditionNotes;
        
        // Update asset status
        const asset = mockAssets.find(a => a.id === alloc.assetId);
        if(asset) asset.status = 'Available';
        
        await pushLog(returnedById, `Processed return for asset ${asset?.name}`);
      }
      return { success: true };
    }
    throw error;
  }
};
