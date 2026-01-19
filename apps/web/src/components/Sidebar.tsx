import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import StoreModal from "@/components/StoreModal"; // Đảm bảo đường dẫn import đúng
import { useAuthStore } from "@/stores/useAuthStore";

interface SidebarProps {
  onItemClick?: () => void;
}

// Định nghĩa kiểu dữ liệu cho menu item để dùng đệ quy
interface MenuItem {
  path: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
  visibleFor?: ("OWNER" | "EMPLOYEE" | "ADMIN")[];
}

const menuItems: MenuItem[] = [
  { path: "/dashboard", label: "Tổng quan", icon: "dashboard", visibleFor: ["OWNER", "EMPLOYEE"] },
  {
    path: "/dashboard/products",
    label: "Sản phẩm",
    icon: "menu_book",
    visibleFor: ["OWNER", "EMPLOYEE"],
    children: [
      { path: "/dashboard/products/inventories", label: "Tồn kho", visibleFor: ["OWNER", "EMPLOYEE"] },
      // Mục này có children -> Cần logic đệ quy để hiển thị
      {
        path: "/dashboard/products/display",
        label: "Hàng trưng bày",
        visibleFor: ["OWNER", "EMPLOYEE"],
        children: [
          { path: "/dashboard/products/display/list", label: "Danh sách kệ", visibleFor: ["OWNER", "EMPLOYEE"] },
          { path: "/dashboard/products/display/filter", label: "Tìm kiếm SP", visibleFor: ["OWNER", "EMPLOYEE"] },
          { path: "/dashboard/products/display/history", label: "Lịch sử", visibleFor: ["OWNER", "EMPLOYEE"] },
        ]
      },
      {
        path: "/dashboard/products/return-orders", label: "Trả/Đổi hàng",
        visibleFor: ["OWNER", "EMPLOYEE"],
        children:
          [
            { path: "/dashboard/products/return-orders/list", label: "Danh sách trả/đổi hàng", visibleFor: ["OWNER", "EMPLOYEE"] },
            { path: "/dashboard/products/return-orders/create", label: "Tạo trả/đổi hàng", visibleFor: ["EMPLOYEE"] }
          ]
      }
    ],
  },
  {
    path: "/purchase-orders",
    label: "Nhập hàng",
    icon: "inventory",
    visibleFor: ["OWNER", "EMPLOYEE"],
    children: [
      { path: "/purchase-orders/create", label: "Tạo phiếu nhập", visibleFor: ["EMPLOYEE"] },
      { path: "/purchase-orders/list", label: "Danh sách phiếu nhập", visibleFor: ["OWNER", "EMPLOYEE"] },
    ],
  },
  {
    path: "/sales",
    label: "Giao dịch",
    icon: "receipt_long",
    visibleFor: ["OWNER", "EMPLOYEE"],
    children: [
      { path: "/sales/create", label: "Tạo giao dịch", visibleFor: ["EMPLOYEE"] },
      { path: "/sales/list", label: "Danh sách giao dịch", visibleFor: ["OWNER", "EMPLOYEE"] },
    ],
  },
  { path: "/dashboard/customers", label: "Khách hàng", icon: "groups", visibleFor: ["OWNER", "EMPLOYEE"] },
  {
    path: "/dashboard/employees",
    label: "Nhân viên",
    icon: "badge",
    visibleFor: ["OWNER"],
    children: [
      { path: "/dashboard/employees/schedule", label: "Thời gian biểu", visibleFor: ["OWNER"] },
      { path: "/dashboard/employees/list", label: "Danh sách nhân viên", visibleFor: ["OWNER"] },
    ],
  },
  { path: "/dashboard/suppliers", label: "Nhà cung cấp", icon: "local_shipping", visibleFor: ["OWNER", "EMPLOYEE"] },
  { path: "/dashboard/categories", label: "Danh mục", icon: "category", visibleFor: ["OWNER", "EMPLOYEE"] },
  { path: "/dashboard/publishers", label: "Nhà xuất bản", icon: "public", visibleFor: ["OWNER", "EMPLOYEE"] },
  { path: "/dashboard/authors", label: "Tác giả", icon: "person", visibleFor: ["OWNER", "EMPLOYEE"] },
  {
    path: "/reports",
    label: "Thống kê",
    icon: "pie_chart",
    visibleFor: ["OWNER", "EMPLOYEE"],
    children: [
      { path: "/reports/revenue", label: "Doanh thu", visibleFor: ["OWNER", "EMPLOYEE"] },
      { path: "/reports/stocks", label: "Tồn kho", visibleFor: ["OWNER", "EMPLOYEE"] },
      { path: "/reports/employees", label: "Nhân viên", visibleFor: ["OWNER"] },
    ],
  },
];

const Sidebar = ({ onItemClick }: SidebarProps) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const user = useAuthStore((state) => state.user);

  const userRole = (user?.role as "OWNER" | "EMPLOYEE" | "ADMIN") || "EMPLOYEE";

  const isItemVisible = (item: MenuItem): boolean => {
    if (!item.visibleFor) return true;
    return item.visibleFor.includes(userRole);
  };

  // Kiểm tra xem path hiện tại có active không (bao gồm cả logic cho con)
  const isActive = (path: string) => location.pathname === path;

  // Toggle menu mở/đóng
  const toggleMenu = (path: string) => {
    setOpenMenus((prev) =>
      prev.includes(path)
        ? prev.filter((p) => p !== path) // Đóng
        : [...prev, path] // Mở (cho phép mở nhiều menu cùng lúc)
    );
  };

  // --- HÀM RENDER ĐỆ QUY (QUAN TRỌNG) ---
  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    if (!isItemVisible(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus.includes(item.path);

    // Tính toán padding dựa trên cấp độ (Level 0: 16px, Level 1: 32px, Level 2: 48px...)
    // padding-left: 1rem (16px) + level * 1rem
    const paddingLeftClass = level === 0 ? "px-4" : level === 1 ? "pl-8 pr-4" : "pl-12 pr-4";

    if (hasChildren) {
      return (
        <div key={item.path} className="flex flex-col">
          <button
            onClick={() => toggleMenu(item.path)}
            className={`flex w-full items-center gap-3 rounded-xl py-2.5 transition-all text-left mb-1
              ${paddingLeftClass}
              ${isActive(item.path) ? "bg-[#1A998F]" : "hover:bg-[#187F87]"}
            `}
          >
            {item.icon && <span className="material-symbols-outlined">{item.icon}</span>}
            <span className="text-sm font-medium flex-1">{item.label}</span>
            <span className="material-symbols-outlined text-sm">
              {isOpen ? "expand_less" : "expand_more"}
            </span>
          </button>

          {/* Container chứa children với hiệu ứng đóng mở */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out
              ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
            `}
          >
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        </div>
      );
    }

    // Render Link (Item cuối cùng không có con)
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onItemClick}
        className={`flex items-center gap-3 rounded-xl py-2.5 transition-all mb-1
          ${paddingLeftClass}
          ${isActive(item.path) ? "bg-[#1A998F]" : "hover:bg-[#187F87]"}
        `}
      >
        {item.icon && <span className="material-symbols-outlined">{item.icon}</span>}
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="flex h-full w-[230px] flex-col justify-between bg-[#102E3C] p-4 text-white overflow-y-auto custom-scrollbar">
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

        <nav className="flex flex-col md:pt-4">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>
      </div>

      <Link
        to="/settings"
        onClick={onItemClick}
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all hover:bg-[#187F87] mt-4"
      >
        <span className="material-symbols-outlined">settings</span>
        <span className="text-sm font-medium">Settings</span>
      </Link>
    </aside>
  );
};

export default Sidebar;