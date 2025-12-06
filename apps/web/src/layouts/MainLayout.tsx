import { Layout, Menu, Avatar, Dropdown, Typography, Space } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  InboxOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  SettingOutlined,
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
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/products",
    icon: <ShoppingOutlined />,
    label: "Sản phẩm",
  },
  {
    key: "/inventory",
    icon: <InboxOutlined />,
    label: "Kho hàng",
  },
  {
    key: "/staff",
    icon: <TeamOutlined />,
    label: "Nhân viên",
  },
  {
    key: "/suppliers",
    icon: <UserOutlined />,
    label: "Nhà cung cấp",
  },
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentStore, logout } = useAuthStore();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
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
        className="fixed left-0 top-0 bottom-0"
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <Text className="text-white text-lg font-bold">
            Bookstore Management
          </Text>
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
      
      <Layout className="ml-[250px]">
        <Header className="bg-white shadow-sm flex items-center justify-between px-6">
          <div>
            <Text strong className="text-lg">
              {currentStore?.name || "Chưa chọn cửa hàng"}
            </Text>
          </div>
          
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <Space className="cursor-pointer hover:bg-gray-50 px-3 py-1 rounded">
              <Avatar icon={<UserOutlined />} />
              <Text>{user?.name || "User"}</Text>
            </Space>
          </Dropdown>
        </Header>
        
        <Content className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

