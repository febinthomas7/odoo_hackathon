import api from './axios';
import { mockAuditCycles, mockAssets } from './mockData';
import { logActivity } from './activityLogApi';

const useMockFallback = true; 

/**
 * GET /audits/
 * Retrieves all audit cycles.
 * Role Access: Admin, Asset Manager, Department Head (dept specific)
 */
export const getAuditCycles = async () => {
  try {
    const response = await api.get('/audits/');
    return response.data;
  } catch (error) {
    console.error("API Error (getAuditCycles), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [...mockAuditCycles];
    }
    throw error;
  }
};

/**
 * POST /audits/
 * Initializes a new audit cycle for a specific department.
 * Role Access: Admin, Asset Manager
 */
export const createAuditCycle = async (cycleData) => {
  try {
    const response = await api.post('/audits/', cycleData);
    return response.data;
  } catch (error) {
    console.error("API Error (createAuditCycle), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newCycle = {
        ...cycleData,
        id: Date.now(),
        status: 'Active',
        results: []
      };
      mockAuditCycles.push(newCycle);
      logActivity(`Created Audit Cycle: ${cycleData.title}`);
      return newCycle;
    }
    throw error;
  }
};

/**
 * POST /audits/:cycleId/results/
 * Submits an audit result for a specific asset (Verified, Missing, Damaged).
 * Role Access: Department Head, Auditor (Employee assigned to audit)
 */
export const submitAuditResult = async (cycleId, assetId, status) => {
  try {
    const response = await api.post(`/audits/${cycleId}/results/`, { assetId, status });
    return response.data;
  } catch (error) {
    console.error("API Error (submitAuditResult), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const cycle = mockAuditCycles.find(c => c.id === cycleId);
      if (cycle) {
        cycle.results = cycle.results.filter(r => r.assetId !== assetId);
        cycle.results.push({ assetId, status });
      }
      return { success: true };
    }
    throw error;
  }
};

/**
 * POST /audits/:cycleId/close/
 * Closes an active audit cycle and locks results.
 * Role Access: Admin, Asset Manager, Department Head
 */
export const closeAuditCycle = async (cycleId) => {
  try {
    const response = await api.post(`/audits/${cycleId}/close/`);
    return response.data;
  } catch (error) {
    console.error("API Error (closeAuditCycle), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const cycleIndex = mockAuditCycles.findIndex(c => c.id === cycleId);
      if (cycleIndex !== -1) {
        mockAuditCycles[cycleIndex].status = 'Closed';
        
        // Sync results to assets
        const results = mockAuditCycles[cycleIndex].results;
        results.forEach(res => {
          const asset = mockAssets.find(a => a.id === res.assetId);
          if (asset) {
            if (res.status === 'Missing') {
              asset.status = 'Missing';
            } else if (res.status === 'Damaged') {
              asset.status = 'Under Maintenance'; // Or damaged if we have that state
            }
          }
        });
        
        logActivity(`Closed Audit Cycle: ${mockAuditCycles[cycleIndex].title}`);
      }
      return { success: true };
    }
    throw error;
  }
};
