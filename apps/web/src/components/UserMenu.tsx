import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/stores/useAuthStore";

interface UserMenuProps {
  user: User | null;
}

export default function UserMenu({ user }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          {user?.avatar ? (
            <AvatarImage src={user.avatar} alt={user.name || "User"} />
          ) : (
            <AvatarFallback>
              {user?.name ? user.name[0].toUpperCase() : "U"}
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

        <DropdownMenuItem className="text-red-600">
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
