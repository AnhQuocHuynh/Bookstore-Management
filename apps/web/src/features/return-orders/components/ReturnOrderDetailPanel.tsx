import React from "react";
import { Spin, Button, Modal } from "antd";
import { formatCurrency, formatDateTime } from "@/utils";
import { useReturnOrderDetail, useApproveReturnOrder, useRejectReturnOrder, useRecalculateRefund, useDeleteReturnOrder } from "../hooks/useReturnOrder";

interface ReturnOrderDetailPanelProps {
  orderId: string | null;
  onDeleteSuccess?: () => void;
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "text-amber-600 bg-amber-50";
    case "approved":
      return "text-green-600 bg-green-50";
    case "rejected":
      return "text-red-600 bg-red-50";
    case "completed":
      return "text-blue-600 bg-blue-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export const ReturnOrderDetailPanel: React.FC<ReturnOrderDetailPanelProps> = ({
  orderId,
  onDeleteSuccess,
}) => {
  const { data: orderData, isLoading } = useReturnOrderDetail(orderId);
  const order = orderData;
  
  const approveMutation = useApproveReturnOrder();
  const rejectMutation = useRejectReturnOrder();
  const recalculateMutation = useRecalculateRefund();
  const deleteMutation = useDeleteReturnOrder();

  if (!orderId) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">Không tìm thấy dữ liệu đơn trả/đổi</div>
      </div>
    );
  }

  const handleApprove = () => {
    Modal.confirm({
      title: "Xác nhận duyệt",
      content: "Bạn có chắc chắn muốn duyệt đơn trả/đổi hàng này?",
      okText: "Duyệt",
      okType: "primary",
      cancelText: "Hủy",
      onOk: () => {
        approveMutation.mutate(orderId);
      },
    });
  };

  const handleReject = () => {
    Modal.confirm({
      title: "Xác nhận từ chối",
      content: "Bạn có chắc chắn muốn từ chối đơn trả/đổi hàng này?",
      okText: "Từ chối",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        rejectMutation.mutate(orderId);
      },
    });
  };

  const handleRecalculate = () => {
    recalculateMutation.mutate(orderId);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa đơn trả/đổi hàng này? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        deleteMutation.mutate(orderId, {
          onSuccess: () => {
            onDeleteSuccess?.();
          },
        });
      },
    });
  };

  const canApproveOrReject = order.status === "pending";
  const isPending = order.status === "pending";

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-[#102e3c] text-center">Chi Tiết Đơn Trả/Đổi</h3>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        
        {/* Total Refund Card */}
        <div className="mb-6 bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200">
          <div className="text-center">
            <div className="text-xs text-teal-700 uppercase font-bold mb-1">Tổng tiền hoàn</div>
            <div className="text-2xl font-extrabold text-teal-700">
              {formatCurrency(order.totalRefundAmount)}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
        </div>

        {/* General Info */}
        <div className="space-y-1">
          <h4 className="text-[#1a998f] font-bold mb-2">Thông tin chung</h4>
          <InfoRow 
            label="Mã đơn" 
            value={<span className="font-mono text-xs">{order.orderNumber || order.id.slice(0, 8)}</span>} 
          />
          <InfoRow label="Ngày tạo" value={formatDateTime(order.createdAt)} />
          <InfoRow label="Khách hàng" value={<span className="font-semibold">{order.customerName}</span>} />
          {order.note && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-gray-500 text-sm block mb-2 font-semibold">Ghi chú:</span>
              <p className="text-sm text-[#102e3c] bg-gray-50 p-3 rounded-md leading-relaxed whitespace-pre-wrap italic">
                {order.note}
              </p>
            </div>
          )}
        </div>

        {/* Products List */}
        <div className="mt-6">
          <div className="my-4 border-t border-dashed border-gray-300"></div>
          <h4 className="text-[#1a998f] font-bold mb-3">Danh sách sản phẩm trả/đổi</h4>
          <div className="space-y-3">
            {order.details && order.details.length > 0 ? (
              order.details.map((detail: any) => (
                <div 
                  key={detail.id} 
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors"
                >
                  <div className="flex gap-3">
                    {/* Detail Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#102e3c] mb-1 truncate">{detail.productName}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        <span className="mr-2">Loại: {detail.detailType === "exchange" ? "Đổi hàng" : "Hoàn tiền"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="text-gray-500">SL: </span>
                          <span className="font-semibold">{detail.quantity}</span>
                          <span className="text-gray-400 mx-1">×</span>
                          <span className="text-teal-600">{formatCurrency(detail.unitPrice)}</span>
                        </div>
                        <div className="font-bold text-teal-700">
                          {formatCurrency(detail.quantity * detail.unitPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">Không có chi tiết trả/đổi</div>
            )}
          </div>
        </div>

        {/* Padding bottom */}
        <div className="h-4"></div>
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        {canApproveOrReject && (
          <div className="flex gap-2">
            <Button
              type="primary"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              loading={approveMutation.isPending}
              disabled={!isPending}
              title={!isPending ? "Chỉ có thể duyệt đơn ở trạng thái chờ duyệt" : ""}
            >
              Duyệt
            </Button>
            <Button
              danger
              className="flex-1"
              onClick={handleReject}
              loading={rejectMutation.isPending}
              disabled={!isPending}
              title={!isPending ? "Chỉ có thể từ chối đơn ở trạng thái chờ duyệt" : ""}
            >
              Từ chối
            </Button>
          </div>
        )}
        <Button
          block
          onClick={handleRecalculate}
          loading={recalculateMutation.isPending}
          disabled={!isPending}
          title={!isPending ? "Chỉ có thể tính lại tiền hoàn của đơn ở trạng thái chờ duyệt" : ""}
        >
          Tính lại tiền hoàn
        </Button>
        <div className="flex gap-2">
          <Button
            block
            danger
            onClick={handleDelete}
            loading={deleteMutation.isPending}
            disabled={!isPending}
            title={!isPending ? "Chỉ có thể xóa đơn ở trạng thái chờ duyệt" : ""}
          >
            Xóa
          </Button>
        </div>
      </div>
    </div>
  );
};
