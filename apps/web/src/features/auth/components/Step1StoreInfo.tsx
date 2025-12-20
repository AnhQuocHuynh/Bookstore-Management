import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegisterFormValues } from "@/features/auth/schema/register.schema";
import { useFormContext } from "react-hook-form";

interface Step1StoreProps {
  onNext: () => void;
}

export default function Step1Store({ onNext }: Step1StoreProps) {
  const { control } = useFormContext<RegisterFormValues>();

  return (
    <div className="space-y-5">
      <div className="relative">
        <h1 className="text-lg font-semibold text-[#00796B]">
          Thông tin nhà sách
        </h1>
        <p className="text-sm text-gray-600">
          Vui lòng nhập thông tin cơ bản về nhà sách của bạn
        </p>
      </div>

      <FormField
        control={control}
        name="storeName"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Tên nhà sách</FormLabel>
            <FormControl>
              <Input placeholder="Nhập tên nhà sách" {...field} />
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="storePhoneNumber"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Số điện thoại nhà sách</FormLabel>
            <FormControl>
              <Input placeholder="Nhập số điện thoại" {...field} />
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="storeAddress"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Địa chỉ nhà sách</FormLabel>
            <FormControl>
              <Input placeholder="Nhập địa chỉ" {...field} />
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      <Button onClick={onNext} className="w-full mt-6 cursor-pointer">
        Tiếp tục
      </Button>
    </div>
  );
}
