import React from "react";
import { Spin } from "antd";
import { InventoryItem } from "../types";

interface InventoryTableProps {
  data: InventoryItem[];
  loading: boolean;
  selectedItem: InventoryItem | null;
  onRowClick: (item: InventoryItem) => void;
}

const tableHeaders = [
  { label: "STT", width: "flex-[0.5]" },
  { label: "Mã Sản Phẩm", width: "flex-[1]" },
  { label: "Hình Ảnh", width: "flex-[0.8]" },
  { label: "Tên Sản Phẩm", width: "flex-[1.5]" },
  { label: "Giá nhập", width: "flex-[1]" },
  { label: "Giá Bán", width: "flex-[1]" },
  { label: "Lợi nhuận", width: "flex-[1]" },
  { label: "Tồn Kho", width: "flex-[0.8]" },
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

export const InventoryTable: React.FC<InventoryTableProps> = ({
  data,
  loading,
  selectedItem,
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
        {data.map((item, index) => (
          <tr
            key={item.key}
            onClick={() => onRowClick(item)}
            className={`h-12 cursor-pointer hover:bg-[#1a998fb3] transition-colors ${
              selectedItem?.key === item.key
                ? "bg-[#1a998f80]"
                : index % 2 === 1
                  ? "bg-[#d4e5e480]"
                  : "bg-white"
            }`}
          >
            <td colSpan={8}>
              <div className="flex items-center px-3 py-0 w-full">
                <div className="flex-[0.5] flex items-center justify-center h-[34px] font-normal text-black text-[14.3px] text-center tracking-[0] leading-[normal]">
                  {index + 1}
                </div>
                <div className="flex-[1] flex items-center justify-center h-[34px] font-normal text-black text-[14.3px] text-center tracking-[0] leading-[normal]">
                  {item.sku}
                </div>
                <div className="flex-[0.8] flex items-center justify-center h-[34px]">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-[40px] h-[40px] object-cover rounded"
                    />
                  ) : (
                    <div className="w-[40px] h-[40px] bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-[1.5] flex items-center justify-start h-[34px] font-normal text-black text-[14.3px] tracking-[0] leading-[normal]">
                  {item.name}
                </div>
                <div className="flex-[1] h-[34px] text-[14.3px] text-center flex items-center justify-center font-normal text-black tracking-[0] leading-[normal]">
                  {item.purchasePrice.toLocaleString('vi-VN')}₫
                </div>
                <div className="flex-[1] h-[34px] text-[14.3px] text-center flex items-center justify-center font-normal text-black tracking-[0] leading-[normal]">
                  {item.sellingPrice.toLocaleString('vi-VN')}₫
                </div>
                <div className="flex-[1] h-[34px] text-[14.3px] text-center flex items-center justify-center font-normal text-green-600 tracking-[0] leading-[normal]">
                  {item.profit.toLocaleString('vi-VN')}₫
                </div>
                <div className="flex-[0.8] h-[34px] text-[14.3px] text-center flex items-center justify-center font-normal text-black tracking-[0] leading-[normal]">
                  {item.stock}
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
