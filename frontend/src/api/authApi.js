import api from './axios';
import { mockEmployees } from './mockData';

const useMockFallback = true; 

// Fallback user table to map emails to users
const fallbackUsers = mockEmployees;

/**
 * POST /auth/login
 * Authenticates user and returns token and user details.
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login/', { email, password });
    return response.data;
  } catch (error) {
    console.error("API Error (login), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = fallbackUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        throw new Error("Invalid credentials");
      }
      
      // Mock successful login
      return {
        token: `mock-jwt-token-${Date.now()}`,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          department: user.department
        }
      };
    }
    throw error;
  }
};

/**
 * POST /auth/signup
 * Registers a new employee (always defaults to 'Employee' role).
 */
export const signup = async (name, email, password) => {
  try {
    const response = await api.post('/auth/signup/', { name, email, password });
    return response.data;
  } catch (error) {
    console.error("API Error (signup), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const exists = fallbackUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        throw new Error("Email already registered");
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        department: 'Unassigned',
        role: 'Employee', // strictly forced by backend/mock
        status: 'Active'
      };
      
      // Mutate shared data
      mockEmployees.push(newUser);
      
      return { success: true, message: "Account created successfully" };
    }
    throw error;
  }
};

/**
 * POST /auth/forgot-password
 * Sends a password reset link to the email.
 */
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password/', { email });
    return response.data;
  } catch (error) {
    console.error("API Error (forgotPassword), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const exists = fallbackUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (!exists) {
        throw new Error("If the email exists, a reset link will be sent."); // standard vague security message
      }
      
      return { success: true, message: "If the email exists, a reset link will be sent." };
    }
    throw error;
  }
};
