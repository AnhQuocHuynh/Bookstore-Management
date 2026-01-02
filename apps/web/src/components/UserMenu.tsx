import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/useAuthStore";

export default function UserMenu() {
  const { user } = useAuthStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          {user?.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.fullName || "User"} />
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

        <DropdownMenuItem className="text-red-600">Đăng xuất</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
