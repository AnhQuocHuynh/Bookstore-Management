import React from "react";
import { Spin, Tag } from "antd";
import { CategoryTableRow } from "../types";

interface CategoryTableProps {
    data: CategoryTableRow[];
    loading: boolean;
    onRowClick: (item: CategoryTableRow) => void;
    selectedId?: string;
    isPanelOpen: boolean;
}

export const TableHeader: React.FC<{ isPanelOpen: boolean }> = ({ isPanelOpen }) => {
    return (
        <div className="h-12 bg-[#1a998f] rounded-t-[20px] flex items-center px-3 w-full text-white font-bold text-sm">
            <div className="w-12 text-center">STT</div>
            <div className="flex-1 pl-4">Tên Danh Mục</div>

            {!isPanelOpen && <div className="w-48 pl-4">Slug</div>}
            <div className="w-32 text-right pr-4">Thuế (%)</div>
            {!isPanelOpen && <div className="w-24 text-center">Trạng Thái</div>}
        </div>
    );
};

export const CategoryTable: React.FC<CategoryTableProps> = ({
    data,
    loading,
    onRowClick,
    selectedId,
    isPanelOpen,
}) => {
    if (loading) {
        return <div className="flex justify-center items-center h-full w-full"><Spin size="large" /></div>;
    }

    return (
        <div className="w-full">
            {data.map((item, index) => (
                <div
                    key={item.key}
                    onClick={() => onRowClick(item)}
                    className={`
            flex items-center px-3 h-14 border-b border-gray-100 cursor-pointer transition-colors text-sm text-[#102e3c]
            ${selectedId === item.id ? "bg-[#1a998f]/20 border-l-4 border-l-[#1a998f] pl-[8px]" : "hover:bg-gray-50"}
          `}
                >
                    <div className="w-12 text-center font-medium text-gray-500">{index + 1}</div>
                    <div className="flex-1 pl-4 font-semibold text-teal-700 truncate">{item.name}</div>

                    {!isPanelOpen && (
                        <div className="w-48 pl-4 truncate text-gray-500 italic">{item.slug}</div>
                    )}

                    <div className="w-32 text-right pr-4 font-medium">
                        {(item.taxRate * 100).toFixed(0)}%
                    </div>

                    {!isPanelOpen && (
                        <div className="w-24 text-center">
                            {item.status === 'active' ? (
                                <Tag color="success" className="m-0">Active</Tag>
                            ) : (
                                <Tag color="error" className="m-0">Inactive</Tag>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {data.length === 0 && (
                <div className="p-10 text-center text-gray-400">Không tìm thấy danh mục nào</div>
            )}
        </div>
    );
};