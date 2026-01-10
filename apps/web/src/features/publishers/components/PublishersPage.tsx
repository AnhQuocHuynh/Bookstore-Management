import React, { useState, useMemo } from "react";
import { message, Input, Button, Modal } from "antd";
import { Search, Plus, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

import { TableHeader, PublisherTable } from "./PublisherTable";
import { PublisherDetailPanel } from "./PublisherDetailPanel";
import { PublisherAddPanel } from "./PublisherAddPanel";
import { PublisherEditPanel } from "./PublisherEditPanel";

import {
    usePublishers,
    useCreatePublisher,
    useUpdatePublisher,
    useDeletePublisher
} from "../hooks/usePublishers";

import { Publisher, PublisherTableRow, PublisherFormData } from "../types";

export const PublishersPage = () => {
    // --- States ---
    const [keyword, setKeyword] = useState("");
    const debouncedKeyword = useDebounce(keyword, 300);
    const [selectedPublisher, setSelectedPublisher] = useState<PublisherTableRow | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // --- Fetching ---
    const { data: responseData, isLoading, isError } = usePublishers();
    const publishersList = Array.isArray(responseData) ? responseData : (Array.isArray(responseData?.data) ? responseData?.data : []);

    // --- Mutations ---
    const createMutation = useCreatePublisher();
    const updateMutation = useUpdatePublisher();
    const deleteMutation = useDeletePublisher();

    // --- Transform & Filter ---
    const tableData: PublisherTableRow[] = useMemo(() => {
        let data = publishersList.map((item: Publisher) => ({
            ...item,
            key: item.id,
        }));

        if (debouncedKeyword) {
            const lowerKeyword = debouncedKeyword.toLowerCase();
            data = data.filter((item: Publisher) =>
                (item.name && item.name.toLowerCase().includes(lowerKeyword)) ||
                (item.email && item.email.toLowerCase().includes(lowerKeyword)) ||
                (item.phone && item.phone.includes(lowerKeyword))
            );
        }
        return data;
    }, [publishersList, debouncedKeyword]);

    // --- Mapping Data for Edit Form ---
    const selectedFormData: PublisherFormData | undefined = selectedPublisher ? {
        name: selectedPublisher.name,
        email: selectedPublisher.email || "",
        phone: selectedPublisher.phone || "",
        address: selectedPublisher.address || "",
        website: selectedPublisher.website || "",
        description: selectedPublisher.description || "",
    } : undefined;

    // --- Handlers ---
    const handleRowClick = (record: PublisherTableRow) => {
        if (selectedPublisher?.key === record.key) {
            setSelectedPublisher(null);
        } else {
            setSelectedPublisher(record);
        }
    };

    const handleCreate = (data: PublisherFormData) => {
        createMutation.mutate(data, {
            onSuccess: () => setIsAddOpen(false),
        });
    };

    const handleUpdate = (data: PublisherFormData) => {
        if (!selectedPublisher) return;
        updateMutation.mutate({ id: selectedPublisher.id, data }, {
            onSuccess: () => {
                setIsEditOpen(false);
                // Update local UI
                setSelectedPublisher(prev => prev ? ({ ...prev, ...data }) : null);
            }
        });
    };

    const handleDelete = () => {
        if (!selectedPublisher) {
            message.warning("Chọn NXB để xóa");
            return;
        }
        Modal.confirm({
            title: "Xóa nhà xuất bản",
            content: (
                <div>
                    <p>Bạn có chắc muốn xóa <strong>{selectedPublisher.name}</strong>?</p>
                    <p className="text-red-500 text-xs mt-1">Lưu ý: Nếu NXB này đã có sách trong hệ thống, việc xóa có thể gây lỗi.</p>
                </div>
            ),
            okText: "Xóa",
            okType: "danger",
            onOk: () => {
                deleteMutation.mutate(selectedPublisher.id, {
                    onSuccess: () => setSelectedPublisher(null),
                });
            }
        });
    };

    return (
        <div className="relative w-full h-full overflow-hidden flex flex-col font-['Inter']">

            {/* --- Header --- */}
            <div className="flex-shrink-0 px-6 pt-3 pb-2">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h1 className="font-bold text-[#102e3c] text-2xl sm:text-3xl lg:text-4xl">
                            Nhà Xuất Bản
                        </h1>
                        <div className="flex items-center gap-2.5">
                            <Button onClick={handleDelete} danger disabled={!selectedPublisher} className="h-10 rounded-xl font-semibold">
                                Xóa
                            </Button>
                            <Button onClick={() => selectedPublisher ? setIsEditOpen(true) : message.warning("Chọn NXB để sửa")} disabled={!selectedPublisher} className="h-10 rounded-xl font-semibold border-teal-600 text-teal-700">
                                Sửa
                            </Button>
                            <Button
                                type="primary"
                                icon={<Plus size={18} />}
                                className="bg-[#1a998f] hover:bg-[#158f85] h-10 px-4 rounded-xl font-bold border-none"
                                onClick={() => setIsAddOpen(true)}
                            >
                                Tạo Mới
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 bg-white p-3 rounded-xl border border-[#102e3c]/10 shadow-sm">
                        <div className="relative w-full sm:w-80">
                            <Input
                                placeholder="Tìm tên, email, sđt..."
                                prefix={<Search size={16} className="text-gray-400" />}
                                className="rounded-lg border-teal-600/30 hover:border-teal-600 focus:border-teal-600 h-[38px]"
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            <main className="flex-1 px-6 pb-6 overflow-hidden mt-4 relative">
                <section className="relative w-full h-full bg-white rounded-[20px] overflow-hidden border border-solid border-[#102e3c] shadow-sm flex flex-col">

                    <div className={`
            absolute top-3 bottom-3 left-[13px] rounded-[20px] transition-all duration-300 flex flex-col bg-white z-10
            ${selectedPublisher ? "right-[450px]" : "right-[20px]"}
          `}>
                        <div className="flex-shrink-0">
                            <TableHeader isPanelOpen={!!selectedPublisher} />
                        </div>

                        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                            {isError ? (
                                <div className="flex justify-center items-center h-full text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>
                            ) : (
                                <PublisherTable
                                    data={tableData}
                                    loading={isLoading}
                                    onRowClick={handleRowClick}
                                    selectedId={selectedPublisher?.id}
                                    isPanelOpen={!!selectedPublisher}
                                />
                            )}
                        </div>
                    </div>

                    {/* DETAIL PANEL */}
                    <div className={`
            absolute top-3 bottom-3 w-[430px] bg-white rounded-[20px] border-[3px] border-[#1a998f]
            transition-all duration-300 ease-in-out z-20 shadow-xl overflow-hidden flex flex-col
            ${selectedPublisher ? "right-3 translate-x-0 opacity-100" : "right-3 translate-x-[110%] opacity-0 pointer-events-none"}
          `}>
                        <button
                            onClick={() => setSelectedPublisher(null)}
                            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors z-50 cursor-pointer"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex-1 overflow-hidden h-full">
                            <PublisherDetailPanel selectedItem={selectedPublisher} />
                        </div>
                    </div>
                </section>
            </main>

            {/* --- MODALS --- */}
            <PublisherAddPanel
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSubmit={handleCreate}
            />

            <PublisherEditPanel
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSubmit={handleUpdate}
                initialData={selectedFormData}
            />
        </div>
    );
};