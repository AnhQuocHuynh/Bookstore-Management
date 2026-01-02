import React from "react";
import { Spin } from "antd";

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

interface SupplierTableProps {
  data: Supplier[];
  loading: boolean;
  selectedSupplier: Supplier | null;
  onRowClick: (supplier: Supplier) => void;
}

const tableHeaders = [
  { label: "STT", width: "flex-[0.5]" },
  { label: "Mã NCC", width: "flex-[1]" },
  { label: "Tên Nhà cung cấp", width: "flex-[1.5]" },
  { label: "Email", width: "flex-[2]" },
  { label: "Số điện thoại", width: "flex-[1.2]" },
  { label: "Người liên lạc", width: "flex-[1.2]" },
  { label: "Trạng thái", width: "flex-[1]" },
];

export const TableHeader: React.FC = () => {
  return (
    <div className="h-12 bg-[#1a998f] rounded-t-[20px] flex items-center px-3 py-0 w-full">
      {tableHeaders.map((header, index) => (
        <div
          key={index}
          className={`${header.width} flex items-center justify-center h-[34px] font-bold text-white text-[14.3px] text-center tracking-[0] leading-[normal]`}
        >
          {header.label}
        </div>
      ))}
    </div>
  );
};

export const SupplierTable: React.FC<SupplierTableProps> = ({
  data,
  loading,
  selectedSupplier,
  onRowClick,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <table className="w-full">
      <tbody>
        {data.map((supplier, index) => (
          <tr
            key={supplier.key}
            onClick={() => onRowClick(supplier)}
            className={`h-12 cursor-pointer hover:bg-[#1a998fb3] transition-colors ${
              selectedSupplier?.key === supplier.key
                ? "bg-[#1a998f80]"
                : index % 2 === 1
                  ? "bg-[#d4e5e480]"
                  : "bg-white"
            }`}
          >
            <td colSpan={7}>
              <div className="flex items-center px-3 py-0 w-full">
                <div className="flex-[0.5] flex items-center justify-center h-[34px] font-normal text-black text-[14.3px] text-center tracking-[0] leading-[normal]">
                  {index + 1}
                </div>
                <div className="flex-[1] flex items-center justify-center h-[34px] font-normal text-black text-[14.3px] text-center tracking-[0] leading-[normal]">
                  {supplier.supplierId}
                </div>
                <div className="flex-[1.5] flex items-center justify-start h-[34px] font-normal text-black text-[14.3px] tracking-[0] leading-[normal]">
                  {supplier.name}
                </div>
                <div className="flex-[2] h-[34px] text-[14.3px] text-center flex items-center justify-center font-normal text-black tracking-[0] leading-[normal]">
                  {supplier.email}
                </div>
                <div className="flex-[1.2] h-[34px] text-[14.3px] text-center flex items-center justify-center font-normal text-black tracking-[0] leading-[normal]">
                  {supplier.phoneNumber}
                </div>
                <div className="flex-[1.2] h-[34px] text-[14.3px] text-center flex items-center justify-center font-normal text-black tracking-[0] leading-[normal]">
                  {supplier.contactPerson}
                </div>
                <div className="flex-[1] flex items-center justify-center h-[34px] font-normal text-black text-[14.3px] text-center tracking-[0] leading-[normal]">
                  {supplier.status}
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
