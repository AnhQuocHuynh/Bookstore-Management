import React from "react";
import {
  Card,
  Avatar,
  Tag,
  Button,
  Timeline,
  Typography,
  Spin,
  Empty,
} from "antd";
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

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: apiResponse, isLoading, error } = useCurrentUser();

  const userInfo = apiResponse?.data
    ? {
        name: apiResponse.data.fullName || "N/A",
        username: apiResponse.data.username || "N/A",
        role: apiResponse.data.role || "USER",
        id: `#USER-${apiResponse.data.id?.slice(-4).toUpperCase() || "0000"}`,
        avatarUrl:
          apiResponse.data.avatarUrl || "https://joeschmoe.io/api/v1/random",
        phone: apiResponse.data.phoneNumber || "N/A",
        email: apiResponse.data.email || "N/A",
        dob: apiResponse.data.birthDate
          ? new Date(apiResponse.data.birthDate).toLocaleDateString("vi-VN")
          : "N/A",
        address: apiResponse.data.address || "N/A",
        createdDate: apiResponse.data.createdAt
          ? new Date(apiResponse.data.createdAt).toLocaleDateString("vi-VN")
          : "N/A",
        updatedDate: apiResponse.data.updatedAt
          ? new Date(apiResponse.data.updatedAt).toLocaleDateString("vi-VN")
          : "N/A",
      }
    : null;

  const activities = [
    {
      color: "green",
      title: "Cập nhật hồ sơ",
      description: "Người dùng đã thay đổi địa chỉ.",
      time: "Vừa xong",
    },
    {
      color: "blue",
      title: "Đăng nhập thành công",
      description: "IP: 192.168.1.1",
      time: "2 giờ trước",
    },
    {
      color: "orange",
      title: "Đổi mật khẩu",
      description: "Thay đổi mật khẩu định kỳ",
      time: "01/01/2026",
    },
    {
      color: "gray",
      title: "Tạo đơn hàng",
      description: "Mã đơn: #ORD-9921",
      time: "28/12/2025",
    },
  ];

  return (
    <div className="w-full p-6">
      {isLoading && (
        <div className="flex justify-center items-center h-[400px]">
          <Spin size="large" />
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center h-[400px]">
          <Empty description="Không thể tải thông tin người dùng" />
        </div>
      )}

      {!isLoading && !error && userInfo && (
        <div className="space-y-6">
          {/* ================= HEADER ================= */}
          <Card
            bordered={false}
            bodyStyle={{ padding: 0 }}
            className="rounded-2xl overflow-hidden shadow-md"
          >
            <div className="h-[220px] bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

            <div className="px-8 pb-8 pt-6 flex justify-between items-end bg-white relative">
              <div className="flex items-end gap-6">
                <Avatar
                  size={160}
                  src={userInfo.avatarUrl}
                  icon={<UserOutlined />}
                  className="border-4 border-white -mt-[120px] shadow-lg"
                />

                <div className="space-y-2">
                  <Title level={2} className="!mb-0">
                    {userInfo.name}
                  </Title>

                  {userInfo.username && userInfo.username !== "N/A" ? (
                    <Text type="secondary">@{userInfo.username}</Text>
                  ) : (
                    userInfo.email &&
                    userInfo.email !== "N/A" && (
                      <Text type="secondary">{userInfo.email}</Text>
                    )
                  )}

                  <div className="flex items-center gap-3">
                    <Tag color="cyan" className="rounded-full px-3">
                      {userInfo.role}
                    </Tag>
                    <Text type="secondary">{userInfo.id}</Text>
                  </div>
                </div>
              </div>

              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate("/users/edit")}
                className="bg-teal-600 hover:bg-teal-500 border-none rounded-full px-6 h-11 shadow"
              >
                Chỉnh sửa hồ sơ
              </Button>
            </div>
          </Card>

          {/* ================= MAIN ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="space-y-6">
              <Card
                title="Thông tin cá nhân"
                bordered={false}
                className="rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <div className="space-y-6">
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

              <Card
                title="Hệ thống"
                bordered={false}
                className="rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày tạo</span>
                    <span className="font-medium">{userInfo.createdDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cập nhật lần cuối</span>
                    <span className="font-medium">{userInfo.updatedDate}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* RIGHT */}
            <Card
              title={
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    Hoạt động gần đây
                  </span>
                  <Button type="link" className="text-teal-600 px-0">
                    Xem tất cả
                  </Button>
                </div>
              }
              bordered={false}
              className="rounded-2xl shadow-sm lg:col-span-2 min-h-[600px]"
            >
              <Timeline className="mt-6">
                {activities.map((item, index) => (
                  <Timeline.Item key={index} color={item.color}>
                    <div className="flex justify-between gap-6">
                      <div>
                        <Text strong>{item.title}</Text>
                        <div className="text-gray-500 text-sm mt-1">
                          {item.description}
                        </div>
                      </div>
                      <Text type="secondary" className="text-xs">
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

/* ================= SUB COMPONENT ================= */
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="p-3 rounded-xl bg-teal-50 text-teal-600">{icon}</div>
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className="font-medium text-gray-800">{value}</div>
    </div>
  </div>
);

export default UsersPage;
