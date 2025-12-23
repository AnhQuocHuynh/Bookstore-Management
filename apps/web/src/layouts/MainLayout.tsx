// src/layouts/MainLayout.tsx
import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

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
  const { user, currentStore } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="relative flex h-screen w-full flex-row overflow-hidden bg-[#C4CFCE] font-['Inter']">
      {/* Sidebar */}
      <aside className="flex h-full w-full max-w-[250px] flex-col justify-between bg-[#102E3C] p-4 text-white">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 pt-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A998F]">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: "28px" }}
              >
                import_contacts
              </span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold leading-normal text-white">
                BookFlow
              </h1>
              <p className="text-sm font-normal leading-normal text-gray-300">
                Manager
              </p>
            </div>
          </div>

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
          <div className="flex flex-1 items-center justify-end gap-6">
            {/* Search Bar */}
            <label className="flex h-10 w-full max-w-sm flex-col">
              <div className="flex h-full w-full items-stretch rounded-full">
                <div className="flex items-center justify-center rounded-l-full bg-white pl-4 text-[#155665]">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  type="text"
                  placeholder="Search for books, orders, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-full w-full flex-1 rounded-r-full border-none bg-white px-4 text-base text-[#155665] placeholder:text-gray-400 focus:outline-none"
                />
              </div>
            </label>

            {/* User Section */}
            <div className="flex items-center gap-3">
              <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#187F87] text-white">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div
                className="aspect-square size-10 rounded-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: user?.avatar
                    ? `url(${user.avatar})`
                    : "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCbAZM74Z-EMEafCShEbBikByf4ARr1AUWr2L-dsK5Z8h14ZxJTYxAiZNE0M_cYHeRosEImih1jlp48qi7wjgSE5nvAzUGfxHHtGj9vCrnbGPyarFeaXtzvZcvPbuSiOIRoupzDVZUdU9IKY_NARvcPkKuR5GQppvgq3tau-YdTFLB_aXkTa81aU-BP8bcgCuMuhxecffnEp1vHnyRMtCj7OuRQVe1EUZcz-fBjwjEZi5PbLgxzdeIqpov_Nr5KVMD0Su06fJq6c_8')",
                }}
                title={user?.name || "User"}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#C4CFCE] p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
