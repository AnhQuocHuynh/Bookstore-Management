import NotFoundPage from "@/components/NotFound";
import VerifyEmailForm from "@/features/auth/components/VerifyEmailForm";
import { useAuthStore } from "@/stores/useAuthStore";
import { Link } from "react-router-dom";

const VerifyEmailPage = () => {
  const { registerTemp } = useAuthStore();

  if (!registerTemp) return <NotFoundPage />;

  return (
    <div className="flex flex-col items-center h-screen justify-center">
      <div className="flex flex-col gap-1 items-center text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Xác thực email của bạn
        </h1>
        <p className="text-sm text-gray-500">
          Cảm ơn bạn đã đăng ký! Vui lòng nhập{" "}
          <span className="font-semibold">mã xác thực (OTP) </span>
          được gửi đến email của bạn để hoàn tất đăng ký. Sau đó, bạn có thể bắt
          đầu quản lý nhà sách dễ dàng với{" "}
          <span className="font-extrabold text-[#00796B]">BookFlow</span>.
        </p>
      </div>

      <VerifyEmailForm />

      <p className="text-center text-sm text-gray-600 mt-6">
        Đã có tài khoản?{" "}
        <Link
          to="/auth/login"
          className="font-semibold text-emerald-600 hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default VerifyEmailPage;
