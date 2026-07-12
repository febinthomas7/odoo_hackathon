import api from './axios';
import { mockAllocations, mockTransferRequests } from './mockData';

const useMockFallback = true; 

let localAllocations = [...mockAllocations];
let localTransferRequests = [...mockTransferRequests];

export const getAllocations = async (filters = {}) => {
  try {
    const response = await api.get('/allocations/', { params: filters });
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

export const allocateAsset = async (allocationData) => {
  try {
    const response = await api.post('/allocations/', allocationData);
    return response.data;
  } catch (error) {
    console.error("API Error (allocateAsset), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newAllocation = {
        ...allocationData,
        id: Date.now(),
        assignedDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      };
      localAllocations.push(newAllocation);
      return newAllocation;
    }
    throw error;
  }
};

export const requestTransfer = async (transferData) => {
  try {
    const response = await api.post('/transfer-requests/', transferData);
    return response.data;
  } catch (error) {
    console.error("API Error (requestTransfer), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newRequest = {
        ...transferData,
        id: Date.now(),
        requestDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
      };
      localTransferRequests.push(newRequest);
      return newRequest;
    }
    throw error;
  }
};

export const getTransferRequests = async () => {
  try {
    const response = await api.get('/transfer-requests/');
    return response.data;
  } catch (error) {
    console.error("API Error (getTransferRequests), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return localTransferRequests;
    }
    throw error;
  }
};

export const approveTransfer = async (requestId) => {
  try {
    const response = await api.post(`/transfer-requests/${requestId}/approve/`);
    return response.data;
  } catch (error) {
    console.error("API Error (approveTransfer), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      localTransferRequests = localTransferRequests.map(r => r.id === requestId ? { ...r, status: 'Approved' } : r);
      return { success: true };
    }
    throw error;
  }
};

export const returnAsset = async (allocationId, returnNotes) => {
  try {
    const response = await api.post(`/allocations/${allocationId}/return/`, { notes: returnNotes });
    return response.data;
  } catch (error) {
    console.error("API Error (returnAsset), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      localAllocations = localAllocations.map(a => a.id === allocationId ? { ...a, status: 'Returned', returnNotes } : a);
      return { success: true };
    }
    throw error;
  }
};
