import React from "react";
import { Tag } from "antd";
import { DisplayProduct } from "../types";
import { formatCurrency } from "@/utils";

interface DisplayProductDetailPanelProps {
    selectedItem: DisplayProduct | null;
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

export const DisplayProductDetailPanel: React.FC<DisplayProductDetailPanelProps> = ({ selectedItem }) => {
    if (!selectedItem) return null;

    const { product, displayShelf, quantity, status } = selectedItem;

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-[#102e3c] text-center">Chi Tiết Sản Phẩm Trưng Bày</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {/* Product Image */}
                <div className="w-full flex justify-center mb-6">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-32 h-32 object-cover rounded-lg border-2 border-[#1a998f]/20 shadow-md"
                        />
                    ) : (
                        <div className="w-32 h-32 bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    {/* Product Info */}
                    <InfoRow label="Mã SKU" value={product.sku} />
                    <InfoRow label="Tên Sản Phẩm" value={<span className="text-teal-700 font-bold">{product.name}</span>} />
                    <InfoRow label="Giá Bán" value={formatCurrency(product.price)} />
                    <InfoRow 
                        label="Loại" 
                        value={
                            <Tag color={product.type === 'book' ? 'purple' : 'cyan'}>
                                {product.type === 'book' ? 'Sách' : 'Văn phòng phẩm'}
                            </Tag>
                        } 
                    />

                    {/* Book specific info */}
                    {product.type === 'book' && product.book?.author && (
                        <InfoRow label="Tác Giả" value={product.book.author} />
                    )}

                    <div className="my-4 border-t border-dashed border-gray-300"></div>
                    <h4 className="text-[#1a998f] font-bold mb-2">Thông tin trưng bày</h4>

                    {/* Display Info */}
                    <InfoRow label="Vị Trí Kệ" value={<Tag color="blue">{displayShelf.name}</Tag>} />
                    <InfoRow label="Số Lượng Trưng Bày" value={<span className="font-bold text-lg">{quantity}</span>} />
                    <InfoRow 
                        label="Trạng Thái" 
                        value={
                            status === 'active' 
                                ? <Tag color="success">Đang trưng bày</Tag>
                                : <Tag color="default">Ẩn</Tag>
                        } 
                    />

                    <div className="my-4 border-t border-dashed border-gray-300"></div>
                    <h4 className="text-[#1a998f] font-bold mb-2">Thông tin kệ</h4>

                    {/* Shelf Info */}
                    <InfoRow label="Mô Tả Kệ" value={displayShelf.description || "Không có mô tả"} />
                    <InfoRow 
                        label="Trạng Thái Kệ" 
                        value={
                            displayShelf.isActive 
                                ? <Tag color="green">Hoạt động</Tag>
                                : <Tag color="red">Không hoạt động</Tag>
                        } 
                    />

                    <div className="my-4 border-t border-dashed border-gray-300"></div>

                    {/* Product Status */}
                    <InfoRow 
                        label="Trạng Thái SP" 
                        value={
                            product.isActive 
                                ? <Tag color="green">Đang bán</Tag>
                                : <Tag color="red">Ngừng bán</Tag>
                        } 
                    />
                </div>
                <div className="h-4"></div>
            </div>
        </div>
    );
};
