import React from "react";
import { Drawer, Descriptions, Table, Tag, Typography, Spin, Divider } from "antd";
import { formatCurrency, formatDateTime } from "@/utils"; // Giả sử bạn có utils này
import { usePurchaseOrderDetail } from "../hooks/usePurchaseOrder";
import { PurchaseOrderStatus } from "../types";

const { Text } = Typography;

interface PurchaseOrderDetailDrawerProps {
    orderId: string | null;
    onClose: () => void;
}

const getStatusTag = (status: PurchaseOrderStatus) => {
    const map: Record<string, { color: string; label: string }> = {
        draft: { color: "default", label: "Nháp" },
        pending_approval: { color: "warning", label: "Chờ duyệt" },
        approved: { color: "blue", label: "Đã duyệt" },
        sent_to_supplier: { color: "cyan", label: "Đã gửi NCC" },
        received: { color: "processing", label: "Đang nhập kho" },
        completed: { color: "success", label: "Hoàn thành" },
        cancelled: { color: "error", label: "Đã hủy" },
    };
    const item = map[status] || { color: "default", label: status };
    return <Tag color={item.color}>{item.label}</Tag>;
};

export const PurchaseOrderDetailDrawer: React.FC<PurchaseOrderDetailDrawerProps> = ({
    orderId,
    onClose,
}) => {
    const { data: order, isLoading } = usePurchaseOrderDetail(orderId);

    const productColumns = [
        {
            title: "Sản phẩm",
            dataIndex: ["product", "name"],
            key: "name",
            render: (text: string, record: any) => (
                <div className="flex items-center gap-2">
                    {record.product.imageUrl && (
                        <img src={record.product.imageUrl} alt="" className="w-8 h-8 rounded object-cover border" />
                    )}
                    <div>
                        <div className="font-medium text-sm">{text}</div>
                        <div className="text-xs text-gray-500">{record.product.sku}</div>
                    </div>
                </div>
            )
        },
        {
            title: "SL",
            dataIndex: "quantity",
            key: "quantity",
            align: "center" as const,
        },
        {
            title: "Đơn giá",
            dataIndex: "unitPrice",
            key: "unitPrice",
            align: "right" as const,
            render: (val: number) => formatCurrency(val),
        },
        {
            title: "Thành tiền",
            dataIndex: "subTotal", // API trả về subTotal (quantity * unitPrice)
            key: "subTotal",
            align: "right" as const,
            render: (val: number, record: any) => (
                <span className="font-semibold text-teal-700">
                    {val ? formatCurrency(val) : formatCurrency(record.quantity * record.unitPrice)}
                </span>
            ),
        },
    ];

    return (
        <Drawer
            title={order ? `Chi tiết đơn nhập #${order.id.slice(0, 8)}` : "Chi tiết đơn nhập"}
            width={720}
            onClose={onClose}
            open={!!orderId}
            destroyOnClose
        >
            {isLoading || !order ? (
                <div className="flex justify-center items-center h-full">
                    <Spin size="large" />
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* Header Info */}
                    <div className="flex justify-between items-start bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Trạng thái</div>
                            {getStatusTag(order.status)}
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Tổng giá trị</div>
                            <div className="text-xl font-extrabold text-teal-700">{formatCurrency(order.totalAmount)}</div>
                        </div>
                    </div>

                    <Descriptions title="Thông tin chung" column={2} size="small">
                        <Descriptions.Item label="Ngày tạo">{formatDateTime(order.createdAt)}</Descriptions.Item>
                        <Descriptions.Item label="Ngày nhập">{order.purchaseDate ? formatDateTime(order.purchaseDate) : "--"}</Descriptions.Item>
                        <Descriptions.Item label="Nhân viên tạo">{order.employee?.fullName}</Descriptions.Item>
                        <Descriptions.Item label="Ghi chú" span={2}>{order.note || "--"}</Descriptions.Item>
                    </Descriptions>

                    <Divider style={{ margin: "0" }} />

                    <Descriptions title="Thông tin Nhà Cung Cấp" column={1} size="small">
                        <Descriptions.Item label="Tên NCC"><strong>{order.supplier?.name}</strong></Descriptions.Item>
                        <Descriptions.Item label="SĐT">{order.supplier?.phoneNumber}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{order.supplier?.address}</Descriptions.Item>
                    </Descriptions>

                    <Divider style={{ margin: "0" }} />

                    <div>
                        <h4 className="font-bold mb-3 text-gray-800">Danh sách sản phẩm nhập</h4>
                        <Table
                            dataSource={order.details}
                            columns={productColumns}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            bordered
                        />
                    </div>
                </div>
            )}
        </Drawer>
    );
};