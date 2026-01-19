import React from "react";
import { Tag } from "antd";
import { EmployeeTableRow, EmployeeRole, ROLE_LABELS, STATUS_LABELS } from "../types";

interface EmployeeDetailPanelProps {
    selectedItem: EmployeeTableRow | null;
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

const getRoleLabel = (role: EmployeeRole) => {
    switch (role) {
        case 'ADMIN': return 'Quản lý';
        case 'STORE_MANAGER': return 'Quản lý cửa hàng';
        case 'CASHIER': return 'Thu ngân';
        case 'INVENTORY': return 'Nhân viên kho';
        case 'ACCOUNTANT': return 'Kế toán';
        default: return 'Nhân viên';
    }
};

const getRoleColor = (role: string) => {
    switch (role) {
        case 'OWNER': return 'red';
        case 'MANAGER': return 'blue';
        case 'CASHIER': return 'cyan';
        case 'WAREHOUSE': return 'orange';
        case 'SALES': return 'green';
        default: return 'default';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'ACTIVE': return 'green';
        case 'INACTIVE': return 'red';
        case 'ON_LEAVE': return 'orange';
        default: return 'default';
    }
};

const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
};

const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const EmployeeDetailPanel: React.FC<EmployeeDetailPanelProps> = ({ selectedItem }) => {
    if (!selectedItem) return null;

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-[#102e3c] text-center">Chi Tiết Nhân Viên</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="w-full flex justify-center mb-6">
                    {selectedItem.avatarUrl ? (
                        <img
                            src={selectedItem.avatarUrl}
                            alt={selectedItem.fullName}
                            className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md"
                        />
                    ) : (
                        <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-3xl font-bold border-2 border-white shadow-md">
                            {selectedItem.fullName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <InfoRow label="Mã Nhân Viên" value={selectedItem.staffId || selectedItem.id.slice(0, 8).toUpperCase()} />
                    <InfoRow label="Họ và Tên" value={<span className="text-teal-700 font-bold">{selectedItem.fullName}</span>} />

                    <InfoRow
                        label="Vai trò"
                        value={
                            <Tag color={getRoleColor(selectedItem.role)}>
                                {getRoleLabel(selectedItem.role)}
                            </Tag>
                        }
                    />

                    <InfoRow
                        label="Trạng thái"
                        value={
                            <Tag color={getStatusColor(selectedItem.status)}>
                                {getStatusLabel(selectedItem.status)}
                            </Tag>
                        }
                    />

                    <div className="my-4 border-t border-dashed border-gray-300"></div>

                    <h4 className="text-[#1a998f] font-bold mb-2">Thông tin liên hệ</h4>
                    <InfoRow label="Số điện thoại" value={selectedItem.phone} />
                    <InfoRow label="Email" value={selectedItem.email} />
                    <InfoRow label="Địa chỉ" value={selectedItem.address || "Chưa cập nhật"} />
                    <InfoRow label="Ngày sinh" value={formatDate(selectedItem.dateOfBirth)} />

                    <div className="my-4 border-t border-dashed border-gray-300"></div>
                    <h4 className="text-[#1a998f] font-bold mb-2">Thông tin công việc</h4>

                    <InfoRow label="Ngày vào làm" value={formatDate(selectedItem.startDate)} />
                    <InfoRow label="Ngày tạo" value={formatDate(selectedItem.createdAt)} />
                </div>
                <div className="h-4"></div>
            </div>
        </div>
    );
};
