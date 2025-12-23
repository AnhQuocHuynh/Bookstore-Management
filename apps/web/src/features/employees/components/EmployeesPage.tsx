import React, { useState, useEffect } from "react";
import { Card, Table, Button, Space, Spin, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";

interface Staff {
  key: number;
  id?: string;
  staffId: string;
  name: string;
  email: string;
  role: string;
  startDate: string;
  status: string;
  birthDate?: string;
  address?: string;
  updateDate?: string;
  avatar?: string;
  avatarUrl?: string;
}

export const EmployeesPage = () => {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [data, setData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch staff data from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/v1/employee", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (response.data?.data) {
          const staffList = Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data];

          const formattedStaff = staffList.map(
            (employee: any, index: number) => ({
              key: employee.id || index,
              id: employee.id,
              staffId: employee.staffId || "N/A",
              name: employee.fullName || employee.name || "N/A",
              email: employee.email || "N/A",
              role: employee.role || "N/A",
              startDate: employee.startDate || "N/A",
              status: employee.status || "N/A",
              birthDate: employee.dateOfBirth || employee.birthDate || "N/A",
              address: employee.address || "N/A",
              updateDate: employee.updatedAt || "N/A",
              avatarUrl: employee.avatarUrl || employee.avatar,
            }),
          );

          setData(formattedStaff);
        }
      } catch (error: any) {
        console.error("Failed to fetch staff:", error);
        message.error("Không thể tải danh sách nhân viên");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Clicking same row again → closes panel
  const handleRowClick = (record: Staff) => {
    if (selectedStaff?.key === record.key) {
      setSelectedStaff(null);
    } else {
      setSelectedStaff(record);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 70,
    },
    { title: "Mã nhân viên", dataIndex: "staffId", key: "staffId" },
    { title: "Tên nhân viên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Vai trò", dataIndex: "role", key: "role" },
    { title: "Ngày vào làm", dataIndex: "startDate", key: "startDate" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Hành động",
      key: "action",
      render: () => (
        <Space>
          <Button type="link">Sửa</Button>
          <Button type="link" danger>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full bg-white min-h-screen">
      <div className="flex w-full items-start justify-start gap-6">
        {/* LEFT — STAFF TABLE */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Nhân viên</h1>

            <Button type="primary" icon={<PlusOutlined />}>
              Thêm nhân viên
            </Button>
          </div>

          <Card>
            {loading ? (
              <div className="flex justify-center py-10">
                <Spin />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={data}
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                })}
                rowClassName={() =>
                  "cursor-pointer hover:bg-gray-100 transition-colors"
                }
              />
            )}
          </Card>
        </div>

        {/* RIGHT — DETAIL PANEL */}
        {selectedStaff && (
          <aside className="relative w-[400px] bg-white border-2 border-teal-600 rounded-xl p-6 flex flex-col items-center shadow-md">
            {/* Close button */}
            <button
              onClick={() => setSelectedStaff(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ✕
            </button>

            {/* Photo placeholder / Avatar */}
            <div className="w-[250px] h-[250px] bg-gray-300 rounded-md overflow-hidden">
              {selectedStaff.avatarUrl ? (
                <img
                  src={selectedStaff.avatarUrl}
                  alt={selectedStaff.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 text-white text-2xl font-bold">
                  {selectedStaff.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            <div className="mt-8 w-full">
              <DetailItem label="Tên Nhân Viên" value={selectedStaff.name} />
              <DetailItem label="Ngày sinh" value={selectedStaff.birthDate} />
              <DetailItem label="Email" value={selectedStaff.email} />
              <DetailItem label="Vai trò" value={selectedStaff.role} />
              <DetailItem
                label="Địa chỉ"
                value={selectedStaff.address}
                multiline
              />
              <DetailItem
                label="Ngày vào làm"
                value={selectedStaff.startDate}
              />
              <DetailItem
                label="Ngày cập nhật"
                value={selectedStaff.updateDate}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

// Component for formatting each field in detail panel
const DetailItem = ({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string;
  multiline?: boolean;
}) => (
  <div className="flex justify-between items-center mb-4 w-full gap-4">
    {/* Left label */}
    <div className="text-gray-600 text-sm flex-shrink-0 w-[120px]">{label}</div>

    {/* Right value */}
    <div
      className={`text-lg font-semibold text-right ${
        multiline ? "whitespace-pre-line" : ""
      }`}
    >
      {value}
    </div>
  </div>
);
