import React, { useState } from "react";
import { Drawer, Table, Button, Dropdown, Tag, Typography, Spin, Modal } from "antd";
import { MoreHorizontal, ArrowRightLeft, MinusCircle, Trash2, Plus } from "lucide-react";
import { useShelfDetail, useDisplayMutations } from "../hooks/useDisplay";
import { AddProductModal } from "./modals/AddProductModal";
import { MoveProductModal } from "./modals/MoveProductModal";
import { ReduceProductModal } from "./modals/ReduceProductModal";

interface Props { shelfId: string | null; onClose: () => void; }

export const ShelfDetailDrawer: React.FC<Props> = ({ shelfId, onClose }) => {
    const { data: shelf, isLoading } = useShelfDetail(shelfId || "");
    const { addProduct, moveProduct, reduceProduct, removeProduct } = useDisplayMutations();

    // Modal States
    const [modalType, setModalType] = useState<'add' | 'move' | 'reduce' | null>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: ['product', 'name'],
            render: (text: string, record: any) => (
                <div className="flex gap-2 items-center">
                    {record.product.imageUrl && <img src={record.product.imageUrl} className="w-8 h-8 rounded border" />}
                    <div>
                        <div className="font-medium">{text}</div>
                        <div className="text-xs text-gray-500">{record.product.sku}</div>
                    </div>
                </div>
            )
        },
        { title: 'Số lượng', dataIndex: 'quantity', align: 'center' as const, width: 100 },
        {
            title: '', width: 50,
            render: (_: any, record: any) => (
                <Dropdown menu={{
                    items: [
                        { key: 'move', label: 'Chuyển kệ', icon: <ArrowRightLeft size={14} />, onClick: () => { setSelectedItem(record); setModalType('move'); } },
                        { key: 'reduce', label: 'Rút về kho', icon: <MinusCircle size={14} />, onClick: () => { setSelectedItem(record); setModalType('reduce'); } },
                        { type: 'divider' },
                        { key: 'remove', label: 'Gỡ bỏ (Trả hết)', icon: <Trash2 size={14} />, danger: true, onClick: () => handleRemove(record.id) },
                    ]
                }} trigger={['click']}>
                    <Button type="text" size="small" icon={<MoreHorizontal size={16} />} />
                </Dropdown>
            )
        }
    ];

    const handleRemove = (id: string) => {
        Modal.confirm({
            title: "Gỡ sản phẩm?",
            content: "Toàn bộ số lượng sẽ được trả về kho.",
            okType: 'danger',
            onOk: () => removeProduct.mutate(id)
        });
    };

    return (
        <Drawer
            title={shelf ? `Chi tiết: ${shelf.name}` : "Đang tải..."}
            width={700}
            open={!!shelfId}
            onClose={onClose}
            extra={<Button type="primary" icon={<Plus size={16} />} onClick={() => setModalType('add')}>Thêm hàng</Button>}
        >
            {isLoading ? <Spin className="w-full mt-10" /> : (
                <>
                    <div className="mb-4 text-gray-500 italic">{shelf?.description}</div>
                    <Table dataSource={shelf?.displayProducts || []} columns={columns} rowKey="id" pagination={false} />

                    {/* MODALS */}
                    <AddProductModal
                        open={modalType === 'add'}
                        onClose={() => setModalType(null)}
                        defaultShelfId={shelfId!}
                        onSubmit={(vals) => addProduct.mutate(vals, { onSuccess: () => setModalType(null) })}
                    />
                    <MoveProductModal
                        open={modalType === 'move'}
                        onClose={() => setModalType(null)}
                        currentShelfId={shelfId!}
                        maxQuantity={selectedItem?.quantity || 0}
                        onSubmit={(vals) => moveProduct.mutate({ id: selectedItem.id, data: vals }, { onSuccess: () => setModalType(null) })}
                    />
                    <ReduceProductModal
                        open={modalType === 'reduce'}
                        onClose={() => setModalType(null)}
                        maxQuantity={selectedItem?.quantity || 0}
                        onSubmit={(vals) => reduceProduct.mutate({ id: selectedItem.id, data: vals }, { onSuccess: () => setModalType(null) })}
                    />
                </>
            )}
        </Drawer>
    );
};