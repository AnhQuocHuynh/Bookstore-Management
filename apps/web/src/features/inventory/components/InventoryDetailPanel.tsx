import React from "react";
import { InventoryTableRow } from "../types"; // Đổi import
import { formatCurrency } from "@/utils";

interface InventoryDetailPanelProps {
  selectedItem: InventoryTableRow | null; // Đổi type
}

interface InfoRowProps {
  label: string;
  value?: string | number;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-center w-full py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-500 text-sm">{label}</span>
    <strong className="text-[#102e3c] text-sm text-right max-w-[60%] break-words">{value ?? "--"}</strong>
  </div>
);

export const InventoryDetailPanel: React.FC<InventoryDetailPanelProps> = ({
  selectedItem,
}) => {
  if (!selectedItem) return null;

  return (
    <div className="p-6 flex flex-col h-full">
      <h3 className="text-xl font-bold text-[#102e3c] mb-4 text-center border-b pb-2">Chi Tiết Sản Phẩm</h3>
      <div className="w-full flex justify-center mb-6">
        <div className="w-40 h-40 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center">
          {selectedItem.image ? (
            <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-xs">No Image</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-1">
        <InfoRow label="Mã SKU" value={selectedItem.sku} />
        <InfoRow label="Tên sản phẩm" value={selectedItem.name} />
        <InfoRow label="Danh mục" value={selectedItem.category} />
        <InfoRow label="Nhà cung cấp" value={selectedItem.supplier} />
        <div className="my-4 border-t border-dashed border-gray-300"></div>
        <InfoRow label="Giá nhập" value={formatCurrency(selectedItem.purchasePrice)} />
        <InfoRow label="Giá bán" value={formatCurrency(selectedItem.sellingPrice)} />
        <InfoRow label="Lợi nhuận" value={formatCurrency(selectedItem.profit)} />
        <InfoRow label="Tồn kho" value={selectedItem.stock} />

        {selectedItem.author && (
          <>
            <div className="my-4 border-t border-dashed border-gray-300"></div>
            <InfoRow label="Tác giả" value={selectedItem.author} />
            <InfoRow label="Nhà xuất bản" value={selectedItem.publisher} />
            <InfoRow label="Năm xuất bản" value={selectedItem.releaseYear} />
          </>
        )}

        {selectedItem.description && (
          <div className="mt-4 pt-2 border-t border-gray-200">
            <span className="text-gray-500 text-sm block mb-1">Mô tả:</span>
            <p className="text-sm text-[#102e3c] bg-gray-50 p-2 rounded-md">{selectedItem.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};