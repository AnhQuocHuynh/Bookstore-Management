import { useState } from "react";
import { cn } from "@/lib/utils";
import { Store, ShoppingCart, Users, Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export type SettingsTab = "general" | "sales" | "hr" | "security";

interface SettingsLayoutProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  children: React.ReactNode;
}

const tabs = [
  {
    id: "general" as SettingsTab,
    label: "Thông tin chung",
    icon: Store,
    description: "Cài đặt cửa hàng",
  },
  {
    id: "sales" as SettingsTab,
    label: "Bán hàng & POS",
    icon: ShoppingCart,
    description: "Thuế và thanh toán",
  },
  {
    id: "hr" as SettingsTab,
    label: "Nhân sự",
    icon: Users,
    description: "Lương",
  },
  {
    id: "security" as SettingsTab,
    label: "Bảo mật",
    icon: Shield,
    description: "Mật khẩu và bảo mật",
  },
];

function SidebarContent({
  activeTab,
  onTabChange,
  onMobileClose,
}: {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  onMobileClose?: () => void;
}) {
  return (
    <nav className="space-y-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id);
              onMobileClose?.();
            }}
            className={cn(
              "w-full flex items-start gap-3 px-4 py-3 rounded-r-lg transition-all border-l-4",
              "text-left",
              isActive
                ? "bg-teal-50 text-teal-700 font-bold border-teal-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium border-transparent"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 mt-0.5 flex-shrink-0",
                isActive ? "text-teal-600" : "text-gray-400"
              )}
            />
            <div className="flex-1 min-w-0">
              <div className={isActive ? "font-semibold" : "font-medium"}>
                {tab.label}
              </div>
              <div
                className={cn(
                  "text-xs mt-0.5",
                  isActive ? "text-teal-600/80" : "text-gray-400"
                )}
              >
                {tab.description}
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

export function SettingsLayout({
  activeTab,
  onTabChange,
  children,
}: SettingsLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Mobile Header with Menu */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Menu className="h-4 w-4 mr-2" />
              Menu cài đặt
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-lg">Cài đặt</h3>
              <p className="text-sm text-muted-foreground">
                Quản lý hệ thống
              </p>
            </div>
            <SidebarContent
              activeTab={activeTab}
              onTabChange={onTabChange}
              onMobileClose={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-6 space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-1">Cài đặt</h3>
            <p className="text-sm text-muted-foreground">
              Quản lý hệ thống
            </p>
          </div>
          <SidebarContent activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 min-w-0">
        <div className="rounded-lg border bg-card p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
