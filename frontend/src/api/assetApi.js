import api from './axios';
import { mockAssets } from './mockData';

const useMockFallback = true; 

let localAssets = [...mockAssets];

export const getAssets = async (filters = {}) => {
  try {
    const response = await api.get('/assets/', { params: filters });
    return response.data;
  } catch (error) {
    console.error("API Error (getAssets), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Basic mock filtering
      let filtered = [...localAssets];
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(a => a.name.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q) || a.serialNumber.toLowerCase().includes(q));
      }
      if (filters.category) {
        filtered = filtered.filter(a => a.category === filters.category);
      }
      if (filters.status) {
        filtered = filtered.filter(a => a.status === filters.status);
      }
      return filtered;
    }
    throw error;
  }
};

export const registerAsset = async (assetData) => {
  try {
    const response = await api.post('/assets/', assetData);
    return response.data;
  } catch (error) {
    console.error("API Error (registerAsset), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Auto-generate tag if not provided by backend
      const tag = `AF-${String(localAssets.length + 1).padStart(4, '0')}`;
      const newAsset = {
        ...assetData,
        id: Date.now(),
        tag,
        status: 'Available',
        assignedTo: null,
      };
      localAssets.push(newAsset);
      return newAsset;
    }
    throw error;
  }
};

export const updateAsset = async (id, updates) => {
  try {
    const response = await api.patch(`/assets/${id}/`, updates);
    return response.data;
  } catch (error) {
    console.error("API Error (updateAsset), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      localAssets = localAssets.map(a => a.id === id ? { ...a, ...updates } : a);
      return { success: true };
    }
    throw error;
  }
};
