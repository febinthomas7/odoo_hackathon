import api from './axios';
import { mockAllocations } from './mockData';

const useMockFallback = true; 

let localAllocations = [...mockAllocations];

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
      return localAllocations;
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
        date: new Date().toISOString().split('T')[0],
        status: 'Allocated'
      };
      localAllocations.push(newAllocation);
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
        date: new Date().toISOString().split('T')[0],
        status: 'Transfer Pending'
      };
      localAllocations.push(newTransfer);
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
      return localAllocations.filter(a => a.status === 'Transfer Pending');
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
      localAllocations = localAllocations.map(a => a.id === transferId ? { ...a, status: 'Allocated' } : a);
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
      localAllocations = localAllocations.map(a => a.id === allocationId ? { ...a, status: 'Returned' } : a);
      return { success: true };
    }
    throw error;
  }
};
