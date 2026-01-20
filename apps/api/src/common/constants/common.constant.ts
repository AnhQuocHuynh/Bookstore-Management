import { EmployeeRole } from '@/common/enums';

export const SUBJECT_EMAIL_MAP = {
  'email-otp-verification': 'Verify Your Email Address',
  'email-reset-password': 'Reset Your Password',
  'email-invite-employee': `You're Invited to Join Our Bookstore Team`,
  'email-request-change-password-otp': 'Confirm Your Password Change Request',
  'email-store-registration': 'Your Bookstore Has Been Successfully Registered',
  'email-employee-account-info': 'Your Employee Account Information',
  'email-employee-password-reset':
    'Your Employee Account Password Has Been Reset',
};
export const ALGORITHM = 'aes-256-cbc';
export const IV_LENGTH = 16;
export const CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
export const EMPLOYEE_ROLE_PREFIX: Record<EmployeeRole, string> = {
  [EmployeeRole.STORE_MANAGER]: 'SM',
  [EmployeeRole.STAFF]: 'ST',
  [EmployeeRole.CASHIER]: 'CS',
  [EmployeeRole.INVENTORY]: 'IV',
  [EmployeeRole.ACCOUNTANT]: 'AC',
};
export const EmployeeRoleLabelMap: Record<EmployeeRole, string> = {
  [EmployeeRole.STORE_MANAGER]: 'Quản lý cửa hàng',
  [EmployeeRole.STAFF]: 'Nhân viên',
  [EmployeeRole.CASHIER]: 'Thu ngân',
  [EmployeeRole.INVENTORY]: 'Nhân viên kho',
  [EmployeeRole.ACCOUNTANT]: 'Kế toán',
};
