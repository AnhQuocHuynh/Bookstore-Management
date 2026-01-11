import React from "react";
import { Tag } from "antd";
import { CustomerTableRow } from "../types";

interface CustomerDetailPanelProps {
    selectedItem: CustomerTableRow | null;
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

export const CustomerDetailPanel: React.FC<CustomerDetailPanelProps> = ({ selectedItem }) => {
    if (!selectedItem) return null;

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-[#102e3c] text-center">Chi Tiết Khách Hàng</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="w-full flex justify-center mb-6">
                    <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-3xl font-bold border-2 border-white shadow-md">
                        {selectedItem.fullName.charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="space-y-1">
                    <InfoRow label="Mã Khách Hàng" value={selectedItem.customerCode} />
                    <InfoRow label="Họ và Tên" value={<span className="text-teal-700 font-bold">{selectedItem.fullName}</span>} />

                    <InfoRow
                        label="Hạng khách"
                        value={
                            <Tag color={selectedItem.customerType === 'vip' ? 'gold' : selectedItem.customerType === 'premium' ? 'purple' : 'blue'}>
                                {selectedItem.customerType.toUpperCase()}
                            </Tag>
                        }
                    />

                    <div className="my-4 border-t border-dashed border-gray-300"></div>

                    <InfoRow label="Số điện thoại" value={selectedItem.phoneNumber} />
                    <InfoRow label="Email" value={selectedItem.email} />
                    <InfoRow label="Địa chỉ" value={selectedItem.address} />

                    <div className="my-4 border-t border-dashed border-gray-300"></div>

                    {selectedItem.note && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="text-gray-500 text-sm block mb-2 font-semibold">Ghi chú:</span>
                            <p className="text-sm text-[#102e3c] bg-gray-50 p-3 rounded-md leading-relaxed">
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