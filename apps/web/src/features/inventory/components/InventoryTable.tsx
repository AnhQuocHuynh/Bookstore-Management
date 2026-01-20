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
    <div className="h-12 bg-[#1a998f] rounded-t-[20px] flex items-center px-2 w-full text-white font-bold text-xs gap-1">
      <div className="w-8 text-center flex-shrink-0">STT</div>
      <div className={isPanelOpen ? "w-16 text-center flex-shrink-0" : "w-20 text-center flex-shrink-0"}>Mã SP</div>
      {!isPanelOpen && <div className="w-14 text-center flex-shrink-0">Ảnh</div>}
      <div className={isPanelOpen ? "flex-1 min-w-[80px]" : "flex-1"}>Tên</div>
      <div className={isPanelOpen ? "w-16 text-right flex-shrink-0" : "w-20 text-right flex-shrink-0"}>Giá nhập</div>
      <div className={isPanelOpen ? "w-16 text-right flex-shrink-0" : "w-20 text-right flex-shrink-0"}>Giá Bán</div>
      {!isPanelOpen && <div className="w-20 text-right flex-shrink-0">Lợi nhuận</div>}
      <div className="w-12 text-center flex-shrink-0">Kho</div>
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
            flex items-center px-2 h-12 border-b border-gray-100 cursor-pointer transition-colors text-xs gap-1 text-[#102e3c]
            ${selectedItem?.key === item.key ? "bg-[#1a998f]/20 border-l-4 border-l-[#1a998f] pl-[6px]" : "hover:bg-gray-50"}
          `}
        >
          <div className="w-8 text-center font-medium text-gray-500 flex-shrink-0">{index + 1}</div>
          <div className={isPanelOpen ? "w-16 text-center font-semibold text-teal-700 truncate flex-shrink-0" : "w-20 text-center font-semibold text-teal-700 truncate flex-shrink-0"} title={item.sku}>{item.sku}</div>
          {!isPanelOpen && (
            <div className="w-14 flex justify-center flex-shrink-0">
              {item.image ? (
                <img src={item.image} alt="" className="w-6 h-6 object-cover rounded border" />
              ) : (
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              )}
            </div>
          )}
          <div className={isPanelOpen ? "flex-1 min-w-[80px]" : "flex-1"}>
            <div className="font-medium truncate text-xs" title={item.name}>{item.name}</div>
          </div>
          <div className={isPanelOpen ? "w-16 text-right text-gray-500 flex-shrink-0" : "w-20 text-right text-gray-500 flex-shrink-0"}>{formatCurrency(item.purchasePrice)}</div>
          <div className={isPanelOpen ? "w-16 text-right font-semibold flex-shrink-0" : "w-20 text-right font-semibold flex-shrink-0"}>{formatCurrency(item.sellingPrice)}</div>
          {!isPanelOpen && <div className="w-20 text-right text-green-600 flex-shrink-0">{formatCurrency(item.profit)}</div>}
          <div className={`w-12 text-center font-bold flex-shrink-0 ${item.stock <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
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