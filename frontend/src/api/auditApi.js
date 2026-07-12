import api from './axios';
import { mockAuditCycles, mockAssets, mockDepartments, mockEmployees } from './mockData';
import { pushLog } from './activityLogApi';

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
      // Map IDs to readable names for the UI
      return mockAuditCycles.map(c => ({
        ...c,
        department: mockDepartments.find(d => d.id === c.departmentId)?.name || c.department || 'Unknown',
        auditors: (c.auditorIds || []).map(id => mockEmployees.find(e => e.id === id)?.name || 'Unknown')
      }));
    }
    throw error;
  }
};

/**
 * POST /audits/
 * Initializes a new audit cycle for a specific department.
 * Role Access: Admin, Asset Manager
 */
export const createAuditCycle = async (cycleData, creatorId) => {
  try {
    const response = await api.post('/audits/', cycleData);
    return response.data;
  } catch (error) {
    console.error("API Error (createAuditCycle), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const deptId = cycleData.departmentId ? parseInt(cycleData.departmentId) : null;
      const newCycle = {
        id: Date.now(),
        title: cycleData.title,
        departmentId: deptId,
        startDate: cycleData.startDate,
        endDate: cycleData.endDate,
        auditorIds: cycleData.auditorIds || [],
        status: 'Active',
        results: []
      };
      mockAuditCycles.push(newCycle);
      await pushLog(creatorId, `Created new audit cycle: ${newCycle.title}`);
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
export const submitAuditResult = async (cycleId, assetId, status, auditorId) => {
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
export const closeAuditCycle = async (cycleId, closerId) => {
  try {
    const response = await api.post(`/audits/${cycleId}/close/`);
    return response.data;
  } catch (error) {
    console.error("API Error (closeAuditCycle), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const cycle = mockAuditCycles.find(c => c.id === cycleId);
      if(cycle) {
        cycle.status = 'Closed';
        
        // Update asset statuses based on missing/damaged
        cycle.results.forEach(res => {
           if (res.status === 'Missing') {
              const a = mockAssets.find(ass => ass.id === res.assetId);
              if (a) a.status = 'Lost';
           } else if (res.status === 'Damaged') {
              const a = mockAssets.find(ass => ass.id === res.assetId);
              if (a) a.status = 'Under Maintenance';
           }
        });
        
        await pushLog(closerId, `Closed audit cycle: ${cycle.title}`);
      }
      return { success: true };
    }
    throw error;
  }
};
