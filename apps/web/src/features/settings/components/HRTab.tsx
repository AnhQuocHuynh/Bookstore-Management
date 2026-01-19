import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Clock, Loader2 } from "lucide-react";
import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  hrSettingsSchema,
  type HRSettingsFormData,
} from "../schema/hr.schema";
import { useSettings, useUpdateSettings } from "../hooks/useSettings";
import { toast } from "sonner";

export function HRTab() {
  const { data: settings, isLoading, error } = useSettings();
  const updateMutation = useUpdateSettings();

  const form = useForm<HRSettingsFormData>({
    resolver: zodResolver(hrSettingsSchema),
    defaultValues: {
      baseSalary: 4500000,
      morningShiftStart: "07:30",
      morningShiftEnd: "12:00",
      afternoonShiftStart: "13:00",
      afternoonShiftEnd: "17:30",
      eveningShiftStart: "17:30",
      eveningShiftEnd: "21:30",
    },
  });

  // Populate form khi có data từ API
  useEffect(() => {
    if (settings?.hr) {
      form.reset({
        baseSalary: settings.hr.baseSalary ?? 4500000,
        morningShiftStart: settings.hr.morningShiftStart ?? "07:30",
        morningShiftEnd: settings.hr.morningShiftEnd ?? "12:00",
        afternoonShiftStart: settings.hr.afternoonShiftStart ?? "13:00",
        afternoonShiftEnd: settings.hr.afternoonShiftEnd ?? "17:30",
        eveningShiftStart: settings.hr.eveningShiftStart ?? "17:30",
        eveningShiftEnd: settings.hr.eveningShiftEnd ?? "21:30",
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: HRSettingsFormData) => {
    try {
      await updateMutation.mutateAsync({
        hr: {
          baseSalary: data.baseSalary,
          morningShiftStart: data.morningShiftStart,
          morningShiftEnd: data.morningShiftEnd,
          afternoonShiftStart: data.afternoonShiftStart,
          afternoonShiftEnd: data.afternoonShiftEnd,
          eveningShiftStart: data.eveningShiftStart,
          eveningShiftEnd: data.eveningShiftEnd,
        },
      });
      toast.success("Đã lưu cài đặt nhân sự thành công!");
    } catch (err) {
      toast.error("Có lỗi xảy ra khi lưu cài đặt!");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2 text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Không thể tải cài đặt. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Nhân sự & Ca làm</h3>
        <p className="text-sm text-muted-foreground">
          Quản lý lương cơ bản và ca làm việc
        </p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="baseSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Lương cơ bản (VNĐ/tháng)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="4500000"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Mức lương cơ bản mặc định cho nhân viên mới
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4" />
                Thời gian ca làm việc
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Cấu hình giờ bắt đầu và kết thúc cho từng ca
              </p>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h5 className="font-medium text-teal-700">Ca sáng</h5>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="morningShiftStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bắt đầu</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="morningShiftEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kết thúc</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h5 className="font-medium text-orange-600">Ca chiều</h5>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="afternoonShiftStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bắt đầu</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="afternoonShiftEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kết thúc</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h5 className="font-medium text-indigo-600">Ca tối</h5>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="eveningShiftStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bắt đầu</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eveningShiftEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kết thúc</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (settings?.hr) {
                  form.reset({
                    baseSalary: settings.hr.baseSalary ?? 4500000,
                    morningShiftStart: settings.hr.morningShiftStart ?? "07:30",
                    morningShiftEnd: settings.hr.morningShiftEnd ?? "12:00",
                    afternoonShiftStart: settings.hr.afternoonShiftStart ?? "13:00",
                    afternoonShiftEnd: settings.hr.afternoonShiftEnd ?? "17:30",
                    eveningShiftStart: settings.hr.eveningShiftStart ?? "17:30",
                    eveningShiftEnd: settings.hr.eveningShiftEnd ?? "21:30",
                  });
                }
              }}
            >
              Đặt lại
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
