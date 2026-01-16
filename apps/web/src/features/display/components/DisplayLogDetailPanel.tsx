import React from "react";
import { Tag } from "antd";
import { DisplayLog } from "../types";
import { formatDateTime } from "@/utils";

interface DisplayLogDetailPanelProps {
    selectedItem: DisplayLog | null;
}

interface InfoRowProps {
    label: string;
    value?: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
    <div className="flex justify-between items-start w-full py-3 border-b border-gray-100 last:border-0">
        <span className="text-gray-500 text-sm flex-shrink-0 mr-4">{label}</span>
        <div className="text-[#102e3c] text-sm text-right font-medium break-words flex-1">
            {value ?? "--"}
        </div>
    </div>
);

const getActionTag = (action: string) => {
    const map: any = {
        add: { color: 'green', label: 'Thêm vào kệ' },
        remove: { color: 'red', label: 'Gỡ khỏi kệ' },
        move: { color: 'gold', label: 'Di chuyển' },
        adjust: { color: 'blue', label: 'Điều chỉnh' },
        return_to_inventory: { color: 'orange', label: 'Trả về kho' }
    };
    const item = map[action] || { color: 'default', label: action };
    return <Tag color={item.color}>{item.label}</Tag>;
};

export const DisplayLogDetailPanel: React.FC<DisplayLogDetailPanelProps> = ({ selectedItem }) => {
    if (!selectedItem) return null;

    const { action, quantity, createdAt, employee, shelf, displayProduct, note } = selectedItem;

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-[#102e3c] text-center">Chi Tiết Lịch Sử</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="space-y-1">
                    {/* Action Info */}
                    <InfoRow 
                        label="Hành Động" 
                        value={getActionTag(action)} 
                    />
                    
                    <InfoRow 
                        label="Thời Gian" 
                        value={<span className="font-semibold">{formatDateTime(createdAt)}</span>} 
                    />

                    <InfoRow 
                        label="Số Lượng" 
                        value={quantity ? <span className="text-teal-600 font-bold text-lg">{quantity}</span> : "N/A"} 
                    />

                    <div className="my-4 border-t border-dashed border-gray-300"></div>
                    <h4 className="text-[#1a998f] font-bold mb-2">Thông tin nhân viên</h4>

                    {/* Employee Info */}
                    <InfoRow 
                        label="Nhân Viên" 
                        value={<span className="text-teal-700 font-bold">{employee.fullName}</span>} 
                    />
                    
                    <InfoRow 
                        label="ID Nhân Viên" 
                        value={employee.id.slice(0, 8).toUpperCase()} 
                    />

                    <div className="my-4 border-t border-dashed border-gray-300"></div>
                    <h4 className="text-[#1a998f] font-bold mb-2">Thông tin kệ</h4>

                    {/* Shelf Info */}
                    {shelf && (
                        <>
                            <InfoRow 
                                label={action === 'move' ? 'Chuyển đến Kệ' : 'Vị Trí Kệ'} 
                                value={<Tag color="blue">{shelf.name}</Tag>} 
                            />
                            <InfoRow 
                                label="ID Kệ" 
                                value={shelf.id.slice(0, 8).toUpperCase()} 
                            />
                        </>
                    )}

                    {/* Product Info */}
                    {displayProduct && (
                        <>
                            <div className="my-4 border-t border-dashed border-gray-300"></div>
                            <h4 className="text-[#1a998f] font-bold mb-2">Thông tin sản phẩm</h4>
                            
                            <InfoRow 
                                label="Sản Phẩm" 
                                value={<span className="font-bold">{displayProduct.product.name}</span>} 
                            />
                            
                            <InfoRow 
                                label="SKU" 
                                value={displayProduct.product.sku} 
                            />

                            <InfoRow 
                                label="ID Sản Phẩm" 
                                value={displayProduct.id.slice(0, 8).toUpperCase()} 
                            />
                        </>
                    )}

                    {/* Note */}
                    {note && (
                        <>
                            <div className="my-4 border-t border-dashed border-gray-300"></div>
                            <div className="mt-4">
                                <span className="text-gray-500 text-sm block mb-2 font-semibold">Ghi chú:</span>
                                <p className="text-sm text-[#102e3c] bg-gray-50 p-3 rounded-md leading-relaxed italic">
                                    "{note}"
                                </p>
                            </div>
                        </>
                    )}
                </div>
                <div className="h-4"></div>
            </div>
        </div>
    );
};
