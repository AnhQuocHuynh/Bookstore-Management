import React from "react";
import { Tag } from "antd";
import { InventoryLogItem } from "../types";
import { formatCurrency } from "@/utils";
import dayjs from "dayjs";
import { Truck, ShoppingCart, ArrowRightLeft, AlertTriangle } from "lucide-react";

interface InventoryLogDetailPanelProps {
    selectedItem: InventoryLogItem | null;
}

interface InfoRowProps {
    label: string;
    value?: React.ReactNode;
}

// Helper: Config màu sắc & Icon cho Action
const getActionConfig = (action: string) => {
    switch (action) {
        case 'purchase': return { color: 'green', label: 'Nhập hàng', icon: <Truck size={14} /> };
        case 'sale': return { color: 'blue', label: 'Bán hàng', icon: <ShoppingCart size={14} /> };
        case 'return': return { color: 'orange', label: 'Trả hàng', icon: <ArrowRightLeft size={14} /> };
        case 'adjustment': return { color: 'red', label: 'Điều chỉnh', icon: <AlertTriangle size={14} /> };
        default: return { color: 'default', label: action, icon: null };
    }
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
    <div className="flex justify-between items-start w-full py-3 border-b border-gray-100 last:border-0">
        <span className="text-gray-500 text-sm flex-shrink-0 mr-4">{label}</span>
        <div className="text-[#102e3c] text-sm text-right font-medium break-words flex-1">
            {value ?? "--"}
        </div>
    </div>
);

export const InventoryLogDetailPanel: React.FC<InventoryLogDetailPanelProps> = ({ selectedItem }) => {
    if (!selectedItem) return null;

    const actionConfig = getActionConfig(selectedItem.action);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* HEADER */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-[#102e3c] text-center">Chi Tiết Biến Động</h3>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                {/* Highlight Box: Số lượng thay đổi */}
                <div className={`mb-6 p-4 rounded-xl text-center border ${selectedItem.quantityChange > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="text-sm text-gray-500 mb-1">Số lượng thay đổi</div>
                    <div className={`text-3xl font-bold ${selectedItem.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedItem.quantityChange > 0 ? `+${selectedItem.quantityChange}` : selectedItem.quantityChange}
                    </div>
                </div>

                <div className="space-y-1">
                    <InfoRow label="Mã Log" value={<span className="font-mono text-xs">{selectedItem.id.slice(0, 8)}...</span>} />
                    <InfoRow
                        label="Thời gian"
                        value={dayjs(selectedItem.createdAt).format("HH:mm - DD/MM/YYYY")}
                    />
                    <InfoRow
                        label="Loại hành động"
                        value={
                            <Tag color={actionConfig.color} className="flex items-center gap-1 w-fit m-0">
                                {actionConfig.icon} {actionConfig.label}
                            </Tag>
                        }
                    />

                    <div className="my-4 border-t border-dashed border-gray-300"></div>
                    <h4 className="text-[#1a998f] font-bold mb-2">Thông tin Sản phẩm</h4>

                    <InfoRow label="Mã SKU" value={selectedItem.inventory?.product?.sku} />
                    <InfoRow label="Tên sản phẩm" value={<span className="font-semibold text-teal-700">{selectedItem.inventory?.product?.name}</span>} />
                    {/* Nếu backend có trả về tồn kho tại thời điểm đó hoặc hiện tại */}
                    <InfoRow label="Tồn kho hiện tại" value={selectedItem.inventory?.stockQuantity} />
                    <InfoRow label="Giá vốn" value={formatCurrency(selectedItem.inventory?.costPrice)} />

                    <div className="my-4 border-t border-dashed border-gray-300"></div>
                    <h4 className="text-[#1a998f] font-bold mb-2">Thông tin bổ sung</h4>

                    <InfoRow label="Nhân viên" value={selectedItem.employee?.fullName || "Hệ thống"} />
                    <InfoRow label="Email" value={selectedItem.employee?.email} />

                    {selectedItem.note && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="text-gray-500 text-sm block mb-2 font-semibold">Ghi chú:</span>
                            <p className="text-sm text-[#102e3c] bg-gray-50 p-3 rounded-md leading-relaxed whitespace-pre-wrap italic">
                                {selectedItem.note}
                            </p>
                        </div>
                    )}
                </div>
                <div className="h-4"></div>
            </div>
        </div>
    );
};