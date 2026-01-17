import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";

export default function UserMenu() {
  const { user, logoutAsync } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutAsync();
      // Navigate về trang login sau khi logout thành công
      navigate("/auth/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn navigate về login ngay cả khi có lỗi
      navigate("/auth/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          {user?.avatarUrl ? (
            <AvatarImage
              src={user.avatarUrl}
              alt={user.fullName || "User"}
              className="object-cover"
            />
          ) : (
            <AvatarFallback>
              {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {/* ✅ React Router navigation like Sidebar */}
        <DropdownMenuItem asChild>
          <Link to="/users">Thông tin cá nhân</Link>
        </DropdownMenuItem>

        <DropdownMenuItem>Cài đặt</DropdownMenuItem>

        <DropdownMenuItem
          className="text-red-600"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
