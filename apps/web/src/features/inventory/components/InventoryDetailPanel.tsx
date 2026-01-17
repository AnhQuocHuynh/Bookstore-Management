import React from "react";
import { Tag } from "antd";
import { InventoryTableRow } from "../types";
import { formatCurrency } from "@/utils";

interface InventoryDetailPanelProps {
  selectedItem: InventoryTableRow | null;
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

export const InventoryDetailPanel: React.FC<InventoryDetailPanelProps> = ({
  selectedItem,
}) => {
  if (!selectedItem) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 1. Fixed Header: Tiêu đề luôn đứng yên */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-[#102e3c] text-center">Chi Tiết Sản Phẩm</h3>
      </div>

      {/* 2. Scrollable Content: Chứa cả Ảnh và Thông tin */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

        {/* --- Phần Ảnh (đã đưa vào trong vùng cuộn) --- */}
        <div className="w-full flex justify-center mb-6">
          <div className="w-48 h-48 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center shadow-sm">
            {selectedItem.image ? (
              <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-xs">No Image</span>
            )}
          </div>
        </div>

        {/* --- Phần Thông tin --- */}
        <div className="space-y-1">
          <InfoRow label="Mã SKU" value={selectedItem.sku} />
          <InfoRow label="Tên sản phẩm" value={<span className="text-teal-700 font-bold">{selectedItem.name}</span>} />
          <InfoRow label="Danh mục" value={selectedItem.category} />
          <InfoRow label="Nhà cung cấp" value={selectedItem.supplier} />
          <InfoRow 
            label="Trạng thái" 
            value={
              selectedItem.isActive ? (
                <Tag color="success">Đang bán</Tag>
              ) : (
                <Tag color="error">Ngừng bán</Tag>
              )
            }
          />

          <div className="my-4 border-t border-dashed border-gray-300"></div>
          <h4 className="text-[#1a998f] font-bold mb-2">Thông tin giá & tồn kho</h4>

          <InfoRow label="Giá nhập" value={formatCurrency(selectedItem.purchasePrice)} />
          <InfoRow label="Giá bán" value={formatCurrency(selectedItem.sellingPrice)} />
          <InfoRow label="Lợi nhuận" value={<span className="text-green-600 font-bold">{formatCurrency(selectedItem.profit)}</span>} />
          <InfoRow label="Tồn kho" value={<span className={selectedItem.stock <= 10 ? "text-red-500 font-bold" : "font-semibold"}>{selectedItem.stock}</span>} />

          {/* Book specific fields */}
          {selectedItem.category?.includes("Sách") && (
            <>
              <div className="my-4 border-t border-dashed border-gray-300"></div>
              <h4 className="text-[#1a998f] font-bold mb-2">Thông tin sách</h4>
              <InfoRow label="Tác giả" value={selectedItem.author || selectedItem.book?.author} />
              <InfoRow label="Nhà xuất bản" value={selectedItem.publisher || selectedItem.book?.publisher} />
              <InfoRow label="Năm xuất bản" value={selectedItem.releaseYear || selectedItem.book?.publicationYear} />
              <InfoRow label="Phiên bản" value={selectedItem.releaseVersion || selectedItem.book?.releaseVersion} />
              <InfoRow label="Ngôn ngữ" value={selectedItem.language || selectedItem.book?.language} />
            </>
          )}

          {selectedItem.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-gray-500 text-sm block mb-2 font-semibold">Mô tả:</span>
              <p className="text-sm text-[#102e3c] bg-gray-50 p-3 rounded-md leading-relaxed whitespace-pre-wrap">
                {selectedItem.description}
              </p>
            </div>
          )}
        </div>

        {/* Padding bottom để khi cuộn xuống hết không bị sát đáy */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};