import api from './axios';
import { mockAssets } from './mockData';
import { pushLog } from './activityLogApi';

const useMockFallback = true; 

/**
 * GET /assets/
 * Retrieves all assets.
 * Role Access: Admin, Asset Manager, Department Head (filtered by backend), Employee (filtered to assigned only)
 */
export const getAssets = async () => {
  try {
    const response = await api.get('/assets/');
    return response.data;
  } catch (error) {
    console.error("API Error (getAssets), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [...mockAssets];
    }
    throw error;
  }
};

/**
 * POST /assets/
 * Registers a new asset in the system.
 * Role Access: Admin, Asset Manager ONLY
 */
export const registerAsset = async (assetData) => {
  try {
    const response = await api.post('/assets/', assetData);
    return response.data;
  } catch (error) {
    console.error("API Error (registerAsset), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newAsset = {
        ...assetData,
        id: Date.now(),
        tag: `AF-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Available'
      };
      mockAssets.push(newAsset);
      await pushLog(1, `Registered new asset: ${newAsset.name} (${newAsset.tag})`);
      return newAsset;
    }
    throw error;
  }
};
