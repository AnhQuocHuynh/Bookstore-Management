import React from "react";
import { InventoryItem } from "../types";

interface InventoryDetailPanelProps {
  selectedItem: InventoryItem | null;
}

interface InfoRowProps {
  label: string;
  value?: string | number;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-center w-full py-2 border-b border-gray-200">
    <span className="text-gray-600 text-base">{label}</span>
    <strong className="text-black text-base">{value ?? "--"}</strong>
  </div>
);

export const InventoryDetailPanel: React.FC<InventoryDetailPanelProps> = ({
  selectedItem,
}) => (
  <aside
    className={`absolute top-3 w-[431px] h-[calc(100%_-_24px)] bg-white rounded-[20px] border-[3px] border-solid border-[#1a998f] overflow-y-auto transition-all duration-300 ${
      selectedItem
        ? "right-3 opacity-100"
        : "-right-[450px] opacity-0 pointer-events-none"
    }`}
    aria-label="Inventory item details"
  >
    {selectedItem && (
      <div className="flex flex-col items-center p-6">
        {/* Image Wrapper */}
        <div className="w-full mb-6 flex justify-center">
          <div className="w-[400px] h-[400px] bg-gray-100 rounded-lg overflow-hidden border-2 border-[#1a998f] flex items-center justify-center">
            {selectedItem.image ? (
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm">No Image</span>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="w-full space-y-0">
          <InfoRow label="Mã SP:" value={selectedItem.sku} />
          <InfoRow label="Tên SP:" value={selectedItem.name} />
          <InfoRow label="Danh Mục:" value={selectedItem.category} />
          <InfoRow 
            label="Giá Nhập:" 
            value={`${selectedItem.purchasePrice.toLocaleString('vi-VN')}₫`} 
          />
          <InfoRow 
            label="Giá Bán:" 
            value={`${selectedItem.sellingPrice.toLocaleString('vi-VN')}₫`} 
          />
          <InfoRow 
            label="Lợi nhuận:" 
            value={`${selectedItem.profit.toLocaleString('vi-VN')}₫`} 
          />
          <InfoRow label="Tồn kho:" value={selectedItem.stock} />
          <InfoRow label="Nhà Cung Cấp:" value={selectedItem.supplier} />
          
          {/* Book-specific fields */}
          {selectedItem.category === "Sách" && (
            <>
              <InfoRow label="Tác Giả:" value={selectedItem.author} />
              <InfoRow label="Nhà Xuất Bản:" value={selectedItem.publisher} />
              <InfoRow label="Năm Xuất:" value={selectedItem.releaseYear} />
              <InfoRow label="Phiên Bản Phát Hành:" value={selectedItem.releaseVersion} />
              <InfoRow label="Ngôn Ngữ:" value={selectedItem.language} />
            </>
          )}
          
          {/* Description Section */}
          {selectedItem.description && (
            <div className="pt-4 mt-4 border-t-2 border-gray-300">
              <div className="text-gray-600 text-base mb-2">Mô Tả:</div>
              <p className="text-black text-sm leading-relaxed">
                {selectedItem.description}
              </p>
            </div>
          )}
        </div>
      </div>
    )}
  </aside>
);
