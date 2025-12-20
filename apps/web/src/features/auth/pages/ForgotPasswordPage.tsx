import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { authApi } from "../api/auth.api";
import { toast } from "sonner";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.checkEmail(email);
      toast.success(response.message || "Mã OTP đã được gửi đến email của bạn.");
      
      // Redirect to verify OTP page or login
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E0F2F1] to-[#B2DFDB] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Back Link */}
          <Link
            to="/auth/login"
            className="inline-flex items-center text-sm font-semibold text-[#26A69A] hover:text-[#00796B] mb-8 transition-colors group"
          >
            <span className="mr-1 group-hover:-translate-x-1 transition-transform">
              ←
            </span>{" "}
            Quay lại Đăng nhập
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#00796B] mb-3">
              Quên mật khẩu?
            </h1>
            <p className="text-sm text-[#5F7D7C]">
              Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="!h-12 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !transition-colors !px-4 !text-base disabled:!opacity-50 disabled:!cursor-not-allowed"
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="!w-full !h-12 !rounded-2xl !bg-gradient-to-r !from-[#6366f1] !to-[#a855f7] !text-white !font-bold !text-base !shadow-lg !shadow-indigo-500/30 hover:!shadow-xl hover:!shadow-indigo-500/40 !transition-all !duration-200 hover:!from-[#5855eb] hover:!to-[#9333ea] focus:!ring-0 focus:!ring-offset-0 !border-0 disabled:!opacity-60 disabled:!cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang gửi...
                  </span>
                ) : (
                  "Gửi mã OTP"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
