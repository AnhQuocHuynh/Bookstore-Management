import React from "react";
import { Spin, Tag } from "antd";
import { EmployeeTableRow, EmployeeRole } from "../types";

interface EmployeeTableProps {
    data: EmployeeTableRow[];
    loading: boolean;
    onRowClick: (item: EmployeeTableRow) => void;
    selectedId?: string;
    isPanelOpen: boolean;
}

const getRoleColor = (role: string) => {
    switch (role) {
        case 'OWNER': return 'red';
        case 'MANAGER': return 'blue';
        default: return 'green'; // CASHIER, WAREHOUSE, SALES
    }
};

const getRoleLabel = (role: string) => {
    switch (role) {
        case 'OWNER': return 'Chủ cửa hàng';
        case 'MANAGER': return 'Quản lý';
        case 'CASHIER': return 'Thu ngân';
        case 'WAREHOUSE': return 'Kho hàng';
        case 'SALES': return 'Bán hàng';
        default: return 'Nhân viên';
    }
};

const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'green' : 'red';
};

const getStatusLabel = (status: string) => {
    return status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động';
};

export const TableHeader: React.FC<{ isPanelOpen: boolean }> = ({ isPanelOpen }) => {
    return (
        <div className="h-12 bg-[#1a998f] rounded-t-[20px] flex items-center px-3 w-full text-white font-bold text-sm">
            <div className="w-12 text-center">STT</div>
            <div className="w-24 pl-2">Mã NV</div>
            <div className="flex-1 pl-4">Tên Nhân Viên</div>
            <div className="w-32 pl-4">Email</div>

            {!isPanelOpen && <div className="w-24 text-center">Vai trò</div>}
            {!isPanelOpen && <div className="w-32 text-center pl-4">Ngày vào làm</div>}
            {!isPanelOpen && <div className="w-24 text-center">Trạng Thái</div>}
        </div>
    );
};

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
    data,
    loading,
    onRowClick,
    selectedId,
    isPanelOpen,
}) => {
    if (loading) {
        return <div className="flex justify-center items-center h-full w-full"><Spin size="large" /></div>;
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

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
                    <div className="w-24 pl-2 font-semibold text-teal-700 truncate">{item.id.slice(0, 8)}</div>
                    <div className="flex-1 pl-4 font-medium truncate">{item.fullName}</div>
                    <div className="w-32 pl-4 truncate text-gray-600">{item.email}</div>

                    {!isPanelOpen && (
                        <div className="w-24 text-center">
                            <Tag color={getRoleColor(item.role)} className="m-0">
                                {getRoleLabel(item.role)}
                            </Tag>
                        </div>
                    )}

                    {!isPanelOpen && (
                        <div className="w-32 text-center pl-4 text-gray-600">
                            {formatDate(item.createdAt)}
                        </div>
                    )}

                    {!isPanelOpen && (
                        <div className="w-24 text-center">
                            <Tag color={getStatusColor(item.status)} className="m-0">
                                {getStatusLabel(item.status)}
                            </Tag>
                        </div>
                    )}
                </div>
            ))}

            {data.length === 0 && (
                <div className="p-10 text-center text-gray-400">Không tìm thấy nhân viên nào</div>
            )}
        </div>
    );
};
