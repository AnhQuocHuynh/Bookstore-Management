import React, { useState, useEffect } from "react";
import { Card, Table, Button, Space, Spin, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";

interface Supplier {
  key: number;
  id?: string;
  supplierId: string;
  name: string;
  email: string;
  phoneNumber: string;
  contactPerson: string;
  status: string;
  address?: string;
  taxCode?: string;
  note?: string;
  createdDate?: string;
  updateDate?: string;
}

export const SuppliersPage = () => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch suppliers list from API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/v1/suppliers", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (response.data?.data) {
          const supplierList = Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data];

          const formattedSuppliers = supplierList.map(
            (supplier: any, index: number) => ({
              key: supplier.id || index,
              id: supplier.id,
              supplierId: supplier.supplierCode || "N/A",
              name: supplier.name || "N/A",
              email: supplier.email || "N/A",
              phoneNumber: supplier.phoneNumber || "N/A",
              contactPerson: supplier.contactPerson || "N/A",
              status: supplier.status || "N/A",
              address: supplier.address || "N/A",
              taxCode: supplier.taxCode || "N/A",
              note: supplier.note || "",
              createdDate: supplier.createdAt || "N/A",
              updateDate: supplier.updatedAt || "N/A",
            }),
          );

          setData(formattedSuppliers);
        }
      } catch (error: any) {
        console.error("Failed to fetch suppliers:", error);
        message.error("Không thể tải danh sách nhà cung cấp");
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Fetch specific supplier details when row is clicked
  const handleRowClick = async (record: Supplier) => {
    if (selectedSupplier?.key === record.key) {
      setSelectedSupplier(null);
      return;
    }

    try {
      setDetailLoading(true);
      const response = await axios.get(`/api/v1/suppliers/${record.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.data?.data) {
        const supplier = response.data.data;
        const detailedSupplier: Supplier = {
          key: supplier.id || record.key,
          id: supplier.id,
          supplierId: supplier.supplierCode || "N/A",
          name: supplier.name || "N/A",
          email: supplier.email || "N/A",
          phoneNumber: supplier.phoneNumber || "N/A",
          contactPerson: supplier.contactPerson || "N/A",
          status: supplier.status || "N/A",
          address: supplier.address || "N/A",
          taxCode: supplier.taxCode || "N/A",
          note: supplier.note || "",
          createdDate: supplier.createdAt || "N/A",
          updateDate: supplier.updatedAt || "N/A",
        };

        setSelectedSupplier(detailedSupplier);
      }
    } catch (error: any) {
      console.error("Failed to fetch supplier details:", error);
      message.error("Không thể tải chi tiết nhà cung cấp");
    } finally {
      setDetailLoading(false);
    }
  };

  /** ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 70,
    },
    { title: "Mã NCC", dataIndex: "supplierId", key: "supplierId" },
    { title: "Tên NCC", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Người liên lạc",
      dataIndex: "contactPerson",
      key: "contactPerson",
    },
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
        {/* LEFT — SUPPLIER TABLE */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Nhà cung cấp</h1>

            <Button type="primary" icon={<PlusOutlined />}>
              Thêm nhà cung cấp
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
        {selectedSupplier && (
          <aside className="relative w-[400px] bg-white border-2 border-teal-600 rounded-xl p-6 flex flex-col items-center shadow-md">
            <button
              onClick={() => setSelectedSupplier(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
            >
              ✕
            </button>

            {detailLoading ? (
              <div className="flex justify-center py-10 w-full">
                <Spin />
              </div>
            ) : (
              <>
                {/* PHOTO PLACEHOLDER */}
                {/* <div className="w-[250px] h-[250px] bg-gray-300 rounded-md" /> */}

                <div className="mt-8 w-full space-y-2">
                  <DetailItem
                    label="Mã NCC"
                    value={selectedSupplier.supplierId}
                  />
                  <DetailItem label="Tên NCC" value={selectedSupplier.name} />
                  <DetailItem label="Email" value={selectedSupplier.email} />
                  <DetailItem
                    label="Số điện thoại"
                    value={selectedSupplier.phoneNumber}
                  />
                  <DetailItem
                    label="Người liên lạc"
                    value={selectedSupplier.contactPerson}
                  />
                  <DetailItem
                    label="Trạng thái"
                    value={selectedSupplier.status}
                  />
                  <DetailItem
                    label="Địa chỉ"
                    value={selectedSupplier.address}
                    multiline
                  />
                  <DetailItem
                    label="Mã số thuế"
                    value={selectedSupplier.taxCode}
                  />
                  <DetailItem
                    label="Ghi chú"
                    value={selectedSupplier.note}
                    multiline
                  />
                  <DetailItem
                    label="Ngày tạo"
                    value={selectedSupplier.createdDate}
                  />
                  <DetailItem
                    label="Ngày cập nhật"
                    value={selectedSupplier.updateDate}
                  />
                </div>
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

/** Component used for each detail item */
const DetailItem = ({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string;
  multiline?: boolean;
}) => (
  <div className="flex justify-between items-center mb-3 w-full gap-4">
    <div className="text-gray-600 text-sm flex-shrink-0 w-[130px]">{label}</div>
    <div
      className={`text-lg font-semibold text-right ${
        multiline ? "whitespace-pre-line" : ""
      }`}
    >
      {value || "--"}
    </div>
  </div>
);
