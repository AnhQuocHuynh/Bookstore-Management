import React from "react";
import { Tag } from "antd";
import { CategoryTableRow } from "../types";

interface CategoryDetailPanelProps {
    selectedItem: CategoryTableRow | null;
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

export const CategoryDetailPanel: React.FC<CategoryDetailPanelProps> = ({ selectedItem }) => {
    if (!selectedItem) return null;

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-[#102e3c] text-center">Chi Tiết Danh Mục</h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                {/* Đã xóa phần Logo/Avatar ở đây */}

                <div className="space-y-1">
                    <InfoRow label="Tên danh mục" value={<span className="text-teal-700 font-bold">{selectedItem.name}</span>} />

                    <InfoRow
                        label="Slug (URL)"
                        value={<code className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">{selectedItem.slug}</code>}
                    />

                    <InfoRow label="Thuế suất (VAT)" value={`${(selectedItem.taxRate * 100).toFixed(0)}%`} />

                    <InfoRow
                        label="Trạng thái"
                        value={
                            selectedItem.status === 'active' ? <Tag color="success">Đang hoạt động</Tag> : <Tag color="error">Ngừng hoạt động</Tag>
                        }
                    />

                    {selectedItem.description && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="text-gray-500 text-sm block mb-2 font-semibold">Mô tả:</span>
                            <p className="text-sm text-[#102e3c] bg-gray-50 p-3 rounded-md leading-relaxed">
                                {selectedItem.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};