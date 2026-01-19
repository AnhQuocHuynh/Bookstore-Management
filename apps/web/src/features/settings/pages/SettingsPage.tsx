import { useState } from "react";
import { SettingsLayout, type SettingsTab } from "../components/SettingsLayout";
import { GeneralTab } from "../components/GeneralTab";
import { SalesTab } from "../components/SalesTab";
import { HRTab } from "../components/HRTab";
import { SecurityTab } from "../components/SecurityTab";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab />;
      case "sales":
        return <SalesTab />;
      case "hr":
        return <HRTab />;
      case "security":
        return <SecurityTab />;
      default:
        return <GeneralTab />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt hệ thống</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý thông tin cửa hàng, bán hàng, nhân sự và bảo mật
        </p>
      </div>

      <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </SettingsLayout>
    </div>
  );
}
