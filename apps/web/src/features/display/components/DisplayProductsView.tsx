import React, { useState } from "react";
import { Table, Input, Select, Tag, Empty } from "antd";
import { Search } from "lucide-react";
import { useDisplayProducts, useShelves } from "../hooks/useDisplay";
import { useDebounce } from "@/hooks/use-debounce";

export const DisplayProductsView = () => {
    const [keyword, setKeyword] = useState("");
    const [shelfId, setShelfId] = useState<string | undefined>(undefined);

    // Debounce để tránh gọi API liên tục khi gõ
    const debouncedKeyword = useDebounce(keyword, 500);

    // --- FIX LỖI 400 ---
    // Tạo object params sạch: Nếu keyword rỗng -> chuyển thành undefined
    // Khi params là undefined, Axios sẽ không gửi nó lên URL
    const queryParams = {
        keyword: debouncedKeyword && debouncedKeyword.trim() !== "" ? debouncedKeyword.trim() : undefined,
        shelfId: shelfId || undefined,
    };

    const { data: products, isLoading } = useDisplayProducts(queryParams);
    const { data: shelves } = useShelves();

    const columns = [
        {
            title: "Sản phẩm",
            dataIndex: ["product", "name"],
            render: (text: string, record: any) => (
                <div className="flex gap-3 items-center">
                    {/* Hiển thị ảnh nếu có */}
                    {record.product.imageUrl ? (
                        <img src={record.product.imageUrl} alt="" className="w-10 h-10 object-cover rounded border border-gray-200" />
                    ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-400">No Img</div>
                    )}
                    <div>
                        <div className="font-medium text-[#102e3c]">{text}</div>
                        <div className="text-xs text-gray-500">{record.product.sku}</div>
                    </div>
                </div>
            )
        },
        {
            title: "Vị trí Kệ",
            dataIndex: ["displayShelf", "name"],
            render: (text: string) => <Tag color="blue">{text}</Tag>
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            align: "center" as const,
            render: (q: number) => <span className="font-bold">{q}</span>
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            align: "center" as const,
            render: (status: string) => status === 'active'
                ? <Tag color="success">Đang trưng bày</Tag>
                : <Tag color="default">Ẩn</Tag>
        }
    ];

    return (
        <div className="flex flex-col h-full gap-4">
            {/* FILTER BAR */}
            <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex-1 min-w-[200px]">
                    <Input
                        prefix={<Search size={16} className="text-gray-400" />}
                        placeholder="Tìm tên sách, SKU..."
                        className="h-10"
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                    />
                </div>
                <div className="w-[250px]">
                    <Select
                        placeholder="Lọc theo kệ"
                        allowClear
                        className="w-full h-10"
                        options={shelves?.map((s: any) => ({ label: s.name, value: s.id }))}
                        onChange={setShelfId}
                        value={shelfId}
                    />
                </div>
            </div>

            {/* TABLE CONTENT */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <Table
                    dataSource={products || []}
                    columns={columns}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    scroll={{ y: 'calc(100vh - 300px)' }}
                    locale={{ emptyText: <Empty description="Không tìm thấy sản phẩm trưng bày nào" /> }}
                />
            </div>
        </div>
    );
};