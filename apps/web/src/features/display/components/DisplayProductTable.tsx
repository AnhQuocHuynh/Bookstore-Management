import React from "react";
import { Spin, Tag } from "antd";
import { DisplayProduct } from "../types";

interface DisplayProductTableProps {
    data: DisplayProduct[];
    loading: boolean;
    selectedItem: DisplayProduct | null;
    onRowClick: (item: DisplayProduct) => void;
    isPanelOpen: boolean;
}

export const TableHeader: React.FC<{ isPanelOpen: boolean }> = ({ isPanelOpen }) => {
    return (
        <div className="h-12 bg-[#1a998f] rounded-t-[20px] flex items-center px-3 w-full text-white font-bold text-sm">
            <div className="w-12 text-center">STT</div>
            <div className="w-24 pl-2">SKU</div>
            {!isPanelOpen && <div className="w-16 text-center">Ảnh</div>}
            <div className="flex-1 pl-4">Tên Sản Phẩm</div>
            <div className={isPanelOpen ? "w-32 text-center" : "w-40 text-center"}>Vị Trí Kệ</div>
            <div className="w-20 text-center">Số Lượng</div>
            {!isPanelOpen && <div className="w-28 text-center">Trạng Thái</div>}
        </div>
    );
};

export const DisplayProductTable: React.FC<DisplayProductTableProps> = ({
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
                    <div className="w-24 pl-2 font-semibold text-teal-700 truncate">{item.product.sku}</div>
                    
                    {!isPanelOpen && (
                        <div className="w-16 flex justify-center">
                            {item.product.imageUrl ? (
                                <img src={item.product.imageUrl} alt="" className="w-10 h-10 object-cover rounded border border-gray-200" />
                            ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded border border-gray-200"></div>
                            )}
                        </div>
                    )}

                    <div className="flex-1 pl-4">
                        <div className="font-medium truncate" title={item.product.name}>{item.product.name}</div>
                        {item.product.type === 'book' && item.product.book?.author && (
                            <div className="text-xs text-gray-500 truncate">{item.product.book.author}</div>
                        )}
                    </div>

                    <div className={isPanelOpen ? "w-32 text-center" : "w-40 text-center"}>
                        <Tag color="blue" className="m-0">{item.displayShelf.name}</Tag>
                    </div>

                    <div className="w-20 text-center font-bold">{item.quantity}</div>

                    {!isPanelOpen && (
                        <div className="w-28 text-center">
                            {item.status === 'active' ? (
                                <Tag color="success" className="m-0">Đang trưng bày</Tag>
                            ) : (
                                <Tag color="default" className="m-0">Ẩn</Tag>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {data.length === 0 && (
                <div className="p-10 text-center text-gray-400">Không tìm thấy sản phẩm trưng bày nào</div>
            )}
        </div>
    );
};
