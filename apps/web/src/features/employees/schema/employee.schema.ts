import { z } from 'zod';
import { EmployeeRole, EmployeeStatus, Gender } from '../types';

// ==========================================
// ZOD SCHEMA FOR EMPLOYEE FORM VALIDATION
// ==========================================

export const employeeFormSchema = z.object({
  staffId: z
    .string()
    .min(1, 'Mã nhân viên là bắt buộc')
    .regex(/^NV\d{3,}$/, 'Mã nhân viên phải có định dạng NV001, NV002, ...'),
  
  fullName: z
    .string()
    .min(2, 'Tên nhân viên phải có ít nhất 2 ký tự')
    .max(100, 'Tên nhân viên không được quá 100 ký tự')
    .regex(/^[\p{L}\s]+$/u, 'Tên nhân viên chỉ được chứa chữ cái và khoảng trắng'),
  
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .email('Email không hợp lệ')
    .toLowerCase(),
  
  phone: z
    .string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ (phải là 10 số, bắt đầu bằng 03, 05, 07, 08, 09)'),
  
  dateOfBirth: z
    .string()
    .min(1, 'Ngày sinh là bắt buộc')
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 18 && age <= 65;
      },
      'Nhân viên phải từ 18 đến 65 tuổi'
    ),
  
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER], {
    message: 'Giới tính không hợp lệ',
  }),
  
  address: z
    .string()
    .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
    .max(200, 'Địa chỉ không được quá 200 ký tự'),
  
  avatarUrl: z
    .string()
    .url('URL ảnh không hợp lệ')
    .optional()
    .or(z.literal('')),
  
  role: z.enum([
    EmployeeRole.OWNER,
    EmployeeRole.MANAGER,
    EmployeeRole.CASHIER,
    EmployeeRole.WAREHOUSE,
    EmployeeRole.SALES,
  ], {
    message: 'Vai trò không hợp lệ',
  }),
  
  status: z.enum([
    EmployeeStatus.ACTIVE,
    EmployeeStatus.INACTIVE,
    EmployeeStatus.ON_LEAVE,
  ], {
    message: 'Trạng thái không hợp lệ',
  }),
  
  startDate: z
    .string()
    .min(1, 'Ngày vào làm là bắt buộc')
    .refine(
      (date) => {
        const startDate = new Date(date);
        const today = new Date();
        return startDate <= today;
      },
      'Ngày vào làm không được lớn hơn ngày hiện tại'
    ),
  
  salary: z
    .number()
    .min(1000000, 'Lương phải ít nhất 1,000,000 VNĐ')
    .max(100000000, 'Lương không được quá 100,000,000 VNĐ')
    .positive('Lương phải là số dương'),
  
  identityCard: z
    .string()
    .min(1, 'CMND/CCCD là bắt buộc')
    .regex(/^\d{9,12}$/, 'CMND/CCCD phải có 9-12 chữ số'),
  
  // Emergency contact (optional)
  emergencyContactName: z
    .string()
    .min(2, 'Tên người liên hệ phải có ít nhất 2 ký tự')
    .optional()
    .or(z.literal('')),
  
  emergencyContactPhone: z
    .string()
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),
  
  emergencyContactRelationship: z
    .string()
    .min(1, 'Mối quan hệ là bắt buộc nếu có người liên hệ')
    .optional()
    .or(z.literal('')),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

// ==========================================
// PARTIAL SCHEMA FOR UPDATES
// ==========================================

export const employeeUpdateSchema = employeeFormSchema.partial();

// ==========================================
// FILTER SCHEMA
// ==========================================

export const employeeFilterSchema = z.object({
  keyword: z.string().optional(),
  role: z.enum([
    EmployeeRole.OWNER,
    EmployeeRole.MANAGER,
    EmployeeRole.CASHIER,
    EmployeeRole.WAREHOUSE,
    EmployeeRole.SALES,
  ]).optional(),
  status: z.enum([
    EmployeeStatus.ACTIVE,
    EmployeeStatus.INACTIVE,
    EmployeeStatus.ON_LEAVE,
  ]).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type EmployeeFilterValues = z.infer<typeof employeeFilterSchema>;
