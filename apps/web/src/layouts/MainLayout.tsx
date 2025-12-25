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
  { path: "/dashboard", label: "Tổng quan", icon: "dashboard" },
  {
    path: "/dashboard/products",
    label: "Sản phẩm",
    icon: "menu_book",
    children: [
      { path: "/dashboard/products/list", label: "Danh sách sản phẩm" },
      { path: "/dashboard/products/inventories", label: "Tồn kho" },
      { path: "/dashboard/products/display", label: "Hàng trưng bày" },
    ],
  },
  {
    path: "/dashboard/purchases",
    label: "Nhập hàng",
    icon: "inventory",
    children: [
      { path: "/dashboard/purchases/create", label: "Tạo phiếu nhập" },
      { path: "/dashboard/purchases/list", label: "Danh sách phiếu nhập" },
    ],
  },
  {
    path: "/dashboard/sales",
    label: "Giao dịch",
    icon: "receipt_long",
    children: [
      { path: "/dashboard/sales/create", label: "Tạo giao dịch" },
      { path: "/dashboard/sales/list", label: "Danh sách giao dịch" },
    ],
  },
  { path: "/dashboard/customers", label: "Khách hàng", icon: "groups" },
  {
    path: "/dashboard/employees",
    label: "Nhân viên",
    icon: "badge",
    children: [
      { path: "/dashboard/employees/roles", label: "Thời gian biểu" },
      { path: "/dashboard/employees/list", label: "Danh sách nhân viên" },
    ],
  },
  {
    path: "/dashboard/suppliers",
    label: "Nhà cung cấp",
    icon: "local_shipping",
  },
  {
    path: "/dashboard/reports",
    label: "Thống kê",
    icon: "pie_chart",
    children: [
      { path: "/dashboard/reports/revenues", label: "Doanh thu" },
      { path: "/dashboard/reports/inventories", label: "Tồn kho" },
      { path: "/dashboard/reports/employees", label: "Nhân viên" },
    ],
  },
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = (path: string) => {
    if (openMenus.includes(path)) {
      setOpenMenus([]);
    } else {
      setOpenMenus([path]); // chỉ mở 1 menu cha duy nhất
    }
  };

  const suggestions = [
    "Nhà sách Vạn Kim",
    "Book B",
    "Customer X",
    "Employee Y",
  ];
  const filtered = suggestions.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="relative flex h-screen w-full flex-row overflow-hidden bg-[#C4CFCE] font-['Inter']">
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
              <div key={item.path} className="w-full">
                {item.children ? (
                  // Menu cha có children → toggle
                  <button
                    onClick={() => toggleMenu(item.path)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left transition-all
                      ${isActive(item.path) ? "bg-[#1A998F]" : "hover:bg-[#187F87]"}`}
                  >
                    <span className="material-symbols-outlined">
                      {item.icon}
                    </span>
                    <p className="text-sm font-medium leading-normal">
                      {item.label}
                    </p>
                    <span className="ml-auto material-symbols-outlined">
                      {openMenus.includes(item.path)
                        ? "expand_less"
                        : "expand_more"}
                    </span>
                  </button>
                ) : (
                  // Menu cha không có children → Link
                  <Link
                    to={item.path}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 transition-all
                      ${isActive(item.path) ? "bg-[#1A998F]" : "hover:bg-[#187F87]"}`}
                  >
                    <span className="material-symbols-outlined">
                      {item.icon}
                    </span>
                    <p className="text-sm font-medium leading-normal">
                      {item.label}
                    </p>
                  </Link>
                )}

                {/* Sub-menu */}
                {item.children && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openMenus.includes(item.path)
                        ? "max-h-60 mt-1"
                        : "max-h-0"
                    }`}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block rounded-lg px-4 py-2 text-sm hover:bg-[#1A7C7B] ${
                          isActive(child.path) ? "bg-[#1A998F]" : ""
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Settings */}
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 hover:bg-[#187F87] transition-all"
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
                  className="flex-1 border-none! bg-transparent text-sm text-[#155665] placeholder:text-gray-400 focus:outline-none! focus:ring-0! focus-visible:ring-0! focus:border-none!"
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
