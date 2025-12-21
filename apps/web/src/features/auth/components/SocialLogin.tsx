import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

interface SocialLoginProps {
  onGoogleLogin?: () => void;
  onFacebookLogin?: () => void;
  label?: string;
}

const SocialLogin = ({
  onGoogleLogin,
  onFacebookLogin,
  label = "Hoặc đăng nhập với",
}: SocialLoginProps) => {
  return (
    <div className="space-y-4">
      <div className="relative flex items-center">
        <div className="grow border-t border-gray-200" />
        <span className="mx-4 text-xs text-gray-400">{label}</span>
        <div className="grow border-t border-gray-200" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          className="h-12 gap-2 rounded-xl border-gray-200 hover:bg-gray-50 cursor-pointer"
          onClick={onGoogleLogin}
        >
          <FcGoogle className="h-5 w-5" />
          Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-12 gap-2 rounded-xl border-gray-200 hover:bg-gray-50 cursor-pointer"
          onClick={onFacebookLogin}
        >
          <FaFacebook className="h-5 w-5 text-[#1877F2]" />
          Facebook
        </Button>
      </div>
    </div>
  );
};

export default SocialLogin;
