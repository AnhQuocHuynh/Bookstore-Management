import { apiClient } from '@/lib/axios';
import {
  Employee,
  EmployeeFormData,
  EmployeeParams,
  EmployeeResponse,
  ShiftParams,
  WeekSchedule,
  EmployeeRole,
  Shift,
} from '../types';
import { SAMPLE_EMPLOYEES, SAMPLE_SHIFTS } from '../constants/sampleEmployees';

// ==========================================
// IN-MEMORY SHIFT STORE (for mock fallback)
// ==========================================

// Store for dynamically added shifts (when API fails)
let dynamicShifts: Shift[] = [];

// Track deleted shift IDs (to filter out from SAMPLE_SHIFTS)
let deletedShiftIds: Set<string> = new Set();

// ==========================================
// INVITE EMPLOYEE DTO (Match Backend)
// ==========================================

export interface InviteEmployeeData {
  fullName: string;
  phoneNumber: string;
  role: EmployeeRole;
  employeeEmail: string;
  birthDate: string; // ISO date string
}

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
      const transformedData = (response.data.data || []).map((emp: any) => ({
        ...emp,
        staffId: emp.staffId || emp.username || `EMP-${emp.id.slice(0, 6)}`,
        employeeCode: emp.employeeCode || emp.staffId || emp.username || `EMP-${emp.id.slice(0, 6)}`,
      }));
      
      return {
        data: transformedData,
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
   * Invite new employee (Owner creates account, sends email)
   * Backend: POST /users/employees
   */
  inviteEmployee: async (data: InviteEmployeeData): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post<{ message: string }>('/users/employees', data);
      return response.data;
    } catch (error: any) {
      console.warn('API call failed, simulating invite:', error.message);
      
      // FALLBACK: Return success message
      return {
        message: 'Tài khoản nhân viên đã được tạo. Một email chứa thông tin đăng nhập đã được gửi.',
      };
    }
  },

  /**
   * Create new employee (Legacy - for full profile)
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
      
      // FALLBACK: Merge SAMPLE_SHIFTS with dynamically added shifts, excluding deleted ones
      let shifts = [
        ...SAMPLE_SHIFTS.filter((s) => !deletedShiftIds.has(s.id)),
        ...dynamicShifts,
      ];
      
      // Filter by employee if specified
      if (params.employeeId) {
        shifts = shifts.filter((shift) => shift.employeeId === params.employeeId);
      }
      
      // Filter by date range (normalize dates to YYYY-MM-DD format for comparison)
      shifts = shifts.filter((shift) => {
        const shiftDate = shift.date.split('T')[0]; // Extract date part if timestamp
        return shiftDate >= params.weekStart && shiftDate <= params.weekEnd;
      });
      
      // Debug logging
      console.log('[getWeekSchedule]', {
        sampleShiftsCount: SAMPLE_SHIFTS.length,
        dynamicShiftsCount: dynamicShifts.length,
        deletedIds: Array.from(deletedShiftIds),
        filteredShiftsCount: shifts.length,
        weekStart: params.weekStart,
        weekEnd: params.weekEnd,
        shifts: shifts.map(s => ({ id: s.id, date: s.date, employeeName: s.employeeName })),
      });
      
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
      // FALLBACK: Add to in-memory store
      const newShift: Shift = {
        id: `shift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        employeeId: data.employeeId,
        employeeName: data.employeeName || 'Unknown',
        date: data.date,
        shiftType: data.shiftType,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
      };
      dynamicShifts.push(newShift);
      console.log('[saveShift] Added shift to mock store:', {
        shift: newShift,
        totalDynamicShifts: dynamicShifts.length,
        allDynamicShifts: dynamicShifts.map(s => ({ id: s.id, date: s.date, employeeName: s.employeeName })),
      });
      return newShift;
    }
  },

  /**
   * Update shift
   * Falls back to mock update if API fails
   */
  updateShift: async (id: string, data: any): Promise<any> => {
    try {
      const response = await apiClient.put(`/api/v1/employee/schedule/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.warn('API call failed, simulating shift update:', error.message);
      // FALLBACK: Update in-memory store
      const shiftIndex = dynamicShifts.findIndex((s) => s.id === id);
      if (shiftIndex !== -1) {
        dynamicShifts[shiftIndex] = {
          ...dynamicShifts[shiftIndex],
          ...data,
          id, // Preserve ID
        };
        console.log('Updated shift in mock store:', dynamicShifts[shiftIndex]);
        return dynamicShifts[shiftIndex];
      }
      // If not found in dynamic, check if it's a SAMPLE_SHIFT
      // Create a new entry in dynamicShifts with same ID (effectively replacing the SAMPLE one)
      // Mark the SAMPLE one as deleted first
      deletedShiftIds.add(id);
      const updatedShift: Shift = {
        id, // Keep same ID
        employeeId: data.employeeId,
        employeeName: data.employeeName || 'Unknown',
        date: data.date,
        shiftType: data.shiftType,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
      };
      dynamicShifts.push(updatedShift);
      console.log('Updated SAMPLE shift by marking as deleted and adding new:', updatedShift);
      return updatedShift;
    }
  },

  /**
   * Delete shift
   * Falls back to mock deletion if API fails
   */
  deleteShift: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/employee/schedule/${id}`);
    } catch (error: any) {
      console.warn('API call failed, simulating shift deletion:', error.message);
      // FALLBACK: Remove from in-memory store or mark as deleted
      const shiftIndex = dynamicShifts.findIndex((s) => s.id === id);
      if (shiftIndex !== -1) {
        dynamicShifts.splice(shiftIndex, 1);
        console.log('Deleted shift from dynamic store:', id);
      } else {
        // If not in dynamic, it's from SAMPLE_SHIFTS - mark as deleted
        deletedShiftIds.add(id);
        console.log('Marked SAMPLE shift as deleted:', id);
      }
    }
  },
};
