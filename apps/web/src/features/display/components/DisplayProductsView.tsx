import React, { useState } from "react";
import { Table, Input, Select, Tag } from "antd";
import { Search } from "lucide-react";
import { useDisplayProducts, useShelves } from "../hooks/useDisplay";
import { useDebounce } from "@/hooks/use-debounce";

export const DisplayProductsView = () => {
    const [keyword, setKeyword] = useState("");
    const [shelfId, setShelfId] = useState<string | undefined>(undefined);
    const debouncedKeyword = useDebounce(keyword, 500);

    const { data: products, isLoading } = useDisplayProducts({ keyword: debouncedKeyword, shelfId });
    const { data: shelves } = useShelves();

    const columns = [
        {
            title: "Sản phẩm",
            dataIndex: ["product", "name"],
            render: (text: string, record: any) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-gray-500">{record.product.sku}</div>
                </div>
            )
        },
        {
            title: "Vị trí Kệ",
            dataIndex: ["displayShelf", "name"],
            render: (text: string) => <Tag color="blue">{text}</Tag>
        },
        { title: "Số lượng", dataIndex: "quantity", align: "center" as const },
    ];

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <Input
                    prefix={<Search size={16} className="text-gray-400" />}
                    placeholder="Tìm tên sách, SKU..."
                    className="max-w-xs"
                    value={keyword} onChange={e => setKeyword(e.target.value)}
                />
                <Select
                    placeholder="Lọc theo kệ"
                    allowClear
                    className="min-w-[200px]"
                    options={shelves?.map(s => ({ label: s.name, value: s.id }))}
                    onChange={setShelfId}
                />
            </div>
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <Table dataSource={products || []} columns={columns} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
            </div>
        </div>
    );
};