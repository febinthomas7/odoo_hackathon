import api from './axios';
import { mockDepartments, mockAssetCategories, mockEmployees } from './mockData';
import { pushLog } from './activityLogApi';

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
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Map headId and parentId to their actual objects for the UI if needed
      return mockDepartments.map(d => ({
         ...d,
         headName: mockEmployees.find(e => e.id === d.headId)?.name || null,
         parentName: mockDepartments.find(pd => pd.id === d.parentId)?.name || null
      }));
    }
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
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [...mockAssetCategories];
    }
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
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockEmployees.map(e => ({
         ...e,
         department: mockDepartments.find(d => d.id === e.departmentId)?.name || 'Unknown'
      }));
    }
    throw error;
  }
};

/**
 * POST /organization/employees/:id/promote/
 * Promotes an employee to a new role.
 * Role Access: Admin ONLY
 */
export const promoteEmployee = async (id, newRole, adminId) => {
  try {
    const response = await api.post(`/organization/employees/${id}/promote/`, { role: newRole });
    return response.data;
  } catch (error) {
    console.error("API Error, falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const emp = mockEmployees.find(e => e.id === id);
      if(emp) {
         emp.role = newRole;
         await pushLog(adminId, `Promoted employee ${emp.name} to ${newRole}`);
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
export const addDepartment = async (deptData, adminId) => {
  try {
    const response = await api.post('/organization/departments/', deptData);
    return response.data;
  } catch (error) {
    console.error("API Error, falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newDept = {
         id: Date.now(),
         name: deptData.name,
         headId: deptData.headId || null,
         parentId: deptData.parentId || null,
         status: deptData.status || 'Active'
      };
      mockDepartments.push(newDept);
      await pushLog(adminId, `Added new department: ${newDept.name}`);
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
export const updateDepartment = async (id, deptData, adminId) => {
  try {
    const response = await api.patch(`/organization/departments/${id}/`, deptData);
    return response.data;
  } catch (error) {
    console.error("API Error, falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const dept = mockDepartments.find(d => d.id === id);
      if (dept) {
         if (deptData.name !== undefined) dept.name = deptData.name;
         if (deptData.headId !== undefined) dept.headId = deptData.headId;
         if (deptData.parentId !== undefined) dept.parentId = deptData.parentId;
         if (deptData.status !== undefined) dept.status = deptData.status;
         await pushLog(adminId, `Updated department: ${dept.name}`);
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
export const addAssetCategory = async (catData, adminId) => {
  try {
    const response = await api.post('/organization/categories/', catData);
    return response.data;
  } catch (error) {
    console.error("API Error, falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newCat = {
         id: Date.now(),
         name: catData.name,
         attributes: catData.attributes || []
      };
      mockAssetCategories.push(newCat);
      await pushLog(adminId, `Added new asset category: ${newCat.name}`);
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
export const updateAssetCategory = async (id, catData, adminId) => {
  try {
    const response = await api.patch(`/organization/categories/${id}/`, catData);
    return response.data;
  } catch (error) {
    console.error("API Error, falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const cat = mockAssetCategories.find(c => c.id === id);
      if (cat) {
         if (catData.name !== undefined) cat.name = catData.name;
         if (catData.attributes !== undefined) cat.attributes = catData.attributes;
         await pushLog(adminId, `Updated asset category: ${cat.name}`);
      }
      return { success: true };
    }
    throw error;
  }
};

/**
 * POST /organization/employees/
 * Adds a new employee to the organization.
 * Role Access: Admin ONLY
 */
export const addEmployee = async (empData, adminId) => {
  try {
    const response = await api.post('/organization/employees/', empData);
    return response.data;
  } catch (error) {
    console.error("API Error (addEmployee), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newEmp = {
        id: Date.now(),
        name: empData.name,
        email: empData.email,
        departmentId: empData.departmentId ? parseInt(empData.departmentId) : null,
        role: empData.role || 'Employee',
        status: 'Active'
      };
      mockEmployees.push(newEmp);
      await pushLog(adminId, `Added new employee: ${newEmp.name} as ${newEmp.role}`);
      return { success: true, employee: newEmp };
    }
    throw error;
  }
};
