import React from "react";
import { Tabs } from "antd";
import { ShelvesView } from "./ShelvesView";
import { DisplayProductsView } from "./DisplayProductsView";
import { DisplayLogsView } from "./DisplayLogsView";

export const DisplayPage = () => {
    const items = [
        { key: '1', label: 'Quản lý Kệ', children: <ShelvesView /> },
        { key: '2', label: 'Tìm kiếm sản phẩm', children: <DisplayProductsView /> },
        { key: '3', label: 'Lịch sử trưng bày', children: <DisplayLogsView /> },
    ];

    return (
        <div className="p-6 h-full flex flex-col font-['Inter'] bg-gray-50">
            <h2 className="text-2xl font-bold text-[#102e3c] mb-4">Hàng Trưng Bày</h2>
            <div className="flex-1 overflow-hidden">
                <Tabs defaultActiveKey="1" items={items} className="h-full ant-tabs-custom" style={{ height: '100%' }} />
            </div>
        </div>
    );
};