import React from "react";
import { Spin, Tag } from "antd";
import { DisplayLog } from "../types";
import { formatDateTime } from "@/utils";

interface DisplayLogTableProps {
    data: DisplayLog[];
    loading: boolean;
    selectedItem: DisplayLog | null;
    onRowClick: (item: DisplayLog) => void;
    isPanelOpen: boolean;
}

const getActionTag = (action: string) => {
    const map: any = {
        add: { color: 'green', label: 'Thêm vào kệ' },
        remove: { color: 'red', label: 'Gỡ khỏi kệ' },
        move: { color: 'gold', label: 'Di chuyển' },
        adjust: { color: 'blue', label: 'Điều chỉnh' },
        return_to_inventory: { color: 'orange', label: 'Trả về kho' }
    };
    const item = map[action] || { color: 'default', label: action };
    return <Tag color={item.color} className="m-0">{item.label}</Tag>;
};

export const TableHeader: React.FC<{ isPanelOpen: boolean }> = ({ isPanelOpen }) => {
    return (
        <div className="h-12 bg-[#1a998f] rounded-t-[20px] flex items-center px-3 w-full text-white font-bold text-sm">
            <div className="w-12 text-center">STT</div>
            <div className={isPanelOpen ? "w-32 pl-2" : "w-40 pl-2"}>Thời Gian</div>
            <div className={isPanelOpen ? "flex-1 pl-4" : "w-44 pl-4"}>Nhân Viên</div>
            <div className="w-32 text-center">Hành Động</div>
            {!isPanelOpen && <div className="flex-1 pl-4">Chi Tiết</div>}
            <div className="w-16 text-center">SL</div>
        </div>
    );
};

export const DisplayLogTable: React.FC<DisplayLogTableProps> = ({
    data,
    loading,
    selectedItem,
    onRowClick,
    isPanelOpen,
}) => {
    if (loading) {
        return <div className="flex justify-center items-center h-full w-full"><Spin size="large" /></div>;
    }

    return (
        <div className="w-full">
            {data.map((item, index) => (
                <div
                    key={item.id}
                    onClick={() => onRowClick(item)}
                    className={`
            flex items-center px-3 h-14 border-b border-gray-100 cursor-pointer transition-colors text-sm text-[#102e3c]
            ${selectedItem?.id === item.id ? "bg-[#1a998f]/20 border-l-4 border-l-[#1a998f] pl-[8px]" : "hover:bg-gray-50"}
          `}
                >
                    <div className="w-12 text-center font-medium text-gray-500">{index + 1}</div>
                    
                    <div className={isPanelOpen ? "w-32 pl-2 text-gray-600 text-xs" : "w-40 pl-2 text-gray-600 text-xs"}>
                        {formatDateTime(item.createdAt)}
                    </div>

                    <div className={isPanelOpen ? "flex-1 pl-4 font-medium truncate" : "w-44 pl-4 font-medium truncate"} title={item.employee.fullName}>
                        {item.employee.fullName}
                    </div>

                    <div className="w-32 flex justify-center">
                        {getActionTag(item.action)}
                    </div>

                    {!isPanelOpen && (
                        <div className="flex-1 pl-4">
                            <div className="font-medium text-[#102e3c] truncate">
                                {item.displayProduct?.product?.name || item.shelf?.name || "---"}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                {item.action === 'move' ? 'Chuyển sang kệ: ' : 'Tại kệ: '}
                                <span className="font-semibold">{item.shelf?.name}</span>
                            </div>
                        </div>
                    )}

                    <div className="w-16 text-center">
                        {item.quantity ? <b className="text-teal-600">{item.quantity}</b> : '-'}
                    </div>
                </div>
            ))}

            {data.length === 0 && (
                <div className="p-10 text-center text-gray-400">Không tìm thấy lịch sử nào</div>
            )}
        </div>
    );
};
