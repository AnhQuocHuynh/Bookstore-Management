import React from "react";
import { Drawer, Descriptions, Table, Typography, Spin, Divider } from "antd"; // Đã bỏ Tag
import { formatCurrency, formatDateTime } from "@/utils";
import { usePurchaseOrderDetail } from "../hooks/usePurchaseOrder";

interface PurchaseOrderDetailDrawerProps {
    orderId: string | null;
    onClose: () => void;
}

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
            dataIndex: "subTotal",
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
                    {/* Header Info - Đã bỏ phần trạng thái bên trái */}
                    <div className="flex justify-end items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Tổng giá trị</div>
                            <div className="text-2xl font-extrabold text-teal-700">{formatCurrency(order.totalAmount)}</div>
                        </div>
                    </div>

                    <Descriptions title="Thông tin chung" column={2} size="small">
                        <Descriptions.Item label="Ngày tạo">{formatDateTime(order.createdAt)}</Descriptions.Item>
                        {/* Nếu purchaseDate null thì lấy createdAt hiển thị luôn cho hợp lý vì là completed */}
                        <Descriptions.Item label="Ngày nhập">
                            {order.purchaseDate ? formatDateTime(order.purchaseDate) : formatDateTime(order.createdAt)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nhân viên tạo">{order.employee?.fullName}</Descriptions.Item>
                        <Descriptions.Item label="Ghi chú" span={2}>
                            <span className="italic text-gray-600">{order.note || "(Không có ghi chú)"}</span>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider style={{ margin: "0" }} />

                    <Descriptions title="Thông tin Nhà Cung Cấp" column={1} size="small">
                        <Descriptions.Item label="Tên NCC">
                            <span className="font-bold text-[#102e3c] text-base">{order.supplier?.name}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="SĐT">{order.supplier?.phoneNumber || "--"}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{order.supplier?.address || "--"}</Descriptions.Item>
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