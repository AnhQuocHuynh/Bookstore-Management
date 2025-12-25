import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import StoreModal from "@/components/StoreModal";

interface SidebarProps {
  onItemClick?: () => void;
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

const Sidebar = ({ onItemClick }: SidebarProps) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = (path: string) => {
    setOpenMenus((prev) => (prev.includes(path) ? [] : [path]));
  };

  return (
    <aside
      className="flex h-full w-[230px] flex-col justify-between bg-[#102E3C] p-4 text-white
    "
    >
      <div className="flex flex-col gap-4">
        <StoreModal
          store={{
            name: "Nhà sách BookFlow",
            address: "123 Bà Triệu, TP. Thủ Đức, HCM",
            phone: "0909 123 456",
            logo: "/default-store.jpg",
          }}
          onSave={(data: any) => console.log("Save store:", data)}
        />

        <nav className="flex flex-col gap-2 md:pt-4">
          {menuItems.map((item) => (
            <div key={item.path}>
              {item.children ? (
                <button
                  onClick={() => toggleMenu(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 transition-all
                    ${
                      isActive(item.path)
                        ? "bg-[#1A998F]"
                        : "hover:bg-[#187F87]"
                    }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="ml-auto material-symbols-outlined">
                    {openMenus.includes(item.path)
                      ? "expand_less"
                      : "expand_more"}
                  </span>
                </button>
              ) : (
                <Link
                  to={item.path}
                  onClick={onItemClick}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all
                    ${
                      isActive(item.path)
                        ? "bg-[#1A998F]"
                        : "hover:bg-[#187F87]"
                    }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )}

              {item.children && (
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openMenus.includes(item.path) ? "max-h-60 mt-1" : "max-h-0"
                  }`}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      onClick={onItemClick}
                      className={`block rounded-lg px-4 py-2 text-sm hover:bg-[#1A7C7B]
                        ${isActive(child.path) ? "bg-[#1A998F]" : ""}`}
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

      <Link
        to="/settings"
        onClick={onItemClick}
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all hover:bg-[#187F87]"
      >
        <span className="material-symbols-outlined">settings</span>
        <span className="text-sm font-medium">Settings</span>
      </Link>
    </aside>
  );
};

export default Sidebar;
