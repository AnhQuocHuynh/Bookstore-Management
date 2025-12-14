import { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Button } from "antd";
import {
  AppstoreOutlined,
  ShopOutlined,
  BarcodeOutlined,
  InboxOutlined,
  TeamOutlined,
  LineChartOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthStore } from "../stores/useAuthStore";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    key: "/dashboard",
    icon: <AppstoreOutlined />,
    label: "Dashboard",
  },
  {
    key: "/sales",
    icon: <ShopOutlined />,
    label: "POS/Bán hàng",
  },
  {
    key: "/products",
    icon: <BarcodeOutlined />,
    label: "Sản phẩm",
  },
  {
    key: "/inventory",
    icon: <InboxOutlined />,
    label: "Kho hàng",
  },
  {
    key: "/employees",
    icon: <TeamOutlined />,
    label: "Nhân viên",
  },
  {
    key: "/reports",
    icon: <LineChartOutlined />,
    label: "Báo cáo",
  },
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentStore, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const handleSwitchStore = () => {
    navigate("/auth/select-store");
  };

  const userMenuItems = [
    {
      key: "switch-store",
      icon: <ShopOutlined />,
      label: "Chuyển cửa hàng",
      onClick: handleSwitchStore,
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        width={250}
        theme="dark"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="fixed left-0 top-0 bottom-0"
        breakpoint="lg"
        collapsedWidth={collapsed ? 80 : 250}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          {!collapsed ? (
            <Text className="text-white text-lg font-bold">
              BookFlow
            </Text>
          ) : (
            <Text className="text-white text-xl font-bold">BF</Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="mt-4"
        />
      </Sider>

      <Layout className={collapsed ? "ml-[80px]" : "ml-[250px]"}>
        <Header className="bg-white shadow-sm flex items-center justify-between px-6">
          {/* Left: Collapse Trigger */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />

          {/* Center/Right: Store Name and User Dropdown */}
          <Space size="large" className="ml-auto">
            {/* Current Store Name */}
            <div className="flex items-center gap-2">
              <ShopOutlined className="text-teal-600" />
              <Text strong className="text-base">
                {currentStore?.name || "Chưa chọn cửa hàng"}
              </Text>
            </div>

            {/* User Dropdown */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space className="cursor-pointer hover:bg-gray-50 px-3 py-1 rounded transition-colors">
                <Avatar icon={<UserOutlined />} src={user?.avatar} />
                <Text>{user?.name || "User"}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
          <div className="bg-white rounded-lg shadow-sm p-6 min-h-full">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
