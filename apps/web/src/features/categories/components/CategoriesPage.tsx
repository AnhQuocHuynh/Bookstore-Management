import React, { useState, useMemo } from "react";
import { message, Input, Button, Modal } from "antd";
import { Search, Plus, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

import { TableHeader, CategoryTable } from "./CategoryTable";
import { CategoryDetailPanel } from "./CategoryDetailPanel";
import { CategoryAddPanel } from "./CategoryAddPanel";
import { CategoryEditPanel } from "./CategoryEditPanel";

import {
    useCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory
} from "../hooks/useCategories";

import { Category, CategoryTableRow, CategoryFormData } from "../types";

export const CategoriesPage = () => {
    // --- States ---
    const [keyword, setKeyword] = useState("");
    const debouncedKeyword = useDebounce(keyword, 300);
    const [selectedCategory, setSelectedCategory] = useState<CategoryTableRow | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // --- Fetching ---
    const { data: responseData, isLoading, isError } = useCategories();
    // Response có thể là { data: [...], total: ... } hoặc mảng [...]
    const categoriesList = Array.isArray(responseData) ? responseData : (Array.isArray(responseData?.data) ? responseData?.data : []);

    // --- Mutations ---
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();

    // --- Transform & Filter ---
    const tableData: CategoryTableRow[] = useMemo(() => {
        let data = categoriesList.map((item: Category) => ({
            ...item,
            key: item.id,
        }));

        if (debouncedKeyword) {
            const lowerKeyword = debouncedKeyword.toLowerCase();
            data = data.filter((item: Category) =>
                (item.name && item.name.toLowerCase().includes(lowerKeyword)) ||
                (item.slug && item.slug.toLowerCase().includes(lowerKeyword))
            );
        }
        return data;
    }, [categoriesList, debouncedKeyword]);

    // --- Mapping Data for Edit Form ---
    const selectedFormData: CategoryFormData | undefined = selectedCategory ? {
        name: selectedCategory.name,
        slug: selectedCategory.slug,
        taxRate: selectedCategory.taxRate,
        description: selectedCategory.description || "",
    } : undefined;

    // --- Handlers ---
    const handleRowClick = (record: CategoryTableRow) => {
        if (selectedCategory?.key === record.key) {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(record);
        }
    };

    const handleCreate = (data: CategoryFormData) => {
        createMutation.mutate(data, {
            onSuccess: () => setIsAddOpen(false),
        });
    };

    const handleUpdate = (data: CategoryFormData) => {
        if (!selectedCategory) return;
        updateMutation.mutate({ id: selectedCategory.id, data }, {
            onSuccess: () => {
                setIsEditOpen(false);
                // Update local UI
                setSelectedCategory(prev => prev ? ({ ...prev, ...data }) : null);
            }
        });
    };

    const handleDelete = () => {
        if (!selectedCategory) {
            message.warning("Chọn danh mục để xóa");
            return;
        }
        Modal.confirm({
            title: "Xóa danh mục",
            content: (
                <div>
                    <p>Bạn có chắc muốn xóa <strong>{selectedCategory.name}</strong>?</p>
                </div>
            ),
            okText: "Xóa",
            okType: "danger",
            onOk: () => {
                deleteMutation.mutate(selectedCategory.id, {
                    onSuccess: () => setSelectedCategory(null),
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
                            Danh Mục Sản Phẩm
                        </h1>
                        <div className="flex items-center gap-2.5">
                            <Button onClick={handleDelete} danger disabled={!selectedCategory} className="h-10 rounded-xl font-semibold">
                                Xóa
                            </Button>
                            <Button onClick={() => selectedCategory ? setIsEditOpen(true) : message.warning("Chọn danh mục để sửa")} disabled={!selectedCategory} className="h-10 rounded-xl font-semibold border-teal-600 text-teal-700">
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
                                placeholder="Tìm tên, slug..."
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
            ${selectedCategory ? "right-[450px]" : "right-[20px]"}
          `}>
                        <div className="flex-shrink-0">
                            <TableHeader isPanelOpen={!!selectedCategory} />
                        </div>

                        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                            {isError ? (
                                <div className="flex justify-center items-center h-full text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>
                            ) : (
                                <CategoryTable
                                    data={tableData}
                                    loading={isLoading}
                                    onRowClick={handleRowClick}
                                    selectedId={selectedCategory?.id}
                                    isPanelOpen={!!selectedCategory}
                                />
                            )}
                        </div>
                    </div>

                    {/* DETAIL PANEL */}
                    <div className={`
            absolute top-3 bottom-3 w-[430px] bg-white rounded-[20px] border-[3px] border-[#1a998f]
            transition-all duration-300 ease-in-out z-20 shadow-xl overflow-hidden flex flex-col
            ${selectedCategory ? "right-3 translate-x-0 opacity-100" : "right-3 translate-x-[110%] opacity-0 pointer-events-none"}
          `}>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors z-50 cursor-pointer"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex-1 overflow-hidden h-full">
                            <CategoryDetailPanel selectedItem={selectedCategory} />
                        </div>
                    </div>
                </section>
            </main>

            {/* --- MODALS --- */}
            <CategoryAddPanel
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSubmit={handleCreate}
            />

            <CategoryEditPanel
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSubmit={handleUpdate}
                initialData={selectedFormData}
            />
        </div>
    );
};