import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Step4ChangePasswordSuccess = () => {
  return (
    <div className="space-y-6 text-center">
      {/* Icon */}
      <div className="flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800">
        Đặt lại mật khẩu thành công
      </h2>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed">
        Mật khẩu của bạn đã được cập nhật thành công.
        <br />
        Bạn có thể sử dụng mật khẩu mới để đăng nhập và tiếp tục quản lý nhà
        sách với <span className="font-extrabold text-[#00796B]">BookFlow</span>
        .
      </p>

      {/* Action */}
      <Button
        asChild
        className="w-full mt-4 cursor-pointer text-white
      !bg-gradient-to-r !from-emerald-500 !to-teal-600
              hover:!from-emerald-600 hover:!to-teal-700 text-white"
      >
        <Link to="/auth/login" className="text-white">
          Quay lại Đăng nhập
        </Link>
      </Button>
    </div>
  );
};

export default Step4ChangePasswordSuccess;
