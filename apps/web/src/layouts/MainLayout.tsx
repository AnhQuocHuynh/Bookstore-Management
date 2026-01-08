import NotificationsButton from "@/components/NotificationsButton";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import UserMenu from "@/components/UserMenu";
import { Menu, Search } from "lucide-react";
import { ReactNode, useState } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="relative flex h-screen w-full bg-[#C4CFCE] font-['Inter']">
      {/* Sidebar desktop */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Sidebar mobile drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden
    ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
  `}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute left-0 top-0 h-full w-[230px] bg-[#102E3C]
      transform transition-transform duration-300 ease-out
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    `}
        >
          <Sidebar onItemClick={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      {/* Main */}
      <main className="flex h-full flex-1 flex-col">
        {/* Header */}
        <header className="bg-[#102E3C] px-4 py-3 lg:px-10">
          <div className="flex flex-col gap-3">
            {/* ===== TOP ROW ===== */}
            <div className="flex items-center justify-center gap-4">
              {/* Left: Mobile menu OR Search (desktop) */}
              <div className="flex flex-1 items-center md:justify-end gap-4">
                {/* Mobile menu */}
                <button
                  className="text-white lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu size={22} />
                </button>

                {/* Search – desktop */}
                <div className="relative hidden w-full max-w-sm lg:block">
                  <div className="flex items-center rounded-full bg-white px-5">
                    <Search className="text-[#155665]" size={18} />
                    <Input
                      placeholder="Tìm kiếm sản phẩm, nhân viên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsDropdownOpen(true)}
                      onBlur={() =>
                        setTimeout(() => setIsDropdownOpen(false), 150)
                      }
                      className="
                flex-1 border-none bg-transparent text-sm
                outline-none focus:outline-none
                focus:ring-0 focus-visible:ring-0
                focus-visible:ring-offset-0 shadow-none
              "
                    />
                  </div>

                  {isDropdownOpen && filtered.length > 0 && (
                    <ul
                      className="absolute z-50 mt-1 w-full rounded-lg bg-white shadow-lg
                    p-2"
                    >
                      {filtered.map((item, idx) => (
                        <li
                          key={idx}
                          onMouseDown={() => setSearchQuery(item)}
                          className="cursor-pointer px-4 py-2 hover:bg-gray-100 hover:rounded-lg"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right: Notifications + User */}
              <div className="flex items-center gap-4">
                <NotificationsButton />
                <UserMenu />
              </div>
            </div>

            {/* ===== BOTTOM ROW (Mobile search only) ===== */}
            <div className="relative w-full lg:hidden">
              <div className="flex items-center rounded-full bg-white px-5">
                <Search className="text-[#155665]" size={18} />
                <Input
                  placeholder="Tìm kiếm sản phẩm, nhân viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                  className="
            flex-1 border-none bg-transparent text-sm
            outline-none focus:outline-none
            focus:ring-0 focus-visible:ring-0
            focus-visible:ring-offset-0 shadow-none
          "
                />
              </div>

              {isDropdownOpen && filtered.length > 0 && (
                <ul
                  className="absolute z-50 mt-1 w-full rounded-lg bg-white shadow-lg
                p-2"
                >
                  {filtered.map((item, idx) => (
                    <li
                      key={idx}
                      onMouseDown={() => setSearchQuery(item)}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-100 hover:rounded-lg"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[#ecf2f1] p-6 lg:p-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};
