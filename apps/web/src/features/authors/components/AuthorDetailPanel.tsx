import React from "react";
import { Tag } from "antd";
import { AuthorTableRow, AuthorStatus } from "../types";

interface AuthorDetailPanelProps {
    selectedItem: AuthorTableRow | null;
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

const getStatusTag = (status: AuthorStatus) => {
    switch (status) {
        case 'active': return <Tag color="success">Hoạt động</Tag>;
        case 'retired': return <Tag color="warning">Đã nghỉ hưu</Tag>;
        case 'deceased': return <Tag color="default">Đã mất</Tag>;
        default: return <Tag>Unknown</Tag>;
    }
};

export const AuthorDetailPanel: React.FC<AuthorDetailPanelProps> = ({ selectedItem }) => {
    if (!selectedItem) return null;

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-[#102e3c] text-center">Chi Tiết Tác Giả</h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                {/* Đã xóa phần Avatar/Logo ở đây */}

                <div className="space-y-1">
                    <InfoRow label="Họ và Tên" value={<span className="text-teal-700 font-bold">{selectedItem.fullName}</span>} />

                    <InfoRow label="Bút danh" value={selectedItem.penName ? <span className="italic">{selectedItem.penName}</span> : "--"} />

                    <InfoRow label="Trạng thái" value={getStatusTag(selectedItem.status)} />

                    <div className="my-4 border-t border-dashed border-gray-300"></div>

                    <InfoRow label="Quốc tịch" value={selectedItem.nationality} />
                    <InfoRow label="Email" value={selectedItem.email} />
                    <InfoRow label="Số điện thoại" value={selectedItem.phone} />

                    {selectedItem.bio && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="text-gray-500 text-sm block mb-2 font-semibold">Tiểu sử:</span>
                            <p className="text-sm text-[#102e3c] bg-gray-50 p-3 rounded-md leading-relaxed whitespace-pre-wrap">
                                {selectedItem.bio}
                            </p>
                        </div>
                    )}
                </div>

                <div className="h-4"></div>
            </div>
        </div>
    );
};