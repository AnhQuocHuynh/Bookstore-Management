import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Clock } from "lucide-react";
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
import { toast } from "sonner";

// Default values - sau này có thể lưu vào localStorage hoặc backend
const DEFAULT_HR_SETTINGS: HRSettingsFormData = {
  baseSalary: 4500000, // 4.5 triệu/tháng
  morningShiftStart: "07:30",
  morningShiftEnd: "12:00",
  afternoonShiftStart: "13:00",
  afternoonShiftEnd: "17:30",
  eveningShiftStart: "17:30",
  eveningShiftEnd: "21:30",
};

export function HRTab() {
  const form = useForm<HRSettingsFormData>({
    resolver: zodResolver(hrSettingsSchema),
    defaultValues: DEFAULT_HR_SETTINGS,
  });

  const onSubmit = (data: HRSettingsFormData) => {
    // TODO: Khi backend có API, gọi API ở đây
    console.log("HR Settings:", data);
    toast.success("Đã lưu cài đặt nhân sự thành công!");
  };

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
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Đặt lại
            </Button>
            <Button type="submit">Lưu thay đổi</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
