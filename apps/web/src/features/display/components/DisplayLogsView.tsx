import React, { useState } from "react";
import { Table, Tag, DatePicker, Select, Button, Input } from "antd";
import { Search, RotateCcw } from "lucide-react";
import { useDisplayLogs } from "../hooks/useDisplay";
import { formatDateTime } from "@/utils";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export const DisplayLogsView = () => {
    // --- STATE BỘ LỌC ---
    const [action, setAction] = useState<string | undefined>(undefined);
    const [dateRange, setDateRange] = useState<any>(null);
    const [keyword, setKeyword] = useState(""); // Tìm theo tên nhân viên/kệ (nếu backend hỗ trợ)

    // Tạo params gửi đi
    const params = {
        action,
        from: dateRange ? dayjs(dateRange[0]).format('YYYY-MM-DD') : undefined,
        to: dateRange ? dayjs(dateRange[1]).format('YYYY-MM-DD') : undefined,
        // Nếu backend hỗ trợ tìm kiếm text trong logs
        keyword: keyword || undefined
    };

    const { data: logs, isLoading, refetch } = useDisplayLogs(params);

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
        {
            title: "Thời gian",
            dataIndex: "createdAt",
            render: (d: string) => <span className="text-gray-600">{formatDateTime(d)}</span>,
            width: 160,
            // Sắp xếp client-side nếu backend trả về full list
            sorter: (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            defaultSortOrder: 'ascend' as const
        },
        {
            title: "Nhân viên",
            dataIndex: ["employee", "fullName"],
            width: 180,
            render: (text: string) => <span className="font-medium">{text}</span>
        },
        {
            title: "Hành động",
            dataIndex: "action",
            render: (act: string) => getActionTag(act),
            width: 140,
            align: 'center' as const
        },
        {
            title: "Chi tiết",
            render: (_: any, record: any) => (
                <div className="flex flex-col">
                    <div className="font-medium text-[#102e3c]">
                        {record.displayProduct?.product?.name || record.shelf?.name || "---"}
                    </div>
                    <div className="text-xs text-gray-500">
                        {record.action === 'move' ? 'Chuyển sang kệ: ' : 'Tại kệ: '}
                        <span className="font-semibold">{record.shelf?.name}</span>
                    </div>
                    {record.note && <div className="text-xs text-gray-400 italic mt-1">"{record.note}"</div>}
                </div>
            )
        },
        {
            title: "SL",
            dataIndex: "quantity",
            align: "center" as const,
            width: 80,
            render: (q: number) => q ? <b className="text-teal-600">{q}</b> : '-'
        },
    ];

    const handleReset = () => {
        setAction(undefined);
        setDateRange(null);
        setKeyword("");
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* --- TOOLBAR: BỘ LỌC --- */}
            <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center">
                <Select
                    placeholder="Hành động"
                    allowClear
                    className="w-[150px]"
                    options={[
                        { label: 'Thêm hàng', value: 'add' },
                        { label: 'Di chuyển', value: 'move' },
                        { label: 'Trả về kho', value: 'return_to_inventory' },
                        { label: 'Xóa', value: 'remove' },
                    ]}
                    value={action}
                    onChange={setAction}
                />

                <RangePicker
                    placeholder={['Từ ngày', 'Đến ngày']}
                    className="w-[240px]"
                    onChange={setDateRange}
                    value={dateRange}
                />

                <Button
                    icon={<Search size={16} />}
                    type="primary"
                    onClick={() => refetch()}
                    className="bg-[#1a998f]"
                >
                    Lọc
                </Button>

                <Button
                    icon={<RotateCcw size={16} />}
                    onClick={handleReset}
                    title="Đặt lại bộ lọc"
                />
            </div>

            {/* --- TABLE CONTENT --- */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <Table
                    dataSource={logs || []}
                    columns={columns}
                    rowKey="id"
                    loading={isLoading}

                    // --- CẤU HÌNH PHÂN TRANG & SCROLL ---
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bản ghi`,
                        position: ['bottomRight'] // Đảm bảo vị trí nằm ở góc dưới
                    }}

                    // QUAN TRỌNG: scroll.y giúp cố định header và cuộn body
                    // calc(100vh - 320px): Trừ đi chiều cao của Header, Filter Bar, Tabs, Padding...
                    // Bạn có thể chỉnh số 320px này tăng giảm tùy layout thực tế
                    scroll={{ y: 'calc(100vh - 320px)' }}
                />
            </div>
        </div>
    );
};