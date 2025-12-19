import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { getRandomSampleOwner } from "../constants/sampleData";

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Fill form with sample data for testing
   */
  function fillSampleData() {
    const sample = getRandomSampleOwner();
    setEmail(sample.email);
    setPassword(sample.password);
    toast.success("Đã điền dữ liệu mẫu!");
  }

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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-[#00796B] leading-tight">
            Bookstore Management
          </h1>
          <button
            type="button"
            onClick={fillSampleData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#26A69A] hover:text-[#00796B] border border-[#26A69A] hover:border-[#00796B] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Điền dữ liệu mẫu để test nhanh"
          >
            <Sparkles className="h-4 w-4" />
            Dữ liệu mẫu
          </button>
        </div>
        <p className="text-base text-[#5F7D7C] leading-relaxed">
          Phần mềm quản lý nhà sách đáng tin cậy của bạn!
        </p>
      </div>

      {/* Form - Increased Spacing */}
      <form className="space-y-7" onSubmit={handleSubmit}>
        {/* Email/Username Input - Taller & Rounder */}
        <div>
          <Input
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            className="!h-14 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !transition-colors !px-4 !text-base disabled:!opacity-50 disabled:!cursor-not-allowed"
          />
        </div>

        {/* Password Input - Taller & Rounder */}
        <div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="!h-14 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !pr-12 !transition-colors !px-4 !text-base disabled:!opacity-50 disabled:!cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00796B] transition-colors focus:outline-none focus:ring-0 disabled:!opacity-50 disabled:!cursor-not-allowed"
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
            disabled={isLoading}
            className="!w-full !h-14 !rounded-2xl !bg-gradient-to-r !from-[#6366f1] !to-[#a855f7] !text-white !font-bold !text-base !shadow-lg !shadow-indigo-500/30 hover:!shadow-xl hover:!shadow-indigo-500/40 !transition-all !duration-200 hover:!from-[#5855eb] hover:!to-[#9333ea] focus:!ring-0 focus:!ring-offset-0 !border-0 disabled:!opacity-60 disabled:!cursor-not-allowed disabled:hover:!shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang đăng nhập...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </Button>
        </div>

        {/* Register Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-[#5F7D7C]">
            Chưa có tài khoản?{" "}
            <Link
              to="/auth/register"
              className="text-[#26A69A] hover:text-[#00796B] font-semibold transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </form>
    </div>
  );

  /**
   * Handle form submission
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);

    try {
      // Call login API
      const response = await authApi.login({ email, password });

      // Extract token (handle both ADMIN and OWNER response formats)
      const accessToken = response.accessToken || response.token;
      
      if (!accessToken) {
        throw new Error("Không nhận được token từ server");
      }

      // Map backend profile to store User type
      const user = {
        id: response.profile.id,
        email: response.profile.email,
        name: response.profile.fullName,
        role: response.profile.role,
        avatar: response.profile.avatarUrl || response.profile.logoUrl || undefined,
      };

      // Update auth store
      login(user, accessToken);

      // Show success message
      toast.success("Đăng nhập thành công!");

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Extract error message from backend
      const errorMessage = 
        error?.response?.data?.message ||
        error?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
};

export default LoginPage;
