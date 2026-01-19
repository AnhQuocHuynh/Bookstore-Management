import { useEffect, useState, useMemo } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, Tag } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { Loader2, Clock, Users } from 'lucide-react';
import { useSaveShift, useUpdateShift, useDeleteShift, useEmployees } from '../hooks/useEmployees';
import { ShiftType, SHIFT_LABELS, ROLE_LABELS, EmployeeRole, Shift } from '../types';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import { useShiftTimes } from '@/features/settings';

// ==========================================
// HELPER: GET ROLE BADGE COLORS
// ==========================================

// Helper để lấy màu Tag cho Ant Design (không có gradient)
const getRoleTagColor = (role: EmployeeRole): string => {
  switch (role) {
    case EmployeeRole.OWNER:
      return 'purple';
    case EmployeeRole.MANAGER:
      return 'blue';
    case EmployeeRole.CASHIER:
      return 'green';
    case EmployeeRole.WAREHOUSE:
      return 'orange';
    case EmployeeRole.SALES:
      return 'magenta'; // Ant Design có màu magenta tương tự pink/rose
    default:
      return 'default';
  }
};

// Helper để lấy màu background cho optionRender (light colors)
const getRoleOptionBgClass = (role: EmployeeRole): { bg: string; text: string } => {
  switch (role) {
    case EmployeeRole.OWNER:
      return { bg: 'bg-purple-100', text: 'text-purple-700' };
    case EmployeeRole.MANAGER:
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case EmployeeRole.CASHIER:
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case EmployeeRole.WAREHOUSE:
      return { bg: 'bg-orange-100', text: 'text-orange-700' };
    case EmployeeRole.SALES:
      return { bg: 'bg-pink-100', text: 'text-pink-700' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
};

// ==========================================
// SHIFT FORM SCHEMA (Multi-Employee Support)
// ==========================================

const shiftFormSchema = z.object({
  employeeIds: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 nhân viên'),
  date: z
    .string()
    .min(1, 'Vui lòng chọn ngày')
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      'Không thể thêm, sửa hoặc xóa ca làm việc cho các ngày trong quá khứ'
    ),
  shiftType: z.enum([
    ShiftType.MORNING,
    ShiftType.AFTERNOON,
    ShiftType.EVENING,
    ShiftType.FULL_DAY,
  ], {
    message: 'Vui lòng chọn ca làm việc',
  }),
  startTime: z.string().min(1, 'Vui lòng nhập giờ bắt đầu'),
  endTime: z.string().min(1, 'Vui lòng nhập giờ kết thúc'),
  notes: z.string().optional(),
});

type ShiftFormData = z.infer<typeof shiftFormSchema>;

// ==========================================
// SHIFT TIME PRESETS (Fallback)
// ==========================================

const DEFAULT_SHIFT_TIMES = {
  [ShiftType.MORNING]: { start: '07:30', end: '12:00' },
  [ShiftType.AFTERNOON]: { start: '13:00', end: '17:30' },
  [ShiftType.EVENING]: { start: '17:30', end: '21:30' },
  [ShiftType.FULL_DAY]: { start: '07:30', end: '21:30' },
};

// ==========================================
// SHIFT MODAL PROPS
// ==========================================

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string; // Format: YYYY-MM-DD
  editingShift?: Shift | null; // If provided, modal is in edit mode
}

// ==========================================
// SHIFT MODAL COMPONENT
// ==========================================

export const ShiftModal = ({ isOpen, onClose, defaultDate, editingShift }: ShiftModalProps) => {
  // State for custom time toggle
  const [customTime, setCustomTime] = useState(false);
  
  // Fetch employees for dropdown
  const { data: employeesData } = useEmployees();
  const { mutateAsync: saveShift, isPending: isSaving } = useSaveShift({ showToast: false }); // Disable individual toasts, show summary instead
  const { mutateAsync: updateShift, isPending: isUpdating } = useUpdateShift();
  const { mutateAsync: deleteShift, isPending: isDeleting } = useDeleteShift();
  
  // Fetch shift times from settings
  const { data: shiftTimesData } = useShiftTimes();
  
  // Dynamic shift times from settings
  const SHIFT_TIMES = useMemo(() => {
    if (!shiftTimesData) return DEFAULT_SHIFT_TIMES;
    
    return {
      [ShiftType.MORNING]: { start: shiftTimesData.morning.startTime, end: shiftTimesData.morning.endTime },
      [ShiftType.AFTERNOON]: { start: shiftTimesData.afternoon.startTime, end: shiftTimesData.afternoon.endTime },
      [ShiftType.EVENING]: { start: shiftTimesData.evening.startTime, end: shiftTimesData.evening.endTime },
      [ShiftType.FULL_DAY]: { start: shiftTimesData.fullDay.startTime, end: shiftTimesData.fullDay.endTime },
    };
  }, [shiftTimesData]);
  
  const isPending = isSaving || isUpdating || isDeleting;
  const isEditing = !!editingShift;

  // Helper: Get default date (tomorrow if no defaultDate provided)
  const getDefaultDate = () => {
    if (defaultDate) return defaultDate;
    const tomorrow = addDays(new Date(), 1);
    return format(tomorrow, 'yyyy-MM-dd');
  };

  // Form
  const form = useForm<ShiftFormData>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      employeeIds: [],
      date: getDefaultDate(),
      shiftType: ShiftType.MORNING,
      startTime: DEFAULT_SHIFT_TIMES[ShiftType.MORNING].start,
      endTime: DEFAULT_SHIFT_TIMES[ShiftType.MORNING].end,
      notes: '',
    },
  });
  
  // Update default times when shiftTimesData loads
  useEffect(() => {
    if (shiftTimesData && !isOpen) {
      form.setValue('startTime', SHIFT_TIMES[ShiftType.MORNING].start);
      form.setValue('endTime', SHIFT_TIMES[ShiftType.MORNING].end);
    }
  }, [shiftTimesData, SHIFT_TIMES, form, isOpen]);

  // Pre-fill form when editingShift changes
  useEffect(() => {
    if (isOpen && editingShift) {
      // Check if editing shift has custom times
      const presetTimes = SHIFT_TIMES[editingShift.shiftType];
      const hasCustomTime = editingShift.startTime !== presetTimes.start || editingShift.endTime !== presetTimes.end;
      setCustomTime(hasCustomTime);
      
      form.reset({
        employeeIds: [editingShift.employeeId],
        date: editingShift.date,
        shiftType: editingShift.shiftType,
        startTime: editingShift.startTime,
        endTime: editingShift.endTime,
        notes: editingShift.notes || '',
      });
    } else if (isOpen && !editingShift) {
      // Reset to default values when creating new shift (use dynamic SHIFT_TIMES)
      setCustomTime(false);
      const morningTimes = SHIFT_TIMES[ShiftType.MORNING];
      form.reset({
        employeeIds: [],
        date: getDefaultDate(),
        shiftType: ShiftType.MORNING,
        startTime: morningTimes.start,
        endTime: morningTimes.end,
        notes: '',
      });
    }
  }, [isOpen, editingShift, defaultDate, form, SHIFT_TIMES]);

  // Update times when shift type changes (only when not in custom time mode)
  useEffect(() => {
    const currentShiftType = form.watch('shiftType');
    if (!customTime && currentShiftType) {
      const times = SHIFT_TIMES[currentShiftType as ShiftType];
      if (times) {
        form.setValue('startTime', times.start);
        form.setValue('endTime', times.end);
      }
    }
  }, [form.watch('shiftType'), customTime, form]);

  // ==========================================
  // GROUP EMPLOYEES BY ROLE
  // ==========================================

  const groupedEmployeeOptions = (): DefaultOptionType[] => {
    if (!employeesData?.data) return [];

    // Group employees by role
    const employeesByRole: Partial<Record<EmployeeRole, typeof employeesData.data>> = {
      [EmployeeRole.OWNER]: [],
      [EmployeeRole.MANAGER]: [],
      [EmployeeRole.CASHIER]: [],
      [EmployeeRole.WAREHOUSE]: [],
      [EmployeeRole.SALES]: [],
    };

    employeesData.data.forEach((emp: typeof employeesData.data[0]) => {
      const role = emp.role as EmployeeRole;
      if (role && employeesByRole[role]) {
        employeesByRole[role]!.push(emp);
      }
    });

    // Create grouped options
    const groups: DefaultOptionType[] = [];

    Object.entries(employeesByRole).forEach(([role, employees]) => {
      if (employees.length > 0) {
        const roleLabel = ROLE_LABELS[role as EmployeeRole];
        groups.push({
          label: roleLabel,
          options: employees.map((emp: typeof employees[0]) => ({
            label: `${emp.fullName} (${emp.staffId})`,
            value: emp.id,
          })),
        });
      }
    });

    return groups;
  };

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleSubmit = async (data: ShiftFormData) => {
    // Check if date is in the past
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Không thể thêm hoặc sửa ca làm việc cho các ngày trong quá khứ');
      return;
    }
    
    // Additional check for editing: prevent editing past shifts
    if (isEditing && editingShift) {
      const shiftDate = new Date(editingShift.date);
      shiftDate.setHours(0, 0, 0, 0);
      
      if (shiftDate < today) {
        toast.error('Không thể sửa ca làm việc cho các ngày trong quá khứ');
        return;
      }
    }
    
    if (isEditing && editingShift) {
      // Edit mode: Update existing shift
      try {
        const { employeeIds, ...shiftData } = data;
        const employeeId = employeeIds[0]; // In edit mode, only one employee
        const employee = employeesData?.data.find((e: typeof employeesData.data[0]) => e.id === employeeId);
        
        await updateShift({
          id: editingShift.id,
          data: {
            employeeId,
            employeeName: employee?.fullName || editingShift.employeeName,
            ...shiftData,
          },
        });
        form.reset();
        onClose();
      } catch (error) {
        console.error('Failed to update shift:', error);
      }
    } else {
      // Create mode: Create shifts for all selected employees
      const { employeeIds, ...shiftData } = data;
      let successCount = 0;
      let failCount = 0;

      for (const employeeId of employeeIds) {
        const employee = employeesData?.data.find((e: typeof employeesData.data[0]) => e.id === employeeId);
        if (employee) {
          try {
            await saveShift({
              employeeId,
              employeeName: employee.fullName,
              ...shiftData,
            });
            successCount++;
          } catch (error) {
            failCount++;
            console.error('Failed to save shift:', error);
          }
        }
      }

      // Show summary toast
      if (successCount > 0) {
        toast.success(
          `Đã tạo ca làm việc cho ${successCount} nhân viên${failCount > 0 ? ` (${failCount} thất bại)` : ''}!`
        );
        form.reset();
        onClose();
      } else if (failCount > 0) {
        toast.error(`Không thể tạo ca làm việc cho ${failCount} nhân viên!`);
      }
    }
  };

  const handleDelete = async () => {
    if (!editingShift) return;
    
    // Check if shift date is in the past
    const shiftDate = new Date(editingShift.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    shiftDate.setHours(0, 0, 0, 0);
    
    if (shiftDate < today) {
      toast.error('Không thể xóa ca làm việc cho các ngày trong quá khứ');
      return;
    }
    
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa ca làm việc của ${editingShift.employeeName} vào ngày ${format(new Date(editingShift.date), 'dd/MM/yyyy')}?`
    );
    
    if (!confirmed) return;

    try {
      await deleteShift(editingShift.id);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Failed to delete shift:', error);
    }
  };

  const handleShiftTypeChange = (shiftType: ShiftType) => {
    const times = SHIFT_TIMES[shiftType];
    form.setValue('shiftType', shiftType);
    form.setValue('startTime', times.start);
    form.setValue('endTime', times.end);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
          className="
          z-50
          w-[95vw] max-w-2xl
          max-h-[90vh]
          flex flex-col
          bg-white
          p-0
          rounded-xl
          shadow-2xl
          border-none
          overflow-hidden
        "
      >
        <DialogHeader className="flex-none px-4 pt-4 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg !bg-[#1a998f] flex items-center justify-center">
              <Clock className="w-5 h-5 !text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-800">
                {isEditing ? 'Cập nhật ca làm việc' : 'Thêm Ca Làm Việc'}
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                {isEditing ? 'Chỉnh sửa thông tin ca làm việc' : 'Phân công ca làm việc cho nhân viên'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* FORM CONTENT */}
            
            <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
    <div className="p-4 space-y-4">
              {/* EMPLOYEE & DATE */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl">
                <h3 className="text-base font-semibold text-gray-800 mb-3">
                  Thông tin cơ bản
                </h3>
                <div className="space-y-4">
                  {/* EMPLOYEE MULTI-SELECT */}
                  <FormField
                    control={form.control}
                    name="employeeIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Nhân viên <span className="text-red-500">*</span>
                          {!isEditing && (
                            <span className="text-xs text-gray-500 font-normal">
                              (Có thể chọn nhiều)
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Select
                            mode={isEditing ? undefined : "multiple"}
                            value={isEditing ? field.value?.[0] : field.value}
                            onChange={(value) => {
                              if (isEditing) {
                                field.onChange([value]);
                              } else {
                                field.onChange(value);
                              }
                            }}
                            placeholder="Chọn nhân viên cần phân ca..."
                            size="large"
                            className="w-full"
                            style={{ minHeight: '44px' }}
                            maxTagCount="responsive"
                            disabled={isEditing}
                            virtual={false}
                            listHeight={250}
                            getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
                            dropdownStyle={{ zIndex: 9999 }}
                            optionFilterProp="label"
                            tagRender={(props) => {
                              const { label, value, closable, onClose } = props;
                              const emp = employeesData?.data.find((e: typeof employeesData.data[0]) => e.id === value);
                              const role = emp?.role || EmployeeRole.CASHIER;
                              const tagColor = getRoleTagColor(role);
                              return (
                                <Tag
                                  color={tagColor}
                                  closable={closable}
                                  onClose={onClose}
                                  style={{ marginRight: 3 }}
                                >
                                  {label}
                                </Tag>
                              );
                            }}
                            optionRender={(option) => {
                              const emp = employeesData?.data.find((e: typeof employeesData.data[0]) => e.id === option.value);
                              if (!emp) {
                                return <span className="font-medium text-gray-800">{option.label}</span>;
                              }
                              const colorClasses = getRoleOptionBgClass(emp.role);
                              const roleLabel = emp.role in ROLE_LABELS ? ROLE_LABELS[emp.role as keyof typeof ROLE_LABELS] : emp.role;
                              return (
                                <div className="flex justify-between items-center w-full py-1">
                                  <span className="font-medium text-gray-800">
                                    {option.label}
                                  </span>
                                  <span className={`text-xs ${colorClasses.bg} ${colorClasses.text} px-2 py-0.5 rounded font-medium`}>
                                    {roleLabel}
                                  </span>
                                </div>
                              );
                            }}
                            options={groupedEmployeeOptions()}
                            showSearch
                            filterOption={(input, option) => {
                              const searchTerm = input.toLowerCase();
                              const label = (option?.label ?? '').toString().toLowerCase();
                              return label.includes(searchTerm);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* DATE */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => {
                      // Set min date to today to prevent selecting past dates
                      const todayStr = format(new Date(), 'yyyy-MM-dd');
                      
                      // If editing a past shift, disable the date input
                      let isPastShift = false;
                      if (editingShift) {
                        const shiftDate = new Date(editingShift.date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        shiftDate.setHours(0, 0, 0, 0);
                        isPastShift = shiftDate < today;
                      }
                      
                      return (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Ngày làm việc <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              min={todayStr}
                              disabled={isPastShift}
                              className="h-11 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </FormControl>
                          {isPastShift && (
                            <p className="text-xs text-amber-600 mt-1">
                              Không thể thay đổi ngày cho ca làm việc trong quá khứ
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                </div>
              </div>

              {/* SHIFT DETAILS */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-800">
                    Chi tiết ca làm
                  </h3>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-gray-600 leading-6">Tùy chỉnh giờ</span>
                    <Switch
                      checked={customTime}
                      onCheckedChange={(checked: boolean) => {
                        setCustomTime(checked);
                        if (!checked) {
                          // Reset to preset times when disabling custom time
                          const currentShiftType = form.getValues('shiftType');
                          const preset = SHIFT_TIMES[currentShiftType];
                          if (preset) {
                            form.setValue('startTime', preset.start);
                            form.setValue('endTime', preset.end);
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* SHIFT TYPE */}
                  <FormField
                  control={form.control}
                  name="shiftType"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Ca làm việc</FormLabel>
                      <FormControl>
                        <Select
                          className="w-full h-11"
                          // FIX 1: Tắt cuộn ảo để tránh lỗi tính toán chiều cao trong Modal
                          virtual={false}
                          // FIX 2: Ép Z-Index lên cực cao để đè lên mọi layer khác
                          dropdownStyle={{ zIndex: 9999 }}
                          // FIX 3: Render dropdown gắn vào phần tử cha để tránh trôi layout
                          getPopupContainer={(triggerNode) =>
                            triggerNode.parentElement
                          }
                          value={field.value}
                          onChange={field.onChange}
                          options={Object.values(ShiftType).map((type) => ({
                            label: SHIFT_LABELS[type],
                            value: type,
                          }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                  {/* START TIME */}
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Giờ bắt đầu <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            disabled={!customTime}
                            className="h-11 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* END TIME */}
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Giờ kết thúc <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            disabled={!customTime}
                            className="h-11 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {!customTime && (
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Khung giờ đã được thiết lập sẵn cho mỗi ca. Bật "Tùy chỉnh giờ" nếu cần thay đổi.
                  </p>
                )}
              </div>

              {/* NOTES */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl">
                <h3 className="text-base font-semibold text-gray-800 mb-3">
                  Ghi chú
                </h3>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ghi chú thêm cho ca làm việc (tùy chọn)"
                          className="h-11 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            </div>
            </div>

            {/* STICKY FOOTER */}
            <div className="flex-none flex justify-between items-center gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50/50">
              {/* Left: Delete Button (only in edit mode) */}
              <div>
                {isEditing && (
                  <Button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="h-11 px-6 !rounded-xl !bg-red-50 hover:!bg-red-100 !border !border-red-300 !text-red-600 !font-semibold !shadow-none"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xóa...
                      </>
                    ) : (
                      'Xóa ca'
                    )}
                  </Button>
                )}
              </div>
              
              {/* Right: Cancel & Submit Buttons */}
              <div className="flex gap-3">
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
                  className="h-11 px-6 !rounded-xl !bg-[#1a998f] hover:!bg-[#158f85] !text-white !font-bold !shadow-md hover:!shadow-lg border-none"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditing ? 'Đang lưu...' : 'Đang lưu...'}
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      {isEditing
                        ? 'Lưu thay đổi'
                        : form.watch('employeeIds')?.length > 0
                        ? `Tạo ca cho ${form.watch('employeeIds').length} nhân viên`
                        : 'Thêm ca làm việc'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
