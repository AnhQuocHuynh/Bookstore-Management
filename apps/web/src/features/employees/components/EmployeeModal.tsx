import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Loader2, Sparkles } from 'lucide-react';
import { employeeFormSchema, type EmployeeFormValues } from '../schema/employee.schema';
import { useCreateEmployee, useUpdateEmployee } from '../hooks/useEmployees';
import {
  Employee,
  EmployeeRole,
  EmployeeStatus,
  Gender,
  ROLE_LABELS,
  STATUS_LABELS,
  GENDER_LABELS,
} from '../types';
import { SAMPLE_EMPLOYEE_FORM_DATA } from '../constants/sampleEmployees';
import { toast } from 'sonner';

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
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
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
    },
  });

  // ==========================================
  // EFFECTS
  // ==========================================

  useEffect(() => {
    if (employee) {
      form.reset({
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
    } else {
      form.reset({
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
      });
    }
  }, [employee, open]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleFillSampleData = () => {
    form.reset(SAMPLE_EMPLOYEE_FORM_DATA);
    toast.success('Đã điền dữ liệu mẫu!');
  };

  const onSubmit = (data: EmployeeFormValues) => {
    if (isEditing) {
      updateMutation.mutate(
        { id: employee.id, data },
        {
          onSuccess: () => {
            onClose();
            form.reset();
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onClose();
          form.reset();
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
            </DialogTitle>
            {!isEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFillSampleData}
                className="border-[#26A69A] text-[#26A69A] hover:bg-[#26A69A] hover:text-white rounded-xl"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Dữ liệu mẫu
              </Button>
            )}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* BASIC INFO */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="staffId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã nhân viên *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="VD: NV001"
                          className="h-12 rounded-2xl"
                          disabled={isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nguyễn Văn A"
                          className="h-12 rounded-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="example@bookflow.vn"
                          className="h-12 rounded-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0901234567"
                          className="h-12 rounded-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày sinh *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="h-12 rounded-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giới tính *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-2xl">
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(GENDER_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Thông tin công việc
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vai trò *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-2xl">
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
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
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-2xl">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
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
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày vào làm *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="h-12 rounded-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lương (VNĐ) *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="8000000"
                          className="h-12 rounded-2xl"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* PERSONAL INFO */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="identityCard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CMND/CCCD *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="079090001234"
                          className="h-12 rounded-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL ảnh đại diện</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://..."
                          className="h-12 rounded-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Địa chỉ *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                          className="h-12 rounded-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* EMERGENCY CONTACT */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Liên hệ khẩn cấp (Tùy chọn)
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ tên</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nguyễn Văn B"
                          className="h-12 rounded-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0909876543"
                          className="h-12 rounded-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContactRelationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mối quan hệ</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Vợ/Chồng/Anh/Chị..."
                          className="h-12 rounded-2xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-12 px-8 rounded-2xl"
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-12 px-8 bg-gradient-to-r from-[#26A69A] to-[#4DB6AC] hover:from-[#00897B] hover:to-[#26A69A] text-white rounded-2xl"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : isEditing ? (
                  'Cập nhật'
                ) : (
                  'Thêm nhân viên'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
