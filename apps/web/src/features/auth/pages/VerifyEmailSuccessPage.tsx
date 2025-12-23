"use client";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const VerifyEmailSuccessPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="flex flex-col gap-4 items-center text-center mb-8">
        <CheckCircle className="w-20 h-20 text-green-500" />
        <h1 className="text-2xl font-bold text-gray-800">
          Xác thực email thành công!
        </h1>
        <p className="text-sm text-gray-500 max-w-md">
          Cảm ơn bạn đã xác thực email. Giờ bạn có thể đăng nhập để khám phá mọi
          cuốn sách và quản lý nhà sách của mình dễ dàng với{" "}
          <span className="font-extrabold text-[#00796B]">BookFlow</span>.
        </p>
      </div>

      <p className="text-center text-sm text-gray-600">
        <Link
          to="/auth/login"
          className="font-semibold text-emerald-600 hover:underline"
        >
          Quay lại Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default VerifyEmailSuccessPage;
