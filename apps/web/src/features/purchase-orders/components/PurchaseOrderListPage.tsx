import React, { useState } from "react";
import { Table, Button, Input, Card, Typography } from "antd"; // Đã bỏ Select và Tag
import { Plus, Search, Eye } from "lucide-react"; // Đã bỏ Filter icon
import { useNavigate } from "react-router-dom";
import { usePurchaseOrders } from "../hooks/usePurchaseOrder";
import { formatCurrency, formatDateTime } from "@/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { PurchaseOrderDetailDrawer } from "./PurchaseOrderDetailDrawer";

const { Title } = Typography;

export const PurchaseOrderListPage = () => {
    const navigate = useNavigate();

    // --- States ---
    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 500);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    // --- Data Fetching ---
    // Đã bỏ params status
    const { data: orders, isLoading } = usePurchaseOrders({
        employeeName: debouncedSearch || undefined,
    });

    const columns = [
        {
            title: "Mã đơn",
            dataIndex: "id",
            width: 100,
            render: (id: string) => <span className="font-mono text-xs">{id.slice(0, 8)}...</span>,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            width: 150,
            render: (date: string) => formatDateTime(date),
            sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            defaultSortOrder: 'descend' as const,
        },
        {
            title: "Nhân viên tạo",
            dataIndex: ["employee", "fullName"],
            render: (text: string) => <span className="font-medium">{text}</span>,
        },
        {
            title: "Ghi chú",
            dataIndex: "note",
            ellipsis: true,
            render: (text: string) => <span className="text-gray-500 italic">{text || "--"}</span>
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalAmount",
            align: "right" as const,
            width: 150,
            render: (val: number) => <span className="font-bold text-teal-700">{formatCurrency(val)}</span>,
        },
        // Đã xóa cột Trạng thái ở đây
        {
            title: "",
            width: 80,
            align: "center" as const,
            render: (_: any, record: any) => (
                <Button
                    type="text"
                    icon={<Eye size={18} className="text-teal-600" />}
                    onClick={(e) => {
                        e.stopPropagation(); // Ngăn sự kiện click row
                        setSelectedOrderId(record.id);
                    }}
                />
            ),
        },
    ];

    return (
        <div className="p-6 h-full flex flex-col font-['Inter'] bg-gray-50">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <Title level={2} style={{ margin: 0, color: "#102e3c" }}>
                        Danh sách Phiếu Nhập
                    </Title>
                    <p className="text-gray-500">Quản lý lịch sử nhập hàng vào kho</p>
                </div>
                <Button
                    type="primary"
                    size="large"
                    icon={<Plus size={18} />}
                    className="bg-[#1a998f] hover:bg-[#158f85] font-semibold"
                    onClick={() => navigate("/purchase-orders/create")}
                >
                    Tạo Phiếu Nhập
                </Button>
            </div>

            {/* FILTERS - Đã bỏ Dropdown Status */}
            <Card className="mb-4 shadow-sm rounded-xl border border-gray-200" styles={{ body: { padding: '16px' } }}>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="w-full md:w-[350px]">
                        <Input
                            prefix={<Search size={16} className="text-gray-400" />}
                            placeholder="Tìm theo tên nhân viên..."
                            allowClear
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="h-10"
                        />
                    </div>
                </div>
            </Card>

            {/* TABLE */}
            <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <Table
                    columns={columns}
                    dataSource={orders || []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} phiếu`
                    }}
                    scroll={{ y: 'calc(100vh - 350px)' }}
                    onRow={(record) => ({
                        onClick: () => setSelectedOrderId(record.id),
                        className: "cursor-pointer hover:bg-gray-50 transition-colors"
                    })}
                />
            </div>

            {/* DETAIL DRAWER */}
            <PurchaseOrderDetailDrawer
                orderId={selectedOrderId}
                onClose={() => setSelectedOrderId(null)}
            />
        </div>
    );
};