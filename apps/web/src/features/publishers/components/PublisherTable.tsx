import React from "react";
import { Spin } from "antd";
import { PublisherTableRow } from "../types";

interface PublisherTableProps {
    data: PublisherTableRow[];
    loading: boolean;
    onRowClick: (item: PublisherTableRow) => void;
    selectedId?: string;
    isPanelOpen: boolean;
}

export const TableHeader: React.FC<{ isPanelOpen: boolean }> = ({ isPanelOpen }) => {
    return (
        <div className="h-12 bg-[#1a998f] rounded-t-[20px] flex items-center px-3 w-full text-white font-bold text-sm">
            <div className="w-12 text-center">STT</div>
            <div className="flex-1 pl-4">Tên Nhà Xuất Bản</div>
            <div className="w-32 pl-4">Số Điện Thoại</div>

            {!isPanelOpen && <div className="w-48 pl-4">Email</div>}
            {!isPanelOpen && <div className="w-48 pl-4">Website</div>}
        </div>
    );
};

export const PublisherTable: React.FC<PublisherTableProps> = ({
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
                    <div className="w-32 pl-4 truncate text-gray-600">{item.phone || "--"}</div>

                    {!isPanelOpen && (
                        <div className="w-48 pl-4 truncate text-gray-600" title={item.email}>{item.email || "--"}</div>
                    )}

                    {!isPanelOpen && (
                        <div className="w-48 pl-4 truncate text-blue-600">
                            {item.website ? (
                                <a href={item.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{item.website}</a>
                            ) : "--"}
                        </div>
                    )}
                </div>
            ))}

            {data.length === 0 && (
                <div className="p-10 text-center text-gray-400">Không tìm thấy nhà xuất bản nào</div>
            )}
        </div>
    );
};