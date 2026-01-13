import React from "react";
import { Table, Tag } from "antd";
import { useDisplayLogs } from "../hooks/useDisplay";
import { formatDateTime } from "@/utils";

export const DisplayLogsView = () => {
    const { data: logs, isLoading } = useDisplayLogs();

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

    const columns = [
        { title: "Thời gian", dataIndex: "createdAt", render: (d: string) => formatDateTime(d), width: 160 },
        { title: "Nhân viên", dataIndex: ["employee", "fullName"], width: 150 },
        { title: "Hành động", dataIndex: "action", render: (act: string) => getActionTag(act), width: 140 },
        {
            title: "Chi tiết",
            render: (_: any, record: any) => (
                <span>
                    {record.displayProduct?.product?.name && <span className="font-medium">{record.displayProduct.product.name} </span>}
                    {record.shelf && <span className="text-gray-500">tại {record.shelf.name}</span>}
                    {record.note && <div className="text-xs text-gray-400 italic">{record.note}</div>}
                </span>
            )
        },
        { title: "SL", dataIndex: "quantity", align: "center" as const, width: 80, render: (q: number) => q ? <b>{q}</b> : '-' },
    ];

    return (
        <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Table dataSource={logs || []} columns={columns} rowKey="id" loading={isLoading} pagination={{ pageSize: 20 }} />
        </div>
    );
};