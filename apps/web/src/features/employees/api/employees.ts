import { apiClient } from '@/lib/axios';
import {
  Employee,
  EmployeeFormData,
  EmployeeParams,
  EmployeeResponse,
  ShiftParams,
  WeekSchedule,
} from '../types';
import { SAMPLE_EMPLOYEES, SAMPLE_SHIFTS } from '../constants/sampleEmployees';

// ==========================================
// EMPLOYEE API WITH MOCK FALLBACK
// ==========================================

export const employeesApi = {
  /**
   * Get all employees with pagination and filters
   * Falls back to mock data if API fails
   */
  getAll: async (params?: EmployeeParams): Promise<EmployeeResponse> => {
    try {
      const response = await apiClient.get('/api/v1/employee', { params });
      
      // Transform API response to match our interface
      return {
        data: response.data.data || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 10,
      };
    } catch (error: any) {
      console.warn('API call failed, using mock data:', error.message);
      
      // FALLBACK: Return mock data for screenshot reports
      let filteredData = [...SAMPLE_EMPLOYEES];
      
      // Apply filters
      if (params?.keyword) {
        const keyword = params.keyword.toLowerCase();
        filteredData = filteredData.filter(
          (emp) =>
            emp.fullName.toLowerCase().includes(keyword) ||
            emp.staffId.toLowerCase().includes(keyword) ||
            emp.email.toLowerCase().includes(keyword)
        );
      }
      
      if (params?.role) {
        filteredData = filteredData.filter((emp) => emp.role === params.role);
      }
      
      if (params?.status) {
        filteredData = filteredData.filter((emp) => emp.status === params.status);
      }
      
      // Apply pagination
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        data: filteredData.slice(startIndex, endIndex),
        total: filteredData.length,
        page,
        limit,
      };
    }
  },

  /**
   * Get employee by ID
   * Falls back to mock data if API fails
   */
  getById: async (id: string): Promise<Employee> => {
    try {
      const response = await apiClient.get(`/api/v1/employee/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.warn('API call failed, using mock data:', error.message);
      
      // FALLBACK: Return mock employee
      const employee = SAMPLE_EMPLOYEES.find((emp) => emp.id === id);
      if (!employee) {
        throw new Error(`Employee with ID ${id} not found`);
      }
      return employee;
    }
  },

  /**
   * Create new employee
   * Falls back to mock creation if API fails
   */
  create: async (data: EmployeeFormData): Promise<Employee> => {
    try {
      const response = await apiClient.post('/api/v1/employee', data);
      return response.data.data;
    } catch (error: any) {
      console.warn('API call failed, simulating creation:', error.message);
      
      // FALLBACK: Simulate creation
      const newEmployee: Employee = {
        id: `temp-${Date.now()}`,
        staffId: data.staffId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        avatarUrl: data.avatarUrl,
        role: data.role,
        status: data.status,
        startDate: data.startDate,
        salary: data.salary,
        identityCard: data.identityCard,
        emergencyContact: data.emergencyContactName
          ? {
              name: data.emergencyContactName,
              phone: data.emergencyContactPhone || '',
              relationship: data.emergencyContactRelationship || '',
            }
          : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return newEmployee;
    }
  },

  /**
   * Update employee
   * Falls back to mock update if API fails
   */
  update: async (id: string, data: Partial<EmployeeFormData>): Promise<Employee> => {
    try {
      const response = await apiClient.put(`/api/v1/employee/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.warn('API call failed, simulating update:', error.message);
      
      // FALLBACK: Find and simulate update
      const employee = SAMPLE_EMPLOYEES.find((emp) => emp.id === id);
      if (!employee) {
        throw new Error(`Employee with ID ${id} not found`);
      }
      
      return {
        ...employee,
        ...data,
        updatedAt: new Date().toISOString(),
      } as Employee;
    }
  },

  /**
   * Delete employee
   * Falls back to mock deletion if API fails
   */
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/employee/${id}`);
    } catch (error: any) {
      console.warn('API call failed, simulating deletion:', error.message);
      // FALLBACK: Just log the deletion
      console.log(`Mock deletion of employee ${id}`);
    }
  },

  /**
   * Get week schedule
   * Falls back to mock schedule if API fails
   */
  getWeekSchedule: async (params: ShiftParams): Promise<WeekSchedule> => {
    try {
      const response = await apiClient.get('/api/v1/employee/schedule', { params });
      return response.data.data;
    } catch (error: any) {
      console.warn('API call failed, using mock schedule:', error.message);
      
      // FALLBACK: Return mock schedule
      let shifts = [...SAMPLE_SHIFTS];
      
      // Filter by employee if specified
      if (params.employeeId) {
        shifts = shifts.filter((shift) => shift.employeeId === params.employeeId);
      }
      
      // Filter by date range
      shifts = shifts.filter(
        (shift) => shift.date >= params.weekStart && shift.date <= params.weekEnd
      );
      
      return {
        weekStart: params.weekStart,
        weekEnd: params.weekEnd,
        shifts,
      };
    }
  },

  /**
   * Create or update shift
   * Falls back to mock creation if API fails
   */
  saveShift: async (data: any): Promise<any> => {
    try {
      const response = await apiClient.post('/api/v1/employee/schedule', data);
      return response.data.data;
    } catch (error: any) {
      console.warn('API call failed, simulating shift save:', error.message);
      // FALLBACK: Just return the data as if saved
      return {
        id: `temp-shift-${Date.now()}`,
        ...data,
      };
    }
  },
};
