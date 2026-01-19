import React, { useState } from "react";
import { Card, Button, Modal, Dropdown, Empty, Spin, Tag } from "antd";
import { Plus, MoreVertical, Edit, Trash2, Box, X } from "lucide-react";
import { useShelves, useDisplayMutations } from "../hooks/useDisplay";
import { ShelfModal } from "./modals/ShelfModal";
import { ShelfDetailPanel } from "./ShelfDetailPanel";
import { useAuthStore } from "@/stores/useAuthStore";

export const ShelvesView = () => {
    const userRole = (useAuthStore((s) => s.user?.role) as "OWNER" | "EMPLOYEE" | "ADMIN" | undefined) || "EMPLOYEE";
    const { data: shelves, isLoading } = useShelves();
    const { deleteShelf, createShelf, updateShelf } = useDisplayMutations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShelf, setEditingShelf] = useState<any>(null);
    const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);

    const handleCreate = (values: any) => {
        createShelf.mutate(values, { onSuccess: () => setIsModalOpen(false) });
    };

    const handleUpdate = (values: any) => {
        if (!editingShelf) return;
        updateShelf.mutate({ id: editingShelf.id, data: values }, {
            onSuccess: () => { setIsModalOpen(false); setEditingShelf(null); }
        });
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: "Xóa kệ này?",
            content: "Tất cả sản phẩm trên kệ sẽ được trả về kho.",
            okText: "Xóa",
            okType: "danger",
            onOk: () => deleteShelf.mutate(id),
        });
    };

    if (isLoading) return <Spin className="flex justify-center p-10" />;

    return (
        <div className="relative w-full h-full overflow-hidden flex flex-col">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            `}</style>

            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-bold text-lg text-[#102e3c]">Sơ đồ kệ hàng</h3>
                {userRole !== "OWNER" && (
                  <Button type="primary" icon={<Plus size={16} />} className="bg-[#1a998f]" onClick={() => { setEditingShelf(null); setIsModalOpen(true); }}>
                      Thêm Kệ Mới
                  </Button>
                )}
            </div>

            <div className="relative flex-1 overflow-hidden">
                <div className={`absolute inset-0 transition-all duration-300 overflow-y-auto custom-scrollbar ${selectedShelfId ? "pr-[450px]" : "pr-0"}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
                        {shelves?.length === 0 && <Empty description="Chưa có kệ nào" className="col-span-full py-10" />}

                        {shelves?.map((shelf) => (
                            <Card
                                key={shelf.id}
                                hoverable
                                className={`border-gray-200 shadow-sm rounded-xl cursor-pointer transition-all ${
                                    selectedShelfId === shelf.id ? "ring-2 ring-teal-500 bg-teal-50" : ""
                                }`}
                                onClick={() => {
                                    if (selectedShelfId === shelf.id) {
                                        setSelectedShelfId(null);
                                    } else {
                                        setSelectedShelfId(shelf.id);
                                    }
                                }}
                                actions={[
                                    <div key="view" className="text-teal-600 font-medium">Xem chi tiết</div>
                                ]}
                            >
                                {userRole !== "OWNER" && (
                                  <div className="absolute top-4 right-4" onClick={e => e.stopPropagation()}>
                                      <Dropdown menu={{
                                          items: [
                                              { key: 'edit', label: 'Sửa thông tin', icon: <Edit size={14} />, onClick: () => { setEditingShelf(shelf); setIsModalOpen(true); } },
                                              { key: 'delete', label: 'Xóa kệ', icon: <Trash2 size={14} />, danger: true, onClick: () => handleDelete(shelf.id) }
                                          ]
                                      }} trigger={['click']}>
                                          <Button type="text" size="small" icon={<MoreVertical size={16} className="text-gray-500" />} />
                                      </Dropdown>
                                  </div>
                                )}

                                <div className="flex flex-col items-center py-2">
                                    <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mb-3 text-teal-600">
                                        <Box size={24} />
                                    </div>
                                    <h4 className="font-bold text-[#102e3c] text-lg mb-1">{shelf.name}</h4>
                                    <p className="text-gray-500 text-sm line-clamp-2 text-center h-10">{shelf.description || "Không có mô tả"}</p>
                                    {shelf.isActive ? <Tag color="success" className="mt-2">Hoạt động</Tag> : <Tag className="mt-2">Ẩn</Tag>}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className={`absolute top-0 bottom-0 w-[430px] bg-white rounded-[20px] border-[3px] border-[#1a998f] transition-all duration-300 ease-in-out z-20 shadow-xl overflow-hidden flex flex-col ${selectedShelfId ? "right-0 translate-x-0 opacity-100" : "right-0 translate-x-[110%] opacity-0 pointer-events-none"}`}>
                    <button 
                        onClick={() => setSelectedShelfId(null)} 
                        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors z-50 cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                    <div className="flex-1 overflow-hidden h-full">
                        <ShelfDetailPanel shelfId={selectedShelfId} />
                    </div>
                </div>
            </div>

            {userRole !== "OWNER" && (
              <ShelfModal
                  open={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  onSubmit={editingShelf ? handleUpdate : handleCreate}
                  initialValues={editingShelf}
                  loading={createShelf.isPending || updateShelf.isPending}
              />
            )}
        </div>
    );
};