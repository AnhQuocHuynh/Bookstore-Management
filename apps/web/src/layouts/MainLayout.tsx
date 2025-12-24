// src/layouts/MainLayout.tsx
import NotificationsButton from "@/components/NotificationsButton";
import { Input } from "@/components/ui/input";
import UserMenu from "@/components/UserMenu";
import { Search } from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import StoreModal from "@/components/StoreModal";

interface MainLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/products", label: "Books", icon: "menu_book" },
  { path: "/sales", label: "Orders", icon: "receipt_long" },
  { path: "/partners", label: "Customers", icon: "groups" },
  { path: "/employees", label: "Staff", icon: "badge" },
  { path: "/suppliers", label: "Suppliers", icon: "local_shipping" },
  { path: "/reports", label: "Reports", icon: "pie_chart" },
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const suggestions = [
    "Nhà sách Vạn Kim",
    "Book B",
    "Customer X",
    "Employee Y",
  ];

  const filtered = suggestions.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="relative flex h-screen w-full flex-row overflow-hidden bg-[#C4CFCE] 
    font-['Inter']"
    >
      {/* Sidebar */}
      <aside className="flex h-full w-full max-w-[230px] flex-col justify-between bg-[#102E3C] p-4 text-white">
        <div className="flex flex-col gap-4">
          <StoreModal
            store={{
              name: "Nhà sách BookFlow",
              address: "123 Bà Triệu, TP. Thủ Đức, HCM",
              phone: "0909 123 456",
              logo: "/default-store.jpg",
            }}
            onSave={(updatedStore: any) =>
              console.log("Lưu thông tin:", updatedStore)
            }
          />

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all ${
                  isActive(item.path) ? "bg-[#1A998F]" : "hover:bg-[#187F87]"
                }`}
              >
                {isActive(item.path) && (
                  <div className="absolute -left-2 top-1/2 h-0 w-0 -translate-y-1/2 border-y-8 border-l-8 border-y-transparent border-l-[#C4CFCE]" />
                )}
                <span className="material-symbols-outlined text-white">
                  {item.icon}
                </span>
                <p className="text-sm font-medium leading-normal text-white">
                  {item.label}
                </p>
              </Link>
            ))}
          </nav>
        </div>

        {/* Settings */}
        <Link
          to="/settings"
          className="group flex items-center gap-3 rounded-xl px-4 py-2.5 hover:bg-[#187F87] transition-all"
        >
          <span className="material-symbols-outlined text-white">settings</span>
          <p className="text-sm font-medium leading-normal text-white">
            Settings
          </p>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex h-full flex-1 flex-col">
        {/* Top Header */}
        <header className="flex w-full items-center justify-end whitespace-nowrap bg-[#102E3C] px-10 py-3">
          <div className="flex flex-1 items-center justify-end gap-6 relative">
            <div className="relative w-full max-w-sm">
              {/* Search Bar */}
              <div className="flex w-full max-w-sm items-center rounded-full bg-white px-5">
                <Search className="text-[#155665]" size={18} />
                <Input
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                  placeholder="Tìm kiếm sản phẩm, nhân viên,..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-none! bg-transparent text-sm text-[#155665] 
             placeholder:text-gray-400 focus:outline-none! focus:ring-0! focus-visible:ring-0! focus:border-none!"
                />
              </div>

              {isDropdownOpen && filtered.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full rounded-lg bg-white shadow-lg">
                  {filtered.map((item, idx) => (
                    <li
                      key={idx}
                      className={`cursor-pointer px-4 py-2 border border-transparent hover:bg-gray-100 ${
                        idx === 0
                          ? "hover:border-t hover:border-l hover:border-r hover:rounded-t-lg"
                          : idx === filtered.length - 1
                            ? "hover:border-l hover:border-r hover:border-b hover:rounded-b-lg"
                            : ""
                      }`}
                      onMouseDown={() => setSearchQuery(item)}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* User Section */}
            <div className="flex items-center gap-4">
              {/* Notifications button */}
              <NotificationsButton />
              <UserMenu user={user} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#ecf2f1] p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
