import React from "react";
import { Tag, Spin } from "antd";
import { SupplierTableRow } from "../types";
import { useInventory } from "@/features/inventory/hooks/useInventory";
import { formatCurrency } from "@/utils";

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
  // Fetch products from this supplier
  const { data: productsData, isLoading: productsLoading } = useInventory({
    supplierName: selectedItem?.name,
  });

  const products = Array.isArray(productsData?.data) ? productsData?.data : [];

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

          {/* Products Section */}
          <div className="my-4 border-t border-dashed border-gray-300"></div>
          <h4 className="text-[#1a998f] font-bold mb-3">Sản phẩm ({products.length})</h4>
          
          {productsLoading ? (
            <div className="flex justify-center py-4">
              <Spin size="small" />
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {products.map((product: any) => (
                <div 
                  key={product.id} 
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-teal-500 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-12 h-12 object-cover rounded border border-gray-300"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded border border-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-500">N/A</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#102e3c] text-sm truncate" title={product.name}>
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        SKU: <span className="font-medium">{product.sku}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-teal-600 font-bold">
                          {formatCurrency(product.price)}
                        </span>
                        {product.inventory && (
                          <span className="text-xs text-gray-500">
                            • Kho: <span className={product.inventory.stockQuantity <= 10 ? "text-red-500 font-bold" : "font-semibold"}>{product.inventory.stockQuantity}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <Tag color={product.isActive ? 'success' : 'default'} className="text-xs">
                      {product.isActive ? 'Đang bán' : 'Ngừng'}
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm bg-gray-50 rounded-lg">
              Chưa có sản phẩm nào từ nhà cung cấp này
            </div>
          )}
        </div>

        <div className="h-4"></div>
      </div>
    </div>
  );
};