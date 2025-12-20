import LoginForm from "@/features/auth/components/LoginForm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores/useAuthStore";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { getRandomSampleOwner } from "../constants/sampleData";

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function fillSampleData() {
    const sample = getRandomSampleOwner();
    setEmail(sample.email);
    setPassword(sample.password);
    toast.success("Đã điền dữ liệu mẫu!");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      const accessToken = response.accessToken || response.token;

      if (!accessToken) throw new Error("Không nhận được token");

      const user = {
        id: response.profile.id,
        email: response.profile.email,
        name: response.profile.fullName,
        role: response.profile.role,
        avatar:
          response.profile.avatarUrl || response.profile.logoUrl || undefined,
      };

      login(user, accessToken);
      toast.success("Đăng nhập thành công!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Đăng nhập thất bại"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center w-full">
      <ScrollArea className="h-dvh w-full flex justify-center">
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

          <LoginForm />
        </div>
      </ScrollArea>
    </div>
  );
};

export default LoginPage;
