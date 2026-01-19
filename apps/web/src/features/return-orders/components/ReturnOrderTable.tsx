import React from "react";
import { Spin, Badge } from "antd";
import { formatCurrency, formatDateTime } from "@/utils";
import { ReturnOrderListItem } from "../types";

interface ReturnOrderTableProps {
  data: ReturnOrderListItem[];
  loading: boolean;
  selectedItem: ReturnOrderListItem | null;
  onRowClick: (item: ReturnOrderListItem) => void;
  isPanelOpen: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "processing";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "completed":
      return "default";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "Chờ duyệt";
    case "approved":
      return "Đã duyệt";
    case "rejected":
      return "Từ chối";
    case "completed":
      return "Hoàn tất";
    default:
      return status;
  }
};

export const TableHeader: React.FC<{ isPanelOpen: boolean }> = ({ isPanelOpen }) => {
  return (
    <div className="h-12 bg-[#1a998f] rounded-t-[20px] flex items-center px-2 w-full text-white font-bold text-xs gap-1">
      <div className="w-8 text-center flex-shrink-0">STT</div>
      <div className={isPanelOpen ? "w-24 text-center flex-shrink-0" : "w-28 text-center flex-shrink-0"}>
        Mã đơn
      </div>
      <div className={isPanelOpen ? "w-32 flex-shrink-0" : "w-36 flex-shrink-0"}>Ngày tạo</div>
      <div className={isPanelOpen ? "flex-1 min-w-[100px]" : "flex-1 min-w-[120px]"}>Khách hàng</div>
      {!isPanelOpen && <div className="flex-1 min-w-[100px]">Trạng thái</div>}
      <div className={isPanelOpen ? "w-28 text-right flex-shrink-0" : "w-32 text-right flex-shrink-0"}>
        Tiền hoàn
      </div>
    </div>
  );
};

export const ReturnOrderTable: React.FC<ReturnOrderTableProps> = ({
  data,
  loading,
  selectedItem,
  onRowClick,
  isPanelOpen,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {data.map((item, index) => (
        <div
          key={item.id}
          onClick={() => onRowClick(item)}
          className={`
            flex items-center px-2 h-12 border-b border-gray-100 cursor-pointer transition-colors text-xs gap-1 text-[#102e3c]
            ${
              selectedItem?.id === item.id
                ? "bg-[#1a998f]/20 border-l-4 border-l-[#1a998f] pl-[6px]"
                : "hover:bg-gray-50"
            }
          `}
        >
          <div className="w-8 text-center flex-shrink-0 font-semibold text-gray-600">
            {index + 1}
          </div>
          <div className={isPanelOpen ? "w-24 text-center flex-shrink-0 font-mono" : "w-28 text-center flex-shrink-0 font-mono"}>
            {item.orderNumber || item.id.slice(0, 8)}...
          </div>
          <div className={isPanelOpen ? "w-32 flex-shrink-0" : "w-36 flex-shrink-0"}>
            {formatDateTime(item.createdAt)}
          </div>
          <div className={isPanelOpen ? "flex-1 min-w-[100px] truncate font-medium" : "flex-1 min-w-[120px] truncate font-medium"}>
            {item.customerName}
          </div>
          {!isPanelOpen && (
            <div className="flex-1 min-w-[100px] flex items-center">
              <Badge
                status={getStatusColor(item.status) as any}
                text={getStatusLabel(item.status)}
              />
            </div>
          )}
          <div className={isPanelOpen ? "w-28 text-right flex-shrink-0 font-bold text-teal-700" : "w-32 text-right flex-shrink-0 font-bold text-teal-700"}>
            {formatCurrency(item.totalRefundAmount)}
          </div>
        </div>
      ))}
    </div>
  );
};
