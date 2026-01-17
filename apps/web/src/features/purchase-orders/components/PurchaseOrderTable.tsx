import React from "react";
import { Spin } from "antd";
import { formatCurrency, formatDateTime } from "@/utils";
import { PurchaseOrderListItem } from "../types";

interface PurchaseOrderTableProps {
  data: PurchaseOrderListItem[];
  loading: boolean;
  selectedItem: PurchaseOrderListItem | null;
  onRowClick: (item: PurchaseOrderListItem) => void;
  isPanelOpen: boolean;
}

export const TableHeader: React.FC<{ isPanelOpen: boolean }> = ({ isPanelOpen }) => {
  return (
    <div className="h-12 bg-[#1a998f] rounded-t-[20px] flex items-center px-2 w-full text-white font-bold text-xs gap-1">
      <div className="w-8 text-center flex-shrink-0">STT</div>
      <div className={isPanelOpen ? "w-20 text-center flex-shrink-0" : "w-24 text-center flex-shrink-0"}>Mã đơn</div>
      <div className={isPanelOpen ? "w-28 flex-shrink-0" : "w-32 flex-shrink-0"}>Ngày tạo</div>
      <div className={isPanelOpen ? "flex-1 min-w-[100px]" : "flex-1"}>Nhân viên tạo</div>
      {!isPanelOpen && <div className="flex-1 min-w-[120px]">Ghi chú</div>}
      <div className={isPanelOpen ? "w-24 text-right flex-shrink-0" : "w-28 text-right flex-shrink-0"}>Tổng tiền</div>
    </div>
  );
};

export const PurchaseOrderTable: React.FC<PurchaseOrderTableProps> = ({
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
            flex items-center px-2 h-12 border-b border-gray-100 cursor-pointer transition-colors text-xs gap-1 text-[#102e3c]
            ${selectedItem?.id === item.id ? "bg-[#1a998f]/20 border-l-4 border-l-[#1a998f] pl-[6px]" : "hover:bg-gray-50"}
          `}
        >
          <div className="w-8 text-center flex-shrink-0 font-semibold text-gray-600">{index + 1}</div>
          <div className={isPanelOpen ? "w-20 text-center flex-shrink-0 font-mono" : "w-24 text-center flex-shrink-0 font-mono"}>
            {item.id.slice(0, 8)}...
          </div>
          <div className={isPanelOpen ? "w-28 flex-shrink-0" : "w-32 flex-shrink-0"}>
            {formatDateTime(item.createdAt)}
          </div>
          <div className={isPanelOpen ? "flex-1 min-w-[100px] truncate font-medium" : "flex-1 truncate font-medium"}>
            {item.employee.fullName}
          </div>
          {!isPanelOpen && (
            <div className="flex-1 min-w-[120px] truncate text-gray-500 italic">
              {item.note || "--"}
            </div>
          )}
          <div className={isPanelOpen ? "w-24 text-right flex-shrink-0 font-bold text-teal-700" : "w-28 text-right flex-shrink-0 font-bold text-teal-700"}>
            {formatCurrency(item.totalAmount)}
          </div>
        </div>
      ))}
    </div>
  );
};
