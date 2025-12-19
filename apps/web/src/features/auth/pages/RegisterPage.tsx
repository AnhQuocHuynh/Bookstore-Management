import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { authApi } from "../api/auth.api";
import { toast } from "sonner";
import { getRandomSampleOwner } from "../constants/sampleData";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Owner Info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Store Info
  const [storeName, setStoreName] = useState("");
  const [storePhoneNumber, setStorePhoneNumber] = useState("");
  const [storeAddress, setStoreAddress] = useState("");

  /**
   * Fill form with sample data for testing
   */
  function fillSampleData() {
    const sample = getRandomSampleOwner();
    setStoreName(sample.storeName);
    setStorePhoneNumber(sample.storePhoneNumber);
    setStoreAddress(sample.storeAddress);
    setFullName(sample.fullName);
    setEmail(sample.email);
    setPhoneNumber(sample.phoneNumber);
    setBirthDate(sample.birthDate);
    setAddress(sample.address);
    setPassword(sample.password);
    setConfirmPassword(sample.password);
    toast.success("Đã điền dữ liệu mẫu!");
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate required fields
    if (
      !fullName.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !birthDate.trim() ||
      !address.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !storeName.trim() ||
      !storePhoneNumber.trim() ||
      !storeAddress.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    // Validate password strength (basic)
    if (password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    // Validate phone numbers (digits and optional + at start)
    const phoneRegex = /^\+?[0-9]+$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      toast.error("Số điện thoại không hợp lệ. Vui lòng chỉ nhập số và ký tự + ở đầu (nếu có).");
      return;
    }
    if (!phoneRegex.test(storePhoneNumber.trim())) {
      toast.error("Số điện thoại nhà sách không hợp lệ. Vui lòng chỉ nhập số và ký tự + ở đầu (nếu có).");
      return;
    }

    setIsLoading(true);

    try {
      // Call register API
      const response = await authApi.register({
        email,
        password,
        fullName,
        phoneNumber,
        birthDate, // ISO date string from input[type="date"]
        address,
        createBookStoreDto: {
          name: storeName,
          phoneNumber: storePhoneNumber,
          address: storeAddress,
        },
      });

      // Show success message
      toast.success(
        response.message ||
          "Đăng ký thành công! Vui lòng kiểm tra Email để lấy mã OTP/Kích hoạt trước khi đăng nhập.",
      );

      // Redirect to login after delay so user can read the message
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (error: any) {
      console.error("Registration error:", error);

      // Extract error message from backend
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
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

      {/* Title Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-[#00796B] leading-tight">
            Đăng ký Nhà sách
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
          Tạo tài khoản và bắt đầu quản lý nhà sách của bạn ngay hôm nay!
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Store Information Section */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-[#00796B] border-b border-[#C9D8D7] pb-2">
            Thông tin Nhà sách
          </h2>

          <div>
            <Input
              type="text"
              placeholder="Tên nhà sách"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              disabled={isLoading}
              required
              className="!h-12 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !transition-colors !px-4 !text-base disabled:!opacity-50 disabled:!cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="tel"
              placeholder="Số điện thoại nhà sách"
              value={storePhoneNumber}
              onChange={(e) => setStorePhoneNumber(e.target.value)}
              disabled={isLoading}
              required
              className="!h-12 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !transition-colors !px-4 !text-base disabled:!opacity-50 disabled:!cursor-not-allowed"
            />
            <Input
              type="text"
              placeholder="Địa chỉ nhà sách"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              disabled={isLoading}
              required
              className="!h-12 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !transition-colors !px-4 !text-base disabled:!opacity-50 disabled:!cursor-not-allowed"
            />
          </div>
        </div>

        {/* Owner Information Section */}
        <div className="space-y-5 pt-4">
          <h2 className="text-lg font-semibold text-[#00796B] border-b border-[#C9D8D7] pb-2">
            Thông tin Chủ nhà sách
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              required
              className="!h-12 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !transition-colors !px-4 !text-base disabled:!opacity-50 disabled:!cursor-not-allowed"
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="!h-12 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !transition-colors !px-4 !text-base disabled:!opacity-50 disabled:!cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="tel"
              placeholder="Số điện thoại"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
              required
              className="!h-12 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !transition-colors !px-4 !text-base disabled:!opacity-50 disabled:!cursor-not-allowed"
            />
            <Input
              type="date"
              placeholder="Ngày sinh"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={isLoading}
              required
              className="!h-12 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !transition-colors !px-4 !text-base disabled:!opacity-50 disabled:!cursor-not-allowed"
            />
          </div>

          <div>
            <Input
              type="text"
              placeholder="Địa chỉ"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isLoading}
              required
              className="!h-12 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !transition-colors !px-4 !text-base disabled:!opacity-50 disabled:!cursor-not-allowed"
            />
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-5 pt-4">
          <h2 className="text-lg font-semibold text-[#00796B] border-b border-[#C9D8D7] pb-2">
            Bảo mật
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="!h-12 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !pr-12 !transition-colors !px-4 !text-base disabled:!opacity-50 disabled:!cursor-not-allowed"
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

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                className="!h-12 !rounded-2xl !border-[#C9D8D7] !bg-[#F3F4F6] !text-gray-700 !placeholder:text-gray-400 focus:!border-[#26A69A] focus:!ring-0 focus:!outline-none focus:!ring-offset-0 !pr-12 !transition-colors !px-4 !text-base disabled:!opacity-50 disabled:!cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00796B] transition-colors focus:outline-none focus:ring-0 disabled:!opacity-50 disabled:!cursor-not-allowed"
                aria-label={
                  showConfirmPassword
                    ? "Ẩn xác nhận mật khẩu"
                    : "Hiện xác nhận mật khẩu"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-[#5F7D7C]">
            Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số
            và ký tự đặc biệt.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="!w-full !h-14 !rounded-2xl !bg-gradient-to-r !from-[#6366f1] !to-[#a855f7] !text-white !font-bold !text-base !shadow-lg !shadow-indigo-500/30 hover:!shadow-xl hover:!shadow-indigo-500/40 !transition-all !duration-200 hover:!from-[#5855eb] hover:!to-[#9333ea] focus:!ring-0 focus:!ring-offset-0 !border-0 disabled:!opacity-60 disabled:!cursor-not-allowed disabled:hover:!shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang đăng ký...
              </span>
            ) : (
              "Đăng ký Nhà sách"
            )}
          </Button>
        </div>

        {/* Login Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-[#5F7D7C]">
            Đã có tài khoản?{" "}
            <Link
              to="/auth/login"
              className="text-[#26A69A] hover:text-[#00796B] font-semibold transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;

