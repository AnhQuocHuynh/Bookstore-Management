import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Receipt, Percent, CreditCard } from "lucide-react";
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
import { toast } from "sonner";

// Default values - sau này có thể lưu vào localStorage hoặc backend
const DEFAULT_SALES_SETTINGS: SalesSettingsFormData = {
  taxRate: 8, // 8% VAT tiêu chuẩn
  receiptFooter: "Cảm ơn quý khách đã ủng hộ văn hóa đọc!\nHẹn gặp lại!",
  enableCash: true,
  enableCard: true,
  enableBankTransfer: true,
  enableMomo: true,
  enableZaloPay: true,
};

export function SalesTab() {
  const form = useForm<SalesSettingsFormData>({
    resolver: zodResolver(salesSettingsSchema),
    defaultValues: DEFAULT_SALES_SETTINGS,
  });

  const onSubmit = (data: SalesSettingsFormData) => {
    // TODO: Khi backend có API, gọi API ở đây
    console.log("Sales Settings:", data);
    toast.success("Đã lưu cài đặt bán hàng thành công!");
  };

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
                  Thuế suất (%)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="8"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
