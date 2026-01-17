import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Mail, UserPlus } from 'lucide-react';
import { employeeFormSchema, type EmployeeFormValues } from '../schema/employee.schema';
import { useInviteEmployee, useUpdateEmployee } from '../hooks/useEmployees';
import {
  Employee,
  EmployeeRole,
  EmployeeStatus,
  Gender,
  ROLE_LABELS,
  STATUS_LABELS,
  GENDER_LABELS,
} from '../types';
import { InviteEmployeeData } from '../api/employees';

// ==========================================
// INVITE EMPLOYEE SCHEMA (Simplified)
// ==========================================

const inviteEmployeeSchema = z.object({
  employeeEmail: z.string().email('Email không hợp lệ'),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phoneNumber: z.string().regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  role: z.enum([
    EmployeeRole.MANAGER,
    EmployeeRole.CASHIER,
    EmployeeRole.WAREHOUSE,
    EmployeeRole.SALES,
  ] as const, {
    message: 'Vui lòng chọn vai trò',
  }),
  birthDate: z.string().min(1, 'Vui lòng chọn ngày sinh'),
});

type InviteEmployeeFormData = z.infer<typeof inviteEmployeeSchema>;

// ==========================================
// DEFAULT VALUES
// ==========================================

const DEFAULT_INVITE_VALUES: InviteEmployeeFormData = {
  employeeEmail: '',
  fullName: '',
  phoneNumber: '',
  role: EmployeeRole.CASHIER,
  birthDate: '',
};

const DEFAULT_PROFILE_VALUES: EmployeeFormValues = {
  staffId: '',
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: Gender.MALE,
  address: '',
  avatarUrl: '',
  role: EmployeeRole.CASHIER,
  status: EmployeeStatus.ACTIVE,
  startDate: new Date().toISOString().split('T')[0],
  salary: 8000000,
  identityCard: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const mapEmployeeToForm = (employee: Employee): EmployeeFormValues => ({
  staffId: employee.staffId,
  fullName: employee.fullName,
  email: employee.email,
  phone: employee.phone,
  dateOfBirth: employee.dateOfBirth,
  gender: employee.gender,
  address: employee.address,
  avatarUrl: employee.avatarUrl || '',
  role: employee.role,
  status: employee.status,
  startDate: employee.startDate,
  salary: employee.salary,
  identityCard: employee.identityCard,
  emergencyContactName: employee.emergencyContact?.name || '',
  emergencyContactPhone: employee.emergencyContact?.phone || '',
  emergencyContactRelationship: employee.emergencyContact?.relationship || '',
});

// ==========================================
// EMPLOYEE MODAL COMPONENT
// ==========================================

interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employee?: Employee | null;
}

export const EmployeeModal = ({ open, onClose, employee }: EmployeeModalProps) => {
  const isEditing = !!employee;
  const inviteMutation = useInviteEmployee();
  const updateMutation = useUpdateEmployee();

  // Form for INVITE mode (Add new employee)
  const inviteForm = useForm<InviteEmployeeFormData>({
    resolver: zodResolver(inviteEmployeeSchema),
    defaultValues: DEFAULT_INVITE_VALUES,
  });

  // Form for EDIT mode (Update existing employee)
  const profileForm = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: DEFAULT_PROFILE_VALUES,
  });

  // ==========================================
  // EFFECTS
  // ==========================================

  // Reset forms when modal opens
  useEffect(() => {
    if (!open) return;

    if (employee) {
      // EDIT mode: populate profile form
      profileForm.reset(mapEmployeeToForm(employee));
    } else {
      // ADD mode: reset invite form
      inviteForm.reset(DEFAULT_INVITE_VALUES);
    }
  }, [employee, open, inviteForm, profileForm]);

  useEffect(() => {
    if (!open) return;
  }, [open, isEditing]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleInviteSubmit = (data: InviteEmployeeFormData) => {
    inviteMutation.mutate(data, {
      onSuccess: () => {
        inviteForm.reset(DEFAULT_INVITE_VALUES);
        onClose();
      },
    });
  };

  const handleProfileSubmit = (data: EmployeeFormValues) => {
    if (!employee) return;

    updateMutation.mutate(
      { id: employee.id, data },
      {
        onSuccess: () => {
          profileForm.reset(DEFAULT_PROFILE_VALUES);
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    if (!isEditing) {
      inviteForm.reset(DEFAULT_INVITE_VALUES);
    } else {
      profileForm.reset(DEFAULT_PROFILE_VALUES);
    }
    onClose();
  };

  const isPending = inviteMutation.isPending || updateMutation.isPending;

  // ==========================================
  // RENDER: INVITE MODE (Simple Form)
  // ==========================================

  if (!isEditing) {
    return (
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleClose();
        }}
      >
        <DialogContent
          className="!fixed !top-[5vh] !left-1/2 !-translate-x-1/2 !z-50 !w-[95vw] !max-w-2xl !h-[90vh] !flex !flex-col !bg-white !p-0 !rounded-xl !shadow-2xl !border-none !overflow-hidden"
        >
          <DialogHeader className="flex-none px-4 pt-4 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg !bg-gradient-to-r !from-[#26A69A] !to-[#4DB6AC] flex items-center justify-center">
                <UserPlus className="w-5 h-5 !text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-800">
                  Mời Nhân Viên Mới
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  Hệ thống sẽ gửi email chứa thông tin đăng nhập
                </p>
              </div>
            </div>
          </DialogHeader>

          <Form {...inviteForm}>
            <form
              onSubmit={inviteForm.handleSubmit(handleInviteSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <ScrollArea className="flex-1 w-full max-h-[60vh]">
                <div className="p-4 space-y-3">
                  {/* BASIC INFO */}
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl">
                    <h3 className="text-base font-semibold text-gray-800 mb-3">
                      Thông tin cơ bản
                    </h3>
                    <div className="space-y-3">
                      {/* EMAIL */}
                      <FormField
                        control={inviteForm.control}
                        name="employeeEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">
                              Email <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="example@bookflow.vn"
                                className="h-11 !rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* FULL NAME */}
                      <FormField
                        control={inviteForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">
                              Họ và tên <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Nguyễn Văn A"
                                className="h-11 !rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* PHONE */}
                      <FormField
                        control={inviteForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">
                              Số điện thoại <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="0901234567"
                                className="h-11 !rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* ROLE */}
                      <FormField
                        control={inviteForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">
                              Vai trò <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 !rounded-xl">
                                  <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(ROLE_LABELS)
                                  .filter(([key]) => key !== EmployeeRole.OWNER)
                                  .map(([key, label]) => (
                                    <SelectItem key={key} value={key as EmployeeRole}>
                                      {label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* BIRTH DATE */}
                      <FormField
                        control={inviteForm.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">
                              Ngày sinh <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="date"
                                className="h-11 !rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* INFO MESSAGE */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          Email sẽ được gửi tự động
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Nhân viên sẽ nhận email chứa thông tin đăng nhập và hướng dẫn
                          kích hoạt tài khoản.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* STICKY FOOTER */}
              <div className="flex-none flex justify-end gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50/50">
                <Button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="h-11 px-6 !rounded-xl !bg-white hover:!bg-gray-50 !border !border-gray-200 !text-gray-700 !font-medium !shadow-none"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-11 px-6 !rounded-xl !bg-gradient-to-r !from-[#26A69A] !to-[#4DB6AC] hover:!from-[#00897B] hover:!to-[#26A69A] !text-white !font-bold !shadow-md hover:!shadow-lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Gửi lời mời
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  // ==========================================
  // RENDER: EDIT MODE (Full Profile Form)
  // ==========================================

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
      >
      <DialogContent
        className="z-50 w-full sm:max-w-3xl flex flex-col p-0 gap-0 bg-white !rounded-xl overflow-hidden h-auto max-h-[85vh] sm:h-auto"
      >
          <DialogHeader className="flex-none px-4 pt-4 pb-3 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-800">
            Cập nhật thông tin nhân viên
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-0.5">
            Chỉnh sửa thông tin chi tiết của nhân viên
          </p>
        </DialogHeader>

        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <ScrollArea className="flex-1 w-full max-h-[60vh]">
              <div className="p-4 space-y-3">
                {/* BASIC INFO */}
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="staffId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã nhân viên *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="VD: NV001"
                              className="h-11 !rounded-xl"
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ và tên *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nguyễn Văn A"
                              className="h-11 !rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="example@bookflow.vn"
                              className="h-11 !rounded-xl"
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="0901234567"
                              className="h-11 !rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày sinh *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              className="h-11 !rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giới tính *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 !rounded-xl">
                                <SelectValue placeholder="Chọn giới tính" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(GENDER_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key as Gender}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* WORK INFO */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">
                    Thông tin công việc
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vai trò *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 !rounded-xl">
                                <SelectValue placeholder="Chọn vai trò" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key as EmployeeRole}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trạng thái *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 !rounded-xl">
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key as EmployeeStatus}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày vào làm *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              className="h-11 !rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lương (VNĐ) *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="8000000"
                              className="h-11 !rounded-xl"
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? undefined : Number(value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* PERSONAL INFO */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">
                    Thông tin cá nhân
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="identityCard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CMND/CCCD *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="079090001234"
                              className="h-11 !rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="avatarUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL ảnh đại diện</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://..."
                              className="h-11 !rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Địa chỉ *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                              className="h-11 !rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* EMERGENCY CONTACT */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">
                    Liên hệ khẩn cấp (Tùy chọn)
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ tên</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nguyễn Văn B"
                              className="h-11 !rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="emergencyContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="0909876543"
                              className="h-11 !rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="emergencyContactRelationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mối quan hệ</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Vợ/Chồng/Anh/Chị..."
                              className="h-11 !rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* STICKY FOOTER */}
            <div className="flex-none flex justify-end gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50/50">
              <Button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="h-11 px-6 !rounded-xl !bg-white hover:!bg-gray-50 !border !border-gray-200 !text-gray-700 !font-medium !shadow-none"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-11 px-6 !rounded-xl !bg-gradient-to-r !from-[#26A69A] !to-[#4DB6AC] hover:!from-[#00897B] hover:!to-[#26A69A] !text-white !font-bold !shadow-md hover:!shadow-lg"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  'Cập nhật'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
