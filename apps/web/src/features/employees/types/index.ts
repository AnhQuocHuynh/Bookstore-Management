// ==========================================
// EMPLOYEE TYPES & INTERFACES
// ==========================================

export const EmployeeRole = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  WAREHOUSE: 'WAREHOUSE',
  SALES: 'SALES',
} as const;
export type EmployeeRole = typeof EmployeeRole[keyof typeof EmployeeRole];

export const EmployeeStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_LEAVE: 'ON_LEAVE',
} as const;
export type EmployeeStatus = typeof EmployeeStatus[keyof typeof EmployeeStatus];

export const ShiftType = {
  MORNING: 'MORNING',
  AFTERNOON: 'AFTERNOON',
  EVENING: 'EVENING',
  FULL_DAY: 'FULL_DAY',
} as const;
export type ShiftType = typeof ShiftType[keyof typeof ShiftType];

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;
export type Gender = typeof Gender[keyof typeof Gender];

export interface Employee {
  id: string;
  staffId: string; // Mã nhân viên (e.g., "NV001")
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // ISO date string
  gender: Gender;
  address: string;
  avatarUrl?: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  startDate: string; // Ngày vào làm
  salary: number;
  identityCard: string; // CMND/CCCD
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // ISO date string (YYYY-MM-DD)
  shiftType: ShiftType;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  notes?: string;
}

export interface WeekSchedule {
  weekStart: string; // ISO date string (Monday)
  weekEnd: string; // ISO date string (Sunday)
  shifts: Shift[];
}

// ==========================================
// FORM & TABLE TYPES
// ==========================================

export interface EmployeeFormData {
  staffId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  avatarUrl?: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  startDate: string;
  salary: number;
  identityCard: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface EmployeeTableRow {
  key: string;
  id: string;
  staffId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  startDate: string;
  avatarUrl?: string;
}

// ==========================================
// API PARAMS & RESPONSES
// ==========================================

export interface EmployeeParams {
  page?: number;
  limit?: number;
  keyword?: string;
  role?: EmployeeRole;
  status?: EmployeeStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeResponse {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
}

export interface ShiftParams {
  weekStart: string;
  weekEnd: string;
  employeeId?: string;
}

// ==========================================
// CONSTANTS FOR UI
// ==========================================

export const ROLE_LABELS: Record<EmployeeRole, string> = {
  [EmployeeRole.OWNER]: 'Chủ cửa hàng',
  [EmployeeRole.MANAGER]: 'Quản lý',
  [EmployeeRole.CASHIER]: 'Thu ngân',
  [EmployeeRole.WAREHOUSE]: 'Kho hàng',
  [EmployeeRole.SALES]: 'Bán hàng',
};

export const STATUS_LABELS: Record<EmployeeStatus, string> = {
  [EmployeeStatus.ACTIVE]: 'Đang làm việc',
  [EmployeeStatus.INACTIVE]: 'Nghỉ việc',
  [EmployeeStatus.ON_LEAVE]: 'Đang nghỉ phép',
};

export const SHIFT_LABELS: Record<ShiftType, string> = {
  [ShiftType.MORNING]: 'Ca sáng',
  [ShiftType.AFTERNOON]: 'Ca chiều',
  [ShiftType.EVENING]: 'Ca tối',
  [ShiftType.FULL_DAY]: 'Cả ngày',
};

export const SHIFT_COLORS: Record<ShiftType, string> = {
  [ShiftType.MORNING]: 'from-amber-400 to-orange-500',
  [ShiftType.AFTERNOON]: 'from-blue-400 to-cyan-500',
  [ShiftType.EVENING]: 'from-purple-400 to-indigo-500',
  [ShiftType.FULL_DAY]: 'from-emerald-400 to-teal-500',
};

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: 'Nam',
  [Gender.FEMALE]: 'Nữ',
  [Gender.OTHER]: 'Khác',
};
