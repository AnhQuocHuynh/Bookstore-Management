import React from "react";
import { DetailRow } from "./DetailRow";

interface Supplier {
  key: number;
  id?: string;
  supplierId: string;
  name: string;
  email: string;
  phoneNumber: string;
  contactPerson: string;
  status: string;
  address?: string;
  taxCode?: string;
  note?: string;
  createdDate?: string;
  updateDate?: string;
}

interface SupplierDetailPanelProps {
  selectedSupplier: Supplier | null;
}

export const SupplierDetailPanel: React.FC<SupplierDetailPanelProps> = ({
  selectedSupplier,
}) => (
  <aside
    className={`absolute top-3 w-[431px] h-[calc(100%_-_24px)] flex justify-center bg-white rounded-[20px] border-[3px] border-solid border-[#1a998f] overflow-y-auto transition-all duration-300 ${
      selectedSupplier
        ? "right-3 opacity-100"
        : "-right-[450px] opacity-0 pointer-events-none"
    }`}
    aria-label="Supplier details"
  >
    {selectedSupplier && (
      <div className="flex mt-[27px] w-[383px] relative flex-col items-start">
        <DetailRow label="Tên NCC" value={selectedSupplier.name} />
        <DetailRow label="Email" value={selectedSupplier.email} />
        <DetailRow
          label="Số điện thoại"
          value={selectedSupplier.phoneNumber}
        />
        <DetailRow
          label="Địa chỉ"
          value={selectedSupplier.address}
          isMultiline
        />
        <DetailRow label="Trạng thái" value={selectedSupplier.status} />
        <DetailRow label="Mã số thuế" value={selectedSupplier.taxCode} />
        <DetailRow
          label="Người liên lạc"
          value={selectedSupplier.contactPerson}
        />
        <DetailRow label="Ghi chú" value={selectedSupplier.note} />
      </div>
    )}
  </aside>
);
