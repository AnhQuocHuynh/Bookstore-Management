import React from "react";
import { Tag } from "antd";
import { SupplierTableRow } from "../types";

interface SupplierDetailPanelProps {
  selectedItem: SupplierTableRow | null;
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

export const SupplierDetailPanel: React.FC<SupplierDetailPanelProps> = ({
  selectedItem,
}) => {
  if (!selectedItem) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-[#102e3c] text-center">Chi Tiết Nhà Cung Cấp</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

        {/* Basic Info */}
        <div className="space-y-1">
          <InfoRow label="Mã NCC" value={selectedItem.supplierCode} />
          <InfoRow label="Tên nhà cung cấp" value={<span className="text-teal-700 font-bold">{selectedItem.name}</span>} />

          <InfoRow
            label="Trạng thái"
            value={
              selectedItem.status === 'active' ? (
                <Tag color="success">Hoạt động</Tag>
              ) : (
                <Tag color="error">Ngừng hoạt động</Tag>
              )
            }
          />

          <div className="my-4 border-t border-dashed border-gray-300"></div>
          <h4 className="text-[#1a998f] font-bold mb-2">Thông tin liên hệ</h4>

          <InfoRow label="Người liên hệ" value={selectedItem.contactPerson} />
          <InfoRow label="Số điện thoại" value={selectedItem.phoneNumber} />
          <InfoRow label="Email" value={selectedItem.email} />

          <div className="my-4 border-t border-dashed border-gray-300"></div>
          <h4 className="text-[#1a998f] font-bold mb-2">Thông tin pháp lý & Khác</h4>

          <InfoRow label="Mã số thuế" value={selectedItem.taxCode} />
          <InfoRow label="Địa chỉ" value={selectedItem.address} />

          {selectedItem.note && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-gray-500 text-sm block mb-2 font-semibold">Ghi chú:</span>
              <p className="text-sm text-[#102e3c] bg-gray-50 p-3 rounded-md leading-relaxed whitespace-pre-wrap">
                {selectedItem.note}
              </p>
            </div>
          )}
        </div>

        <div className="h-4"></div>
      </div>
    </div>
  );
};