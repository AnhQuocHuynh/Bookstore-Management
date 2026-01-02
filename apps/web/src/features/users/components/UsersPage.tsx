import React from "react";
import { Card, Avatar, Tag, Button, Timeline, Typography, Spin, Empty } from "antd";
import {
  EditOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useUsers";

const { Title, Text } = Typography;

export const UsersPage = () => {
  const navigate = useNavigate();
  const { data: apiResponse, isLoading, error } = useCurrentUser();
  
  // Transform API data to match the component structure
  const userInfo = apiResponse?.data ? {
    name: apiResponse.data.fullName || "N/A",
    username: apiResponse.data.username || "N/A",
    role: apiResponse.data.role || "User",
    id: `#USER-${apiResponse.data.id?.slice(-4).toUpperCase() || "0000"}`,
    avatarUrl: apiResponse.data.avatarUrl || "https://joeschmoe.io/api/v1/random",
    phone: apiResponse.data.phoneNumber || "N/A",
    email: apiResponse.data.email || "N/A",
    dob: apiResponse.data.birthDate ? new Date(apiResponse.data.birthDate).toLocaleDateString("vi-VN") : "N/A",
    address: apiResponse.data.address || "N/A",
    createdDate: apiResponse.data.createdAt ? new Date(apiResponse.data.createdAt).toLocaleDateString("vi-VN") : "N/A",
    updatedDate: apiResponse.data.updatedAt ? new Date(apiResponse.data.updatedAt).toLocaleDateString("vi-VN") : "N/A",
  } : {
    name: "Loading...",
    username: "Loading...",
    role: "User",
    id: "#USER-0000",
    avatarUrl: "https://joeschmoe.io/api/v1/random",
    phone: "N/A",
    email: "N/A",
    dob: "N/A",
    address: "N/A",
    createdDate: "N/A",
    updatedDate: "N/A",
  };

  const activities = [
    {
      color: "green",
      title: "Cập nhật thông tin hồ sơ",
      description: "Người dùng đã thay đổi địa chỉ nhà.",
      time: "Vừa xong",
    },
    {
      color: "gray",
      title: "Đăng nhập thành công",
      description: "Đăng nhập từ IP 192.168.1.1",
      time: "2 giờ trước",
    },
    {
      color: "orange",
      title: "Đổi mật khẩu",
      description: "Yêu cầu đổi mật khẩu định kỳ.",
      time: "01/01/2026",
    },
    {
      color: "gray",
      title: "Tạo đơn hàng mới",
      description: "Mã đơn: #ORD-9921",
      time: "28/12/2025",
    },
  ];

  return (
    <div className="w-full p-6">
      {isLoading && (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      )}
      
      {error && (
        <div className="flex justify-center items-center h-96">
          <Empty description="Failed to load user data" />
        </div>
      )}
      
      {!isLoading && !error && (
      <div className="w-full space-y-6">
        {/* --- TOP HEADER CARD --- */}
        <Card
          bordered={false}
          bodyStyle={{ padding: 0 }}
          className="rounded-2xl overflow-hidden shadow-sm relative"
        >
          <div className="h-[180px] bg-teal-600"></div>
          <div className="px-8 pb-8 pt-4 flex justify-between items-end bg-white relative">
            <div className="flex items-end">
              <Avatar
                size={160}
                src={userInfo.avatarUrl}
                icon={<UserOutlined />}
                className="border-4 border-white absolute -top-[100px] shadow-md bg-gray-200"
              />
              <div className="ml-[180px] mb-2">
                <Title level={2} className="mb-1">
                  {userInfo.name}
                </Title>
                <div className="flex items-center space-x-3 text-gray-500">
                  <Tag color="cyan" className="rounded-full px-3">
                    {userInfo.role}
                  </Tag>
                  <span>• ID: {userInfo.id}</span>
                </div>
              </div>
            </div>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate("/users/edit")}
              className="bg-teal-500 hover:bg-teal-400 border-none rounded-full px-6 h-10 font-medium"
            >
              Chỉnh sửa
            </Button>
          </div>
        </Card>

        {/* --- MAIN CONTENT (TWO COLUMNS) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --- LEFT COLUMN --- */}
          <div className="space-y-6 lg:col-span-1">
            {/* Personal Info Card */}
            <Card
              title={<span className="text-lg font-bold">Thông tin cá nhân</span>}
              bordered={false}
              className="rounded-2xl shadow-sm"
            >
              <div className="space-y-5">
                <InfoItem
                  icon={<PhoneOutlined />}
                  label="Số điện thoại"
                  value={userInfo.phone}
                />
                <InfoItem
                  icon={<MailOutlined />}
                  label="Email"
                  value={userInfo.email}
                />
                 {/* ADDED USERNAME SECTION HERE */}
                <InfoItem
                  icon={<UserOutlined />}
                  label="Tên đăng nhập"
                  value={userInfo.username}
                />
                <InfoItem
                  icon={<CalendarOutlined />}
                  label="Ngày sinh"
                  value={userInfo.dob}
                />
                <InfoItem
                  icon={<EnvironmentOutlined />}
                  label="Địa chỉ"
                  value={userInfo.address}
                />
              </div>
            </Card>

            {/* System Info Card */}
            <Card
              title={<span className="text-lg font-bold">Hệ thống</span>}
              bordered={false}
              // Added min-h-[250px] to stretch vertically
              className="rounded-2xl shadow-sm min-h-[250px]"
            >
              <div className="space-y-4 text-gray-600">
                <div className="flex justify-between">
                  <span>Ngày tạo:</span>
                  <span className="font-medium text-gray-800">
                    {userInfo.createdDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lần sửa cuối:</span>
                  <span className="font-medium text-gray-800">
                    {userInfo.updatedDate}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* --- RIGHT COLUMN (ACTIVITY) --- */}
          <Card
            title={
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">
                  Lịch sử hoạt động gần đây
                </span>
                <a href="#" className="text-teal-600 hover:underline text-sm">
                  Xem tất cả
                </a>
              </div>
            }
            bordered={false}
            // Added min-h-[600px] to stretch vertically significantly
            className="rounded-2xl shadow-sm lg:col-span-2 min-h-[600px]"
          >
            <Timeline className="mt-4">
              {activities.map((item, index) => (
                <Timeline.Item key={index} color={item.color}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <Text strong className="text-base">
                        {item.title}
                      </Text>
                      <div className="text-gray-500">{item.description}</div>
                    </div>
                    <Text type="secondary" className="text-sm whitespace-nowrap ml-4">
                      {item.time}
                    </Text>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </div>
        </div>
      )}
    </div>
  );
};

// Helper component for personal info items
const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start space-x-4">
    <div className="p-3 bg-gray-100 rounded-xl text-gray-500">{icon}</div>
    <div>
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="font-medium text-gray-800 text-base">{value}</div>
    </div>
  </div>
);

export default UsersPage;