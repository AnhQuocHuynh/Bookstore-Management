import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Loader2 } from "lucide-react";
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
    },
  });

  // Populate form khi có data từ API
  useEffect(() => {
    if (settings?.hr) {
      form.reset({
        baseSalary: settings.hr.baseSalary ?? 4500000,
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: HRSettingsFormData) => {
    try {
      await updateMutation.mutateAsync({
        hr: {
          baseSalary: data.baseSalary,
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
        <h3 className="text-lg font-medium">Nhân sự</h3>
        <p className="text-sm text-muted-foreground">
          Quản lý cài đặt lương cơ bản
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

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (settings?.hr) {
                  form.reset({
                    baseSalary: settings.hr.baseSalary ?? 4500000,
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
