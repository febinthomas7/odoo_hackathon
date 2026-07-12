import api from './axios';
import { mockDepartments, mockAssetCategories, mockEmployees } from './mockData';
import { logActivity } from './activityLogApi';

const useMockFallback = true; 

/**
 * GET /organization/departments/
 * Retrieves all departments in the organization.
 * Role Access: All Roles (Global Read)
 */
export const getDepartments = async () => {
  try {
    const response = await api.get('/organization/departments/');
    return response.data;
  } catch (error) {
    console.error("API Error, falling back to mock:", error);
    if (useMockFallback) return [...mockDepartments];
    throw error;
  }
};

/**
 * GET /organization/categories/
 * Retrieves all asset categories.
 * Role Access: All Roles (Global Read)
 */
export const getAssetCategories = async () => {
  try {
    const response = await api.get('/organization/categories/');
    return response.data;
  } catch (error) {
    console.error("API Error, falling back to mock:", error);
    if (useMockFallback) return [...mockAssetCategories];
    throw error;
  }
};

/**
 * GET /organization/employees/
 * Retrieves employee list (often used for assignments).
 * Role Access: Admin, Asset Manager, Department Head (filtered by dept)
 */
export const getEmployees = async () => {
  try {
    const response = await api.get('/organization/employees/');
    return response.data;
  } catch (error) {
    console.error("API Error, falling back to mock:", error);
    if (useMockFallback) return [...mockEmployees];
    throw error;
  }
};

/**
 * POST /organization/employees/:id/promote/
 * Promotes an employee to a new role.
 * Role Access: Admin ONLY
 */
export const promoteEmployee = async (id, newRole) => {
  try {
    const response = await api.post(`/organization/employees/${id}/promote/`, { role: newRole });
    return response.data;
  } catch (error) {
    console.error("API Error, falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const empIndex = mockEmployees.findIndex(e => e.id === id);
      if (empIndex !== -1) {
        mockEmployees[empIndex].role = newRole;
        logActivity(`Promoted ${mockEmployees[empIndex].name} to ${newRole}`);
      }
      return { success: true };
    }
    throw error;
  }
};

/**
 * POST /organization/departments/
 * Adds a new department.
 * Role Access: Admin ONLY
 */
export const addDepartment = async (deptData) => {
  try {
    const response = await api.post('/organization/departments/', deptData);
    return response.data;
  } catch (error) {
    console.error("API Error, falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newDept = {
        id: Date.now(),
        ...deptData
      };
      mockDepartments.push(newDept);
      logActivity(`Created department: ${newDept.name}`);
      return { success: true, data: newDept };
    }
    throw error;
  }
};

/**
 * PATCH /organization/departments/:id
 * Updates a department.
 * Role Access: Admin ONLY
 */
export const updateDepartment = async (id, deptData) => {
  try {
    const response = await api.patch(`/organization/departments/${id}/`, deptData);
    return response.data;
  } catch (error) {
    console.error("API Error, falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockDepartments.findIndex(d => d.id === id);
      if (index !== -1) {
        mockDepartments[index] = { ...mockDepartments[index], ...deptData };
        logActivity(`Updated department: ${mockDepartments[index].name}`);
      }
      return { success: true };
    }
    throw error;
  }
};

/**
 * POST /organization/categories/
 * Adds a new asset category.
 * Role Access: Admin ONLY
 */
export const addAssetCategory = async (catData) => {
  try {
    const response = await api.post('/organization/categories/', catData);
    return response.data;
  } catch (error) {
    console.error("API Error, falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newCat = {
        id: Date.now(),
        ...catData
      };
      mockAssetCategories.push(newCat);
      logActivity(`Created category: ${newCat.name}`);
      return { success: true, data: newCat };
    }
    throw error;
  }
};

/**
 * PATCH /organization/categories/:id
 * Updates an asset category.
 * Role Access: Admin ONLY
 */
export const updateAssetCategory = async (id, catData) => {
  try {
    const response = await api.patch(`/organization/categories/${id}/`, catData);
    return response.data;
  } catch (error) {
    console.error("API Error, falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockAssetCategories.findIndex(c => c.id === id);
      if (index !== -1) {
        mockAssetCategories[index] = { ...mockAssetCategories[index], ...catData };
        logActivity(`Updated category: ${mockAssetCategories[index].name}`);
      }
      return { success: true };
    }
    throw error;
  }
};
