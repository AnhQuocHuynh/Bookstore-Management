import React from "react";
import { Spin } from "antd";
import { InventoryTableRow } from "../types"; // Đổi từ InventoryItem sang InventoryTableRow
import { formatCurrency } from "@/utils";

interface InventoryTableProps {
  data: InventoryTableRow[]; // Dùng type phẳng cho Table
  loading: boolean;
  selectedItem: InventoryTableRow | null;
  onRowClick: (item: InventoryTableRow) => void;
  isPanelOpen: boolean;
}

export const TableHeader: React.FC<{ isPanelOpen: boolean }> = ({ isPanelOpen }) => {
  return (
    <div className="h-12 bg-[#1a998f] rounded-t-[20px] flex items-center px-3 w-full text-white font-bold text-sm">
      <div className="w-12 text-center">STT</div>
      <div className="w-24 text-center">Mã SP</div>
      {!isPanelOpen && <div className="w-20 text-center">Hình ảnh</div>}
      <div className="flex-1 pl-4">Tên Sản Phẩm</div>
      {!isPanelOpen && <div className="w-28 text-right">Giá nhập</div>}
      <div className="w-28 text-right">Giá Bán</div>
      {!isPanelOpen && <div className="w-28 text-right">Lợi nhuận</div>}
      <div className="w-20 text-center">Tồn Kho</div>
    </div>
  );
};

export const InventoryTable: React.FC<InventoryTableProps> = ({
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
          key={item.key}
          onClick={() => onRowClick(item)}
          className={`
            flex items-center px-3 h-14 border-b border-gray-100 cursor-pointer transition-colors text-sm text-[#102e3c]
            ${selectedItem?.key === item.key ? "bg-[#1a998f]/20 border-l-4 border-l-[#1a998f] pl-[8px]" : "hover:bg-gray-50"}
          `}
        >
          <div className="w-12 text-center font-medium text-gray-500">{index + 1}</div>
          <div className="w-24 text-center font-semibold text-teal-700 truncate" title={item.sku}>{item.sku}</div>
          {!isPanelOpen && (
            <div className="w-20 flex justify-center">
              {item.image ? (
                <img src={item.image} alt="" className="w-8 h-8 object-cover rounded border" />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              )}
            </div>
          )}
          <div className="flex-1 pl-4 font-medium truncate" title={item.name}>{item.name}</div>
          {!isPanelOpen && <div className="w-28 text-right text-gray-500">{formatCurrency(item.purchasePrice)}</div>}
          <div className="w-28 text-right font-semibold">{formatCurrency(item.sellingPrice)}</div>
          {!isPanelOpen && <div className="w-28 text-right text-green-600">{formatCurrency(item.profit)}</div>}
          <div className={`w-20 text-center font-bold ${item.stock <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
            {item.stock}
          </div>
        </div>
      ))}

      {data.length === 0 && (
        <div className="p-10 text-center text-gray-400">Không tìm thấy sản phẩm nào</div>
      )}
    </div>
  );
};