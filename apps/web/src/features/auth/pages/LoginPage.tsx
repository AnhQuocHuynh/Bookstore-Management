import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Back Link */}
      <Link
        to="/"
        className="inline-flex items-center text-sm font-semibold text-[#26A69A] hover:text-[#00796B] mb-8 transition-colors group"
      >
        <span className="mr-1 group-hover:-translate-x-1 transition-transform">←</span> Quay Lại
      </Link>

      {/* Title Section - More Spacing */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-[#00796B] mb-4 leading-tight">
          Bookstore Management
        </h1>
        <p className="text-base text-[#5F7D7C] leading-relaxed">
          Phần mềm quản lý nhà sách đáng tin cậy của bạn!
        </p>
      </div>

      {/* Form - Increased Spacing */}
      <form className="space-y-7" onSubmit={(e) => e.preventDefault()}>
        {/* Email/Username Input - Taller & Rounder */}
        <div>
          <Input
            type="text"
            placeholder="Nhập email/tên đăng nhập"
            className="!h-14 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !transition-colors !px-4 !text-base"
          />
        </div>

        {/* Password Input - Taller & Rounder */}
        <div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              className="!h-14 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !pr-12 !transition-colors !px-4 !text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00796B] transition-colors focus:outline-none focus:ring-0"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password - More Spacing */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-[#C9D8D7] text-[#26A69A] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#26A69A]"
            />
            <Label
              htmlFor="remember"
              className="text-sm text-[#00796B] cursor-pointer font-normal"
            >
              Ghi nhớ đăng nhập
            </Label>
          </div>
          <Link
            to="/auth/forgot-password"
            className="text-sm text-[#00796B] hover:text-[#26A69A] transition-colors font-medium"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Sign In Button - Premium Gradient */}
        <div className="pt-4">
          <Button
            type="submit"
            className="!w-full !h-14 !rounded-2xl !bg-gradient-to-r !from-[#6366f1] !to-[#a855f7] !text-white !font-bold !text-base !shadow-lg !shadow-indigo-500/30 hover:!shadow-xl hover:!shadow-indigo-500/40 !transition-all !duration-200 hover:!from-[#5855eb] hover:!to-[#9333ea] focus:!ring-0 focus:!ring-offset-0 !border-0"
          >
            Đăng nhập
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
