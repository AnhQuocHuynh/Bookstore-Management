import React from "react";
import { Spin, Tag } from "antd";
import { AuthorTableRow, AuthorStatus } from "../types";

interface AuthorTableProps {
    data: AuthorTableRow[];
    loading: boolean;
    onRowClick: (item: AuthorTableRow) => void;
    selectedId?: string;
    isPanelOpen: boolean;
}

const getStatusTag = (status: AuthorStatus) => {
    switch (status) {
        case 'active': return <Tag color="success">Hoạt động</Tag>;
        case 'retired': return <Tag color="warning">Đã nghỉ hưu</Tag>;
        case 'deceased': return <Tag color="default">Đã mất</Tag>;
        default: return <Tag>Unknown</Tag>;
    }
};

export const TableHeader: React.FC<{ isPanelOpen: boolean }> = ({ isPanelOpen }) => {
    return (
        <div className="h-12 bg-[#1a998f] rounded-t-[20px] flex items-center px-3 w-full text-white font-bold text-sm">
            <div className="w-12 text-center">STT</div>
            <div className="flex-1 pl-4">Họ và Tên</div>
            <div className="w-32 pl-4">Bút Danh</div>

            {!isPanelOpen && <div className="w-32 pl-4">Quốc Tịch</div>}
            {!isPanelOpen && <div className="w-32 text-center">Trạng Thái</div>}
        </div>
    );
};

export const AuthorTable: React.FC<AuthorTableProps> = ({
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
                    <div className="flex-1 pl-4 font-semibold text-teal-700 truncate">{item.fullName}</div>
                    <div className="w-32 pl-4 truncate text-gray-600 italic">{item.penName || "--"}</div>

                    {!isPanelOpen && (
                        <div className="w-32 pl-4 truncate">{item.nationality || "--"}</div>
                    )}

                    {!isPanelOpen && (
                        <div className="w-32 text-center">
                            {getStatusTag(item.status)}
                        </div>
                    )}
                </div>
            ))}

            {data.length === 0 && (
                <div className="p-10 text-center text-gray-400">Không tìm thấy tác giả nào</div>
            )}
        </div>
    );
};