import api from './axios';

const useMockFallback = true; 

// Mock Data
const departments = [
  { id: 1, name: 'IT Support' },
  { id: 2, name: 'Engineering' },
  { id: 3, name: 'Human Resources' },
  { id: 4, name: 'Sales' }
];

const categories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Furniture' },
  { id: 3, name: 'Vehicles' },
  { id: 4, name: 'Software Licenses' }
];

const employees = [
  { id: 1, name: 'John Doe', department: 'Engineering' },
  { id: 2, name: 'Jane Smith', department: 'HR' },
  { id: 3, name: 'Mike Tech', department: 'IT Support' },
  { id: 4, name: 'Alice Johnson', department: 'IT Support' }
];

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
    if (useMockFallback) return departments;
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
    if (useMockFallback) return categories;
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
    if (useMockFallback) return employees;
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
      return { success: true };
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
      return { success: true };
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
      return { success: true };
    }
    throw error;
  }
};
