import React from "react";
import { Tag, Spin } from "antd";
import { useShelfDetail } from "../hooks/useDisplay";

interface ShelfDetailPanelProps {
  shelfId: string | null;
}

interface InfoRowProps {
  label: string;
  value?: string | number | React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-center w-full py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-500 text-sm">{label}</span>
    <strong className="text-[#102e3c] text-sm text-right max-w-[60%] break-words">{value ?? "--"}</strong>
  </div>
);

export const ShelfDetailPanel: React.FC<ShelfDetailPanelProps> = ({ shelfId }) => {
  const { data: shelf, isLoading } = useShelfDetail(shelfId || "");

  if (!shelfId) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (!shelf) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 1. Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-[#102e3c] text-center">Chi Tiết Kệ</h3>
      </div>

      {/* 2. Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {/* --- Thông tin kệ --- */}
        <div className="space-y-1 mb-6">
          <InfoRow label="Tên kệ" value={shelf.name} />
          <InfoRow 
            label="Trạng thái" 
            value={shelf.isActive ? <Tag color="success">Hoạt động</Tag> : <Tag>Ẩn</Tag>}
          />
          
          {shelf.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-gray-500 text-sm block mb-1 font-semibold">Mô tả:</span>
              <p className="text-sm text-[#102e3c] bg-gray-50 p-3 rounded-md leading-relaxed">
                {shelf.description}
              </p>
            </div>
          )}
        </div>

        {/* --- Danh sách sản phẩm trên kệ --- */}
        <div className="mt-6">
          <div className="py-2 bg-teal-50 -mx-2 px-2 rounded mb-3">
            <p className="text-xs font-semibold text-teal-700">SẢN PHẨM TRÊN KỆ ({shelf.displayProducts?.length || 0})</p>
          </div>

          {shelf.displayProducts && shelf.displayProducts.length > 0 ? (
            <div className="space-y-3">
              {shelf.displayProducts.map((item: any) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded border border-gray-300"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-400">
                        No Img
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#102e3c] text-sm truncate">
                      {item.product.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      SKU: {item.product.sku}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">
                        Số lượng: <strong className="text-teal-700">{item.quantity}</strong>
                      </span>
                      {item.status === 'active' && (
                        <Tag color="success" className="text-[10px] py-0 leading-tight">
                          Đang trưng bày
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Chưa có sản phẩm nào trên kệ này</p>
            </div>
          )}
        </div>

        {/* Padding bottom */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};
