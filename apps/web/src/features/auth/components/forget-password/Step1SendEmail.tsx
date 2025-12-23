import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ForgetPasswordFormValues } from "@/features/auth/schema/forget-password.schema";
import { useFormContext } from "react-hook-form";

interface Step1SendEmailProps {
  onNext: () => void;
}

const Step1SendEmail = ({ onNext }: Step1SendEmailProps) => {
  const { control } = useFormContext<ForgetPasswordFormValues>();
  return (
    <div className="space-y-5">
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="Nhập email của bạn" {...field} />
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      <Button onClick={onNext} className="w-full mt-2 cursor-pointer">
        Gửi mã OTP
      </Button>
    </div>
  );
};

export default Step1SendEmail;
