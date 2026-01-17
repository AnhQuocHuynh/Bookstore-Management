import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeesApi, InviteEmployeeData } from '../api/employees';
import {
  Employee,
  EmployeeFormData,
  EmployeeParams,
  EmployeeResponse,
  ShiftParams,
  WeekSchedule,
} from '../types';

// ==========================================
// QUERY KEYS
// ==========================================

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params?: EmployeeParams) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  schedules: () => [...employeeKeys.all, 'schedule'] as const,
  schedule: (params: ShiftParams) => [...employeeKeys.schedules(), params] as const,
};

// ==========================================
// EMPLOYEE QUERIES
// ==========================================

/**
 * Hook to fetch all employees with pagination and filters
 */
export const useEmployees = (params?: EmployeeParams) => {
  return useQuery<EmployeeResponse, Error>({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeesApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single employee by ID
 */
export const useEmployee = (id: string) => {
  return useQuery<Employee, Error>({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeesApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch week schedule
 */
export const useWeekSchedule = (params: ShiftParams) => {
  return useQuery<WeekSchedule, Error>({
    queryKey: employeeKeys.schedule(params),
    queryFn: () => employeesApi.getWeekSchedule(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// ==========================================
// EMPLOYEE MUTATIONS
// ==========================================

/**
 * Hook to invite a new employee (Owner sends invitation email)
 */
export const useInviteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, InviteEmployeeData>({
    mutationFn: (data) => employeesApi.inviteEmployee(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success(response.message || 'Đã gửi lời mời thành công!');
    },
    onError: (error) => {
      toast.error(`Lỗi khi mời nhân viên: ${error.message}`);
    },
  });
};

/**
 * Hook to create a new employee (Legacy - for full profile)
 */
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation<Employee, Error, EmployeeFormData>({
    mutationFn: (data) => employeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success('Thêm nhân viên thành công!');
    },
    onError: (error) => {
      toast.error(`Lỗi khi thêm nhân viên: ${error.message}`);
    },
  });
};

/**
 * Hook to update an employee
 */
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Employee,
    Error,
    { id: string; data: Partial<EmployeeFormData> }
  >({
    mutationFn: ({ id, data }) => employeesApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(data.id) });
      toast.success('Cập nhật nhân viên thành công!');
    },
    onError: (error) => {
      toast.error(`Lỗi khi cập nhật nhân viên: ${error.message}`);
    },
  });
};

/**
 * Hook to delete an employee
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success('Xóa nhân viên thành công!');
    },
    onError: (error) => {
      toast.error(`Lỗi khi xóa nhân viên: ${error.message}`);
    },
  });
};

/**
 * Hook to save shift
 */
export const useSaveShift = (options?: { showToast?: boolean }) => {
  const queryClient = useQueryClient();
  const showToast = options?.showToast !== false; // Default to true for backward compatibility

  return useMutation<any, Error, any>({
    mutationFn: (data) => employeesApi.saveShift(data),
    onSuccess: () => {
      // Invalidate and refetch all schedule queries to ensure data is fresh
      queryClient.invalidateQueries({ queryKey: employeeKeys.schedules() });
      queryClient.refetchQueries({ queryKey: employeeKeys.schedules() });
      if (showToast) {
        toast.success('Lưu ca làm việc thành công!');
      }
    },
    onError: (error) => {
      if (showToast) {
        toast.error(`Lỗi khi lưu ca làm việc: ${error.message}`);
      }
    },
  });
};

/**
 * Hook to update shift
 */
export const useUpdateShift = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => employeesApi.updateShift(id, data),
    onSuccess: () => {
      // Invalidate and refetch all schedule queries to ensure data is fresh
      queryClient.invalidateQueries({ queryKey: employeeKeys.schedules() });
      queryClient.refetchQueries({ queryKey: employeeKeys.schedules() });
      toast.success('Cập nhật ca làm việc thành công!');
    },
    onError: (error) => {
      toast.error(`Lỗi khi cập nhật ca làm việc: ${error.message}`);
    },
  });
};

/**
 * Hook to delete shift
 */
export const useDeleteShift = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => employeesApi.deleteShift(id),
    onSuccess: () => {
      // Invalidate and refetch all schedule queries to ensure data is fresh
      queryClient.invalidateQueries({ queryKey: employeeKeys.schedules() });
      queryClient.refetchQueries({ queryKey: employeeKeys.schedules() });
      toast.success('Xóa ca làm việc thành công!');
    },
    onError: (error) => {
      toast.error(`Lỗi khi xóa ca làm việc: ${error.message}`);
    },
  });
};
