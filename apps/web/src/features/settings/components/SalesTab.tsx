import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Receipt, Percent, CreditCard, Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  salesSettingsSchema,
  type SalesSettingsFormData,
} from "../schema/sales.schema";
import { useSettings, useUpdateSettings } from "../hooks/useSettings";
import { toast } from "sonner";

export function SalesTab() {
  const { data: settings, isLoading, error } = useSettings();
  const updateMutation = useUpdateSettings();

  const form = useForm<SalesSettingsFormData>({
    resolver: zodResolver(salesSettingsSchema),
    defaultValues: {
      taxRate: 8,
      receiptFooter: "",
      enableCash: true,
      enableCard: true,
      enableBankTransfer: true,
      enableMomo: true,
      enableZaloPay: true,
    },
  });

  // Populate form khi có data từ API
  useEffect(() => {
    if (settings?.pos) {
      form.reset({
        taxRate: settings.pos.vatRate ?? 8,
        receiptFooter: settings.pos.receiptFooter ?? "",
        enableCash: settings.pos.enableCash ?? true,
        enableCard: settings.pos.enableCard ?? true,
        enableBankTransfer: settings.pos.enableBankTransfer ?? true,
        enableMomo: settings.pos.enableMomo ?? true,
        enableZaloPay: settings.pos.enableZaloPay ?? true,
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: SalesSettingsFormData) => {
    try {
      await updateMutation.mutateAsync({
        pos: {
          vatRate: data.taxRate,
          receiptFooter: data.receiptFooter,
          enableCash: data.enableCash,
          enableCard: data.enableCard,
          enableBankTransfer: data.enableBankTransfer,
          enableMomo: data.enableMomo,
          enableZaloPay: data.enableZaloPay,
        },
      });
      toast.success("Đã lưu cài đặt bán hàng thành công!");
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
        <h3 className="text-lg font-medium">Bán hàng & POS</h3>
        <p className="text-sm text-muted-foreground">
          Cấu hình thuế, hóa đơn và phương thức thanh toán
        </p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="taxRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Thuế VAT (%)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="8"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Thuế VAT áp dụng cho các giao dịch bán hàng
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receiptFooter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Chân trang hóa đơn
                </FormLabel>
                <FormControl>
                  <Input placeholder="Cảm ơn quý khách..." {...field} />
                </FormControl>
                <FormDescription>
                  Dòng chữ hiển thị ở cuối hóa đơn
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium flex items-center gap-2 mb-4">
                <CreditCard className="h-4 w-4" />
                Phương thức thanh toán
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Bật/tắt các phương thức thanh toán khả dụng
              </p>
            </div>

            <FormField
              control={form.control}
              name="enableCash"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Tiền mặt</FormLabel>
                    <FormDescription>
                      Cho phép thanh toán bằng tiền mặt
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableCard"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Thẻ tín dụng/Ghi nợ
                    </FormLabel>
                    <FormDescription>Thanh toán qua máy POS</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableBankTransfer"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Chuyển khoản ngân hàng
                    </FormLabel>
                    <FormDescription>
                      Chuyển khoản qua tài khoản ngân hàng
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableMomo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ví MoMo</FormLabel>
                    <FormDescription>
                      Thanh toán qua ví điện tử MoMo
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableZaloPay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">ZaloPay</FormLabel>
                    <FormDescription>
                      Thanh toán qua ví điện tử ZaloPay
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (settings?.pos) {
                  form.reset({
                    taxRate: settings.pos.vatRate ?? 8,
                    receiptFooter: settings.pos.receiptFooter ?? "",
                    enableCash: settings.pos.enableCash ?? true,
                    enableCard: settings.pos.enableCard ?? true,
                    enableBankTransfer: settings.pos.enableBankTransfer ?? true,
                    enableMomo: settings.pos.enableMomo ?? true,
                    enableZaloPay: settings.pos.enableZaloPay ?? true,
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
