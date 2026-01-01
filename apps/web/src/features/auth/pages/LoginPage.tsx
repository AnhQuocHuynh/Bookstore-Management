import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authApi } from "@/features/auth/api/auth.api";
import LoginForm from "@/features/auth/components/LoginForm";
import { useResendOtp } from "@/features/auth/hooks/use-resend-otp";
import { useVerifyOtp } from "@/features/auth/hooks/use-verify-otp";
import { loginSchema } from "@/features/auth/schema/login.schema";
import { OtpTypeEnum } from "@/features/auth/types";
import { useAuthStore } from "@/stores/useAuthStore";
import { maskEmail } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "antd";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  otp: z.string().length(6, "Mã xác thực không hợp lệ"),
});

const RESEND_INTERVAL = 60;

const LoginPage = () => {
  const navigate = useNavigate();
  const { setSystemToken, tempCredentials } = useAuthStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const { mutate, isPending } = useVerifyOtp();
  const { mutate: mutateResendOtp, isPending: isResendPending } =
    useResendOtp();

  const handleCancel = () => {
    setIsOpen(false);
    setTimeout(() => {
      form.reset();
    }, 500);
  };

  const handleResendOTP = () => {
    if (isResendPending) return;

    mutateResendOtp(
      {
        email,
        type: OtpTypeEnum.SIGN_UP,
      },
      {
        onSuccess: (data) => {
          if (data) {
            toast.success("Mã OTP đã được gửi lại vào email của bạn.");
            localStorage.setItem("otpLastSent", Date.now().toString());
            setResendTimer(RESEND_INTERVAL);
          }
        },
      },
    );
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!values.otp || !email.trim()) return;

    mutate(
      {
        email,
        otp: values.otp,
        type: OtpTypeEnum.SIGN_UP,
      },
      {
        onSuccess: async (data: any) => {
          if (data) {
            setIsOpen(false);

            const isValidCredentials =
              !!tempCredentials?.email &&
              !!tempCredentials?.password &&
              !!tempCredentials?.role;

            if (isValidCredentials) {
              form.reset();
              await handleSubmit({
                email: tempCredentials.email,
                password: tempCredentials.password,
                role: tempCredentials.role,
              });
            }
          }
        },
      },
    );
  };

  const [resendTimer, setResendTimer] = useState(() => {
    const lastSent = localStorage.getItem("otpLastSent");
    if (lastSent) {
      const diff = Math.max(
        RESEND_INTERVAL - Math.floor((Date.now() - Number(lastSent)) / 1000),
        0,
      );
      return diff;
    }
    return 0;
  });

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const { role, email, password, username } = values;
      const isAdminOrOwnerRole =
        role === "ADMIN" ||
        role === "admin" ||
        role === "OWNER" ||
        role === "owner";
      let response;

      if (isAdminOrOwnerRole && email?.trim() && password?.trim()) {
        response = await authApi.systemLoginOwner({
          email,
          password,
        });
      } else if (username?.trim()) {
        response = await authApi.systemLoginEmployee({
          username,
        });
      }

      if (!response) return;

      const token = response.token;
      if (!token) throw new Error("Không nhận được token");
      let userData = null;

      if (response.profile) {
        userData = {
          id: response.profile.id,
          email: response.profile.email,
          name: response.profile.fullName,
          role: response.profile.role,
          avatar: response.profile.avatarUrl,
        };
      }

      setSystemToken(
        token,
        {
          email: isAdminOrOwnerRole ? values?.email?.trim() : undefined,
          username: !isAdminOrOwnerRole ? values?.username?.trim() : undefined,
          password: values.password ?? "",
          role: isAdminOrOwnerRole ? "OWNER" : "EMPLOYEE",
        },
        userData as any,
      );

      if (!response.profile.isEmailVerified) {
        setIsOpen(true);
        setFullName(response.profile.fullName);
        setEmail(response.profile.email);
        return;
      }

      toast.success("Đăng nhập thành công!");
      navigate("/select-store");
    } catch (error: any) {
      console.error("Login Error:", error.response?.data);
      const msg = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full max-w-md px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-semibold text-[#26A69A] 
            hover:text-[#00796B] mb-8 group"
        >
          <span className="mr-1 group-hover:-translate-x-1 transition-transform">
            ←
          </span>
          Quay Lại
        </Link>

        <div className="flex flex-col gap-1 items-center text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Chào mừng trở lại!
          </h1>
          <p className="text-sm text-gray-500">
            Đăng nhập để tiếp tục làm việc cùng{" "}
            <span className="font-semibold text-emerald-600">BookFlow</span>
          </p>
        </div>

        <hr className="border-t border-gray-300 my-3" />

        <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      <Modal
        title={
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold">
              Xin chào <span className="text-emerald-600">{fullName}</span>!
            </h2>
            <p className="text-sm text-gray-500 font-normal">
              Bạn chưa xác thực email. Vui lòng kiểm tra mã xác thực được gửi
              tới{" "}
              <span className="font-medium text-gray-700">
                {maskEmail(email)}
              </span>{" "}
              để tiếp tục làm việc với{" "}
              <span className="font-medium text-gray-700">BookFlow</span>.
            </p>
          </div>
        }
        open={isOpen}
        onCancel={handleCancel}
        centered
        footer={null}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2 items-center">
                  <FormControl>
                    <InputOTP
                      pattern={REGEXP_ONLY_DIGITS}
                      maxLength={6}
                      value={field.value || ""}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-500">
                  Bạn có thể yêu cầu gửi lại mã xác thực sau{" "}
                  <span className="font-bold">{resendTimer}</span> giây.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm font-semibold text-emerald-600 hover:underline cursor-pointer"
                >
                  Gửi lại mã xác thực
                </button>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="
              w-full mt-2 cursor-pointer
            "
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                "Xác nhận"
              )}
            </Button>
          </form>
        </Form>
      </Modal>
    </div>
  );
};

export default LoginPage;
