import React, { useState } from "react";
import { Tag, Spin, Button, Dropdown, Modal, Tooltip } from "antd";
import { MoreVertical, ArrowRightLeft, MinusCircle, Trash2, Plus } from "lucide-react";
import { useShelfDetail, useDisplayMutations } from "../hooks/useDisplay";
import { AddProductModal } from "./modals/AddProductModal";
import { MoveProductModal } from "./modals/MoveProductModal";
import { ReduceProductModal } from "./modals/ReduceProductModal";

interface ShelfDetailPanelProps {
  shelfId: string | null;
}

interface InfoRowProps {
  label: string;
  value?: string | number | React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-center w-full py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-500 text-sm">{label}</span>
    <strong className="text-[#102e3c] text-sm text-right max-w-[60%] break-words">{value ?? "--"}</strong>
  </div>
);

export const ShelfDetailPanel: React.FC<ShelfDetailPanelProps> = ({ shelfId }) => {
  const { data: shelf, isLoading } = useShelfDetail(shelfId || "");
  const { addProduct, moveProduct, reduceProduct, removeProduct } = useDisplayMutations();

  // --- State quản lý Modal ---
  const [modalType, setModalType] = useState<'add' | 'move' | 'reduce' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleRemove = (id: string) => {
    Modal.confirm({
      title: "Gỡ sản phẩm?",
      content: "Toàn bộ số lượng sẽ được trả về kho.",
      okType: 'danger',
      okText: 'Gỡ bỏ',
      cancelText: 'Hủy',
      onOk: () => removeProduct.mutate(id)
    });
  };

  if (!shelfId) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (!shelf) return null;

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* FIX: Thêm 'pr-12' vào className để tạo khoảng trống bên phải cho nút Close (X) của cha 
         Nút X ở parent là absolute right-3 (~12px) + width (~32px) => Cần né ít nhất 44px
      */}
      <div className="flex-shrink-0 p-4 pr-12 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-xl font-bold text-[#102e3c]">Chi Tiết Kệ</h3>

        {/* Nút Thêm sản phẩm: Nằm bên phải nhưng đã được padding đẩy vào trong, không bị nút X che */}
        <Tooltip title="Thêm hàng vào kệ này">
          <Button
            type="primary"
            icon={<Plus size={16} />}
            className="bg-[#1a998f] shadow-sm flex items-center justify-center"
            onClick={() => setModalType('add')}
          />
        </Tooltip>
      </div>

      {/* 2. Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {/* --- Thông tin kệ --- */}
        <div className="space-y-1 mb-6">
          <InfoRow label="Tên kệ" value={shelf.name} />
          <InfoRow
            label="Trạng thái"
            value={shelf.isActive ? <Tag color="success">Hoạt động</Tag> : <Tag>Ẩn</Tag>}
          />

          {shelf.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-gray-500 text-sm block mb-1 font-semibold">Mô tả:</span>
              <p className="text-sm text-[#102e3c] bg-gray-50 p-3 rounded-md leading-relaxed">
                {shelf.description}
              </p>
            </div>
          )}
        </div>

        {/* --- Danh sách sản phẩm trên kệ --- */}
        <div className="mt-6">
          <div className="py-2 bg-teal-50 -mx-2 px-2 rounded mb-3 flex justify-between items-center">
            <p className="text-xs font-semibold text-teal-700 uppercase">Sản phẩm trên kệ ({shelf.displayProducts?.length || 0})</p>
          </div>

          {shelf.displayProducts && shelf.displayProducts.length > 0 ? (
            <div className="space-y-3">
              {shelf.displayProducts.map((item: any) => (
                <div
                  key={item.id}
                  className="group relative flex gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-teal-500 hover:shadow-md transition-all duration-200"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded border border-gray-300"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-400">
                        No Img
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 pr-8"> {/* Thêm padding right để tránh đè nút Option */}
                    <div className="font-medium text-[#102e3c] text-sm truncate" title={item.product.name}>
                      {item.product.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      SKU: {item.product.sku}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">
                        SL: <strong className="text-teal-700">{item.quantity}</strong>
                      </span>
                      {item.status === 'active' && (
                        <Tag color="success" className="text-[10px] py-0 leading-tight m-0 h-[18px]">
                          Trưng bày
                        </Tag>
                      )}
                    </div>
                  </div>

                  {/* --- KHÔI PHỤC NÚT ACTION (3 chấm) --- */}
                  <div className="absolute top-2 right-2">
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'move',
                            label: 'Chuyển kệ',
                            icon: <ArrowRightLeft size={14} />,
                            onClick: () => { setSelectedItem(item); setModalType('move'); }
                          },
                          {
                            key: 'reduce',
                            label: 'Rút về kho',
                            icon: <MinusCircle size={14} />,
                            onClick: () => { setSelectedItem(item); setModalType('reduce'); }
                          },
                          { type: 'divider' },
                          {
                            key: 'remove',
                            label: 'Gỡ bỏ (Trả hết)',
                            icon: <Trash2 size={14} />,
                            danger: true,
                            onClick: () => handleRemove(item.id)
                          },
                        ]
                      }}
                      trigger={['click']}
                      placement="bottomRight"
                      arrow
                    >
                      <Button
                        type="text"
                        size="small"
                        className="text-gray-400 hover:text-[#102e3c] hover:bg-gray-100 flex items-center justify-center"
                        icon={<MoreVertical size={16} />}
                      />
                    </Dropdown>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 flex flex-col items-center">
              <div className="mb-2 p-3 bg-gray-100 rounded-full"><Plus size={24} className="text-gray-300" /></div>
              <p className="text-sm mb-2">Chưa có sản phẩm nào trên kệ này</p>
              <Button size="small" type="dashed" onClick={() => setModalType('add')}>Thêm ngay</Button>
            </div>
          )}
        </div>

        {/* Padding bottom */}
        <div className="h-4"></div>
      </div>

      {/* --- CÁC MODALS --- */}
      <AddProductModal
        open={modalType === 'add'}
        onClose={() => setModalType(null)}
        defaultShelfId={shelfId!}
        onSubmit={(vals) => addProduct.mutate(vals, { onSuccess: () => setModalType(null) })}
      />

      {selectedItem && (
        <>
          <MoveProductModal
            open={modalType === 'move'}
            onClose={() => { setModalType(null); setSelectedItem(null); }}
            currentShelfId={shelfId!}
            maxQuantity={selectedItem.quantity || 0}
            onSubmit={(vals) => moveProduct.mutate({ id: selectedItem.id, data: vals }, { onSuccess: () => { setModalType(null); setSelectedItem(null); } })}
          />
          <ReduceProductModal
            open={modalType === 'reduce'}
            onClose={() => { setModalType(null); setSelectedItem(null); }}
            maxQuantity={selectedItem.quantity || 0}
            onSubmit={(vals) => reduceProduct.mutate({ id: selectedItem.id, data: vals }, { onSuccess: () => { setModalType(null); setSelectedItem(null); } })}
          />
        </>
      )}
    </div>
  );
};