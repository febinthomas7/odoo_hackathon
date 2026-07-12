import api from './axios';
import { mockDepartments, mockAssetCategories, mockEmployees } from './mockData';

// Fallback utility in case backend is not ready
// Set to false when backend is fully connected and you want errors to bubble up
const useMockFallback = true; 

// Store local state for mutations if backend fails
let localDepartments = [...mockDepartments];
let localCategories = [...mockAssetCategories];
let localEmployees = [...mockEmployees];

export const getDepartments = async () => {
  try {
    const response = await api.get('/departments/');
    return response.data;
  } catch (error) {
    console.error("API Error (getDepartments), falling back to mock:", error);
    if (useMockFallback) return [...localDepartments];
    throw error;
  }
};

export const addDepartment = async (dept) => {
  try {
    const response = await api.post('/departments/', dept);
    return response.data;
  } catch (error) {
    console.error("API Error (addDepartment), falling back to mock:", error);
    if (useMockFallback) {
      const newDept = { ...dept, id: Date.now() };
      localDepartments.push(newDept);
      return newDept;
    }
    throw error;
  }
};

export const updateDepartment = async (id, updates) => {
  try {
    const response = await api.patch(`/departments/${id}/`, updates);
    return response.data;
  } catch (error) {
    console.error("API Error (updateDepartment), falling back to mock:", error);
    if (useMockFallback) {
      localDepartments = localDepartments.map(d => d.id === id ? { ...d, ...updates } : d);
      return { success: true };
    }
    throw error;
  }
};

export const getAssetCategories = async () => {
  try {
    const response = await api.get('/asset-categories/');
    return response.data;
  } catch (error) {
    console.error("API Error (getAssetCategories), falling back to mock:", error);
    if (useMockFallback) return [...localCategories];
    throw error;
  }
};

export const addAssetCategory = async (category) => {
  try {
    const response = await api.post('/asset-categories/', category);
    return response.data;
  } catch (error) {
    console.error("API Error (addAssetCategory), falling back to mock:", error);
    if (useMockFallback) {
      const newCat = { ...category, id: Date.now() };
      localCategories.push(newCat);
      return newCat;
    }
    throw error;
  }
};

export const updateAssetCategory = async (id, updates) => {
  try {
    const response = await api.patch(`/asset-categories/${id}/`, updates);
    return response.data;
  } catch (error) {
    console.error("API Error (updateAssetCategory), falling back to mock:", error);
    if (useMockFallback) {
      localCategories = localCategories.map(c => c.id === id ? { ...c, ...updates } : c);
      return { success: true };
    }
    throw error;
  }
};

export const getEmployees = async () => {
  try {
    const response = await api.get('/employees/');
    return response.data;
  } catch (error) {
    console.error("API Error (getEmployees), falling back to mock:", error);
    if (useMockFallback) return [...localEmployees];
    throw error;
  }
};

export const promoteEmployee = async (employeeId, newRole) => {
  try {
    const response = await api.patch(`/employees/${employeeId}/promote/`, { role: newRole });
    return response.data;
  } catch (error) {
    console.error("API Error (promoteEmployee), falling back to mock:", error);
    if (useMockFallback) {
      localEmployees = localEmployees.map(e => e.id === employeeId ? { ...e, role: newRole } : e);
      return { success: true, employeeId, newRole };
    }
    throw error;
  }
};
