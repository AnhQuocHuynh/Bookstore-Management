import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Phone, MapPin, Mail, Loader2, ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { useSettings, useUpdateSettings, useUploadFile } from "../hooks/useSettings";
import { toast } from "sonner";

export function GeneralTab() {
  const { data: settings, isLoading, error } = useSettings();
  const updateMutation = useUpdateSettings();
  const uploadMutation = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      storeName: "",
      logoUrl: "",
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
        logoUrl: settings.general.logoUrl || "",
        contactPhone: settings.general.phone || "",
        contactEmail: settings.general.email || "",
        address: settings.general.address || "",
      });
      setPreviewUrl(settings.general.logoUrl || "");
    }
  }, [settings, form]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const result = await uploadMutation.mutateAsync(file);
      form.setValue("logoUrl", result.url);
      toast.success("Tải ảnh lên thành công!");
    } catch (err) {
      toast.error("Có lỗi khi tải ảnh lên!");
      setPreviewUrl(settings?.general?.logoUrl || "");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setPreviewUrl("");
    form.setValue("logoUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: GeneralSettingsFormData) => {
    try {
      await updateMutation.mutateAsync({
        general: {
          storeName: data.storeName,
          phone: data.contactPhone,
          email: data.contactEmail,
          address: data.address,
          logoUrl: data.logoUrl,
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
          {/* Logo Upload */}
          <FormField
            control={form.control}
            name="logoUrl"
            render={() => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <ImagePlus className="h-4 w-4" />
                  Ảnh đại diện cửa hàng
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {previewUrl ? (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Logo cửa hàng"
                            className="h-24 w-24 rounded-lg object-cover border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors"
                        >
                          {isUploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                          ) : (
                            <ImagePlus className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tải...
                          </>
                        ) : (
                          "Chọn ảnh"
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG tối đa 5MB
                      </p>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Ảnh đại diện sẽ hiển thị trên sidebar và hóa đơn
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    logoUrl: settings.general.logoUrl || "",
                    contactPhone: settings.general.phone || "",
                    contactEmail: settings.general.email || "",
                    address: settings.general.address || "",
                  });
                  setPreviewUrl(settings.general.logoUrl || "");
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
