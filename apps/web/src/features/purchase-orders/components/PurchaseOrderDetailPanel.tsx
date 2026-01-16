import React from "react";
import { Spin } from "antd";
import { formatCurrency, formatDateTime } from "@/utils";
import { usePurchaseOrderDetail } from "../hooks/usePurchaseOrder";

interface PurchaseOrderDetailPanelProps {
  orderId: string | null;
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

export const PurchaseOrderDetailPanel: React.FC<PurchaseOrderDetailPanelProps> = ({
  orderId,
}) => {
  const { data: order, isLoading } = usePurchaseOrderDetail(orderId);

  if (!orderId) return null;

  if (isLoading || !order) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-[#102e3c] text-center">Chi Tiết Phiếu Nhập</h3>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        
        {/* Total Amount Card */}
        <div className="mb-6 bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200">
          <div className="text-center">
            <div className="text-xs text-teal-700 uppercase font-bold mb-1">Tổng giá trị</div>
            <div className="text-2xl font-extrabold text-teal-700">{formatCurrency(order.totalAmount)}</div>
          </div>
        </div>

        {/* General Info */}
        <div className="space-y-1">
          <h4 className="text-[#1a998f] font-bold mb-2">Thông tin chung</h4>
          <InfoRow label="Mã đơn" value={<span className="font-mono text-xs">{order.id}</span>} />
          <InfoRow label="Ngày tạo" value={formatDateTime(order.createdAt)} />
          <InfoRow 
            label="Ngày nhập" 
            value={order.purchaseDate ? formatDateTime(order.purchaseDate) : formatDateTime(order.createdAt)} 
          />
          <InfoRow label="Nhân viên tạo" value={<span className="font-semibold">{order.employee?.fullName}</span>} />
          {order.note && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-gray-500 text-sm block mb-2 font-semibold">Ghi chú:</span>
              <p className="text-sm text-[#102e3c] bg-gray-50 p-3 rounded-md leading-relaxed whitespace-pre-wrap italic">
                {order.note}
              </p>
            </div>
          )}
        </div>

        {/* Supplier Info */}
        <div className="mt-6 space-y-1">
          <div className="my-4 border-t border-dashed border-gray-300"></div>
          <h4 className="text-[#1a998f] font-bold mb-2">Thông tin nhà cung cấp</h4>
          <InfoRow label="Tên NCC" value={<span className="font-bold text-teal-700">{order.supplier?.name}</span>} />
          <InfoRow label="Số điện thoại" value={order.supplier?.phoneNumber} />
          <InfoRow label="Email" value={order.supplier?.email} />
          <InfoRow label="Địa chỉ" value={order.supplier?.address} />
        </div>

        {/* Products List */}
        <div className="mt-6">
          <div className="my-4 border-t border-dashed border-gray-300"></div>
          <h4 className="text-[#1a998f] font-bold mb-3">Danh sách sản phẩm</h4>
          <div className="space-y-3">
            {order.details.map((detail, index) => (
              <div 
                key={detail.id} 
                className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors"
              >
                <div className="flex gap-3">
                  {/* Product Image */}
                  {detail.product.imageUrl && (
                    <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <img 
                        src={detail.product.imageUrl} 
                        alt={detail.product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#102e3c] mb-1 truncate">{detail.product.name}</div>
                    <div className="text-xs text-gray-500 font-mono mb-2">{detail.product.sku}</div>
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-gray-500">SL: </span>
                        <span className="font-semibold">{detail.quantity}</span>
                        <span className="text-gray-400 mx-1">×</span>
                        <span className="text-teal-600">{formatCurrency(detail.unitPrice)}</span>
                      </div>
                      <div className="font-bold text-teal-700">
                        {formatCurrency(detail.subTotal || detail.quantity * detail.unitPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Padding bottom */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};
