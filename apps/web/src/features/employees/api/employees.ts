import { apiClient } from '@/lib/axios';
import {
  Employee,
  EmployeeFormData,
  EmployeeParams,
  EmployeeResponse,
  ShiftParams,
  WeekSchedule,
  EmployeeRole,
} from '../types';

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
// EMPLOYEE API (real backend only)
// ==========================================

export const employeesApi = {
  /**
   * Get all employees with pagination and filters
   */
  getAll: async (params?: EmployeeParams): Promise<EmployeeResponse> => {
    const response = await apiClient.get('/employee', { params });

    const rawData = response.data?.data ?? response.data?.data?.data ?? response.data?.results ?? [];
    const pagination = response.data?.pagination ?? response.data;

    const transformedData = (rawData || []).map((emp: any) => ({
      ...emp,
      staffId: emp.staffId || emp.username || `EMP-${(emp.id || '').slice(0, 6)}`,
      employeeCode: emp.employeeCode || emp.staffId || emp.username || `EMP-${(emp.id || '').slice(0, 6)}`,
      phone: emp.phone ?? emp.phoneNumber,
      dateOfBirth: emp.dateOfBirth ?? emp.birthDate,
    }));

    return {
      data: transformedData,
      total: pagination?.total ?? pagination?.pagination?.total ?? transformedData.length,
      page: pagination?.page ?? pagination?.pagination?.page ?? 1,
      limit: pagination?.limit ?? pagination?.pagination?.limit ?? transformedData.length,
    };
  },

  /**
   * Get employee by ID
   */
  getById: async (id: string): Promise<Employee> => {
    const response = await apiClient.get('/employee/query', { params: { id } });
    const data = response.data?.data ?? response.data;
    return {
      ...data,
      staffId: data.staffId || data.username || `EMP-${(data.id || '').slice(0, 6)}`,
      phone: data.phone ?? data.phoneNumber,
      dateOfBirth: data.dateOfBirth ?? data.birthDate,
    } as Employee;
  },

  /**
   * Invite new employee (Owner creates account, sends email)
   */
  inviteEmployee: async (data: InviteEmployeeData): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/users/employees', data);
    return response.data;
  },

  /**
   * Create new employee
   */
  create: async (data: EmployeeFormData): Promise<Employee> => {
    const response = await apiClient.post('/employee', data);
    return response.data?.data ?? response.data;
  },

  /**
   * Update employee
   */
  update: async (id: string, data: Partial<EmployeeFormData>): Promise<Employee> => {
    const payload: Record<string, any> = { ...data };
    if (data.phone !== undefined) payload.phoneNumber = data.phone;
    if ((data as any).phoneNumber !== undefined) payload.phoneNumber = (data as any).phoneNumber;
    if (data.dateOfBirth !== undefined) payload.birthDate = data.dateOfBirth;
    if ((data as any).birthDate !== undefined) payload.birthDate = (data as any).birthDate;
    delete payload.phone;
    delete payload.dateOfBirth;

    const response = await apiClient.patch(`/employee/${id}`, payload);
    return response.data?.data ?? response.data;
  },

  /**
   * Update employee status (activate/deactivate)
   */
  updateStatus: async (id: string, isActive: boolean): Promise<Employee> => {
    const response = await apiClient.patch(`/employee/${id}/status`, { isActive });
    return response.data?.data ?? response.data;
  },

  /**
   * Update employee role
   */
  updateRole: async (id: string, role: EmployeeRole): Promise<Employee> => {
    const response = await apiClient.patch(`/employee/${id}/role`, { role });
    return response.data?.data ?? response.data;
  },

  /**
   * Get week schedule
   */
  getWeekSchedule: async (params: ShiftParams): Promise<WeekSchedule> => {
    const response = await apiClient.get('/employee/schedule', { params });
    const data = response.data?.data ?? response.data;
    return data as WeekSchedule;
  },

  /**
   * Create or update shift
   */
  saveShift: async (data: any): Promise<any> => {
    const response = await apiClient.post('/employee/schedule', data);
    return response.data?.data ?? response.data;
  },

  /**
   * Update shift
   */
  updateShift: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/employee/schedule/${id}`, data);
    return response.data?.data ?? response.data;
  },

  /**
   * Delete shift
   */
  deleteShift: async (id: string): Promise<void> => {
    await apiClient.delete(`/employee/schedule/${id}`);
  },
};
