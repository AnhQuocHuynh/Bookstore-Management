import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Phone, MapPin, Image, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import { useBookStoreSettings, useUpdateBookStore, useUploadLogo } from "../hooks/useSettings";
import { toast } from "sonner";

export function GeneralTab() {
  const { data: bookStore, isLoading, error } = useBookStoreSettings();
  const updateMutation = useUpdateBookStore();
  const uploadLogoMutation = useUploadLogo();
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

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
    if (bookStore) {
      form.reset({
        storeName: bookStore.name || "",
        logo: bookStore.logoUrl || "",
        contactPhone: bookStore.phoneNumber || "",
        contactEmail: "", // Backend chưa có field này
        address: bookStore.address || "",
      });
      setLogoPreview(bookStore.logoUrl || "");
    }
  }, [bookStore, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
    }
  };

  const onSubmit = async (data: GeneralSettingsFormData) => {
    try {
      let logoUrl = bookStore?.logoUrl;

      // Upload logo nếu có file mới
      if (logoFile) {
        const uploadResult = await uploadLogoMutation.mutateAsync(logoFile);
        logoUrl = uploadResult.url;
      }

      // Cập nhật thông tin cửa hàng
      await updateMutation.mutateAsync({
        name: data.storeName,
        phoneNumber: data.contactPhone,
        address: data.address,
        logoUrl: logoUrl,
      });

      setLogoFile(null);
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
        Không thể tải thông tin cửa hàng. Vui lòng thử lại sau.
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Logo Preview */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="logo"
                render={() => (
                  <FormItem>
                    <FormLabel>Logo cửa hàng</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Định dạng: JPG, PNG. Kích thước tối đa: 2MB
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

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

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (bookStore) {
                  form.reset({
                    storeName: bookStore.name || "",
                    logo: bookStore.logoUrl || "",
                    contactPhone: bookStore.phoneNumber || "",
                    contactEmail: "",
                    address: bookStore.address || "",
                  });
                  setLogoPreview(bookStore.logoUrl || "");
                  setLogoFile(null);
                }
              }}
            >
              Đặt lại
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || uploadLogoMutation.isPending}
            >
              {(updateMutation.isPending || uploadLogoMutation.isPending) && (
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
