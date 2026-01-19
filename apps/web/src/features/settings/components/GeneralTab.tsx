import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Phone, MapPin, Mail, Globe, Loader2 } from "lucide-react";
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
  generalSettingsSchema,
  type GeneralSettingsFormData,
} from "../schema/general.schema";
import { useSettings, useUpdateSettings } from "../hooks/useSettings";
import { toast } from "sonner";

export function GeneralTab() {
  const { data: settings, isLoading, error } = useSettings();
  const updateMutation = useUpdateSettings();

  const form = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      storeName: "",
      logo: "",
      contactPhone: "",
      contactEmail: "",
      address: "",
    },
  });

  // Populate form khi có data từ API
  useEffect(() => {
    if (settings?.general) {
      form.reset({
        storeName: settings.general.storeName || "",
        logo: "",
        contactPhone: settings.general.phone || "",
        contactEmail: settings.general.email || "",
        address: settings.general.address || "",
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: GeneralSettingsFormData) => {
    try {
      await updateMutation.mutateAsync({
        general: {
          storeName: data.storeName,
          phone: data.contactPhone,
          email: data.contactEmail,
          address: data.address,
        },
      });
      toast.success("Đã lưu thông tin cửa hàng thành công!");
    } catch (err) {
      toast.error("Có lỗi xảy ra khi lưu thông tin!");
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
        <h3 className="text-lg font-medium">Thông tin chung</h3>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin cơ bản của cửa hàng
        </p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="storeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Tên cửa hàng
                </FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên cửa hàng" {...field} />
                </FormControl>
                <FormDescription>
                  Tên hiển thị chính thức của cửa hàng
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Số điện thoại
                </FormLabel>
                <FormControl>
                  <Input placeholder="0909 123 456" {...field} />
                </FormControl>
                <FormDescription>
                  Số điện thoại liên hệ của cửa hàng
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="contact@bookstore.com"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Email chính thức của cửa hàng</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Địa chỉ
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Địa chỉ chính thức của cửa hàng</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (settings?.general) {
                  form.reset({
                    storeName: settings.general.storeName || "",
                    logo: "",
                    contactPhone: settings.general.phone || "",
                    contactEmail: settings.general.email || "",
                    address: settings.general.address || "",
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
