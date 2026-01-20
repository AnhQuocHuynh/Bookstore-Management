import React, { useState, useMemo } from "react";
import { message, Input, Button, Modal } from "antd";
import { Search, Plus, X, AlertTriangle } from "lucide-react"; // Import AlertTriangle
import { useDebounce } from "@/hooks/use-debounce";

import { TableHeader, AuthorTable } from "./AuthorTable";
import { AuthorDetailPanel } from "./AuthorDetailPanel";
import { AuthorAddPanel } from "./AuthorAddPanel";
import { AuthorEditPanel } from "./AuthorEditPanel";

import {
    useAuthors,
    useCreateAuthor,
    useUpdateAuthor,
    useDeleteAuthor
} from "../hooks/useAuthors";

import { Author, AuthorTableRow, AuthorFormData } from "../types";
import { useAuthStore } from "@/stores/useAuthStore";

export const AuthorsPage = () => {
    const userRole = (useAuthStore((s) => s.user?.role) as "OWNER" | "EMPLOYEE" | "ADMIN" | undefined) || "EMPLOYEE";
    // --- States ---
    const [keyword, setKeyword] = useState("");
    const debouncedKeyword = useDebounce(keyword, 300);
    const [selectedAuthor, setSelectedAuthor] = useState<AuthorTableRow | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // --- Fetching (API support keyword) ---
    const { data: responseData, isLoading, isError } = useAuthors(debouncedKeyword);
    const authorsList = Array.isArray(responseData) ? responseData : (Array.isArray(responseData?.data) ? responseData?.data : []);

    // --- Mutations ---
    const createMutation = useCreateAuthor();
    const updateMutation = useUpdateAuthor();
    const deleteMutation = useDeleteAuthor();

    // --- Transform ---
    const tableData: AuthorTableRow[] = useMemo(() => {
        return authorsList.map((item: Author) => ({
            ...item,
            key: item.id,
        }));
    }, [authorsList]);

    // --- Mapping Data for Edit Form ---
    const selectedFormData: AuthorFormData | undefined = selectedAuthor ? {
        fullName: selectedAuthor.fullName,
        penName: selectedAuthor.penName,
        email: selectedAuthor.email,
        phone: selectedAuthor.phone,
        nationality: selectedAuthor.nationality,
        bio: selectedAuthor.bio,
        status: selectedAuthor.status,
    } : undefined;

    // --- Handlers ---
    const handleRowClick = (record: AuthorTableRow) => {
        if (selectedAuthor?.key === record.key) {
            setSelectedAuthor(null);
        } else {
            setSelectedAuthor(record);
        }
    };

    const handleCreate = (data: AuthorFormData) => {
        createMutation.mutate(data, {
            onSuccess: () => setIsAddOpen(false),
        });
    };

    const handleUpdate = (data: AuthorFormData) => {
        if (!selectedAuthor) return;
        updateMutation.mutate({ id: selectedAuthor.id, data }, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedAuthor(prev => prev ? ({ ...prev, ...data }) : null);
            }
        });
    };

    // --- DELETE HANDLER (CRITICAL WARNING) ---
    const handleDelete = () => {
        if (!selectedAuthor) {
            message.warning("Chọn tác giả để xóa");
            return;
        }

        Modal.confirm({
            title: (
                <span className="flex items-center gap-2 text-red-600 font-bold">
                    <AlertTriangle className="w-5 h-5" /> CẢNH BÁO XÓA TÁC GIẢ
                </span>
            ),
            icon: null, // Custom icon above
            content: (
                <div className="mt-2">
                    <p>Bạn có chắc chắn muốn xóa tác giả <strong>{selectedAuthor.fullName}</strong>?</p>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                        <p className="text-red-700 font-bold text-xs uppercase mb-1">Hành động này cực kỳ nguy hiểm:</p>
                        <ul className="list-disc list-inside text-red-600 text-sm">
                            <li>Tác giả sẽ bị xóa vĩnh viễn.</li>
                            <li><strong>TOÀN BỘ SÁCH</strong> thuộc về tác giả này cũng sẽ bị <strong>XÓA VĨNH VIỄN</strong>.</li>
                        </ul>
                    </div>
                </div>
            ),
            okText: "Xóa Vĩnh Viễn",
            okType: "danger",
            cancelText: "Hủy Bỏ",
            width: 500,
            onOk: () => {
                deleteMutation.mutate(selectedAuthor.id, {
                    onSuccess: () => setSelectedAuthor(null),
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
                            Quản Lý Tác Giả
                        </h1>
                        {userRole === "OWNER" && (
                          <div className="flex items-center gap-2.5">
                              <Button onClick={handleDelete} danger disabled={!selectedAuthor} className="h-10 rounded-xl font-semibold">
                                  Xóa
                              </Button>
                              <Button onClick={() => selectedAuthor ? setIsEditOpen(true) : message.warning("Chọn tác giả để sửa")} disabled={!selectedAuthor} className="h-10 rounded-xl font-semibold border-teal-600 text-teal-700">
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
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 bg-white p-3 rounded-xl border border-[#102e3c]/10 shadow-sm">
                        <div className="relative w-full sm:w-80">
                            <Input
                                placeholder="Tìm tên tác giả, bút danh..."
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
            ${selectedAuthor ? "right-[450px]" : "right-[20px]"}
          `}>
                        <div className="flex-shrink-0">
                            <TableHeader isPanelOpen={!!selectedAuthor} />
                        </div>

                        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                            {isError ? (
                                <div className="flex justify-center items-center h-full text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>
                            ) : (
                                <AuthorTable
                                    data={tableData}
                                    loading={isLoading}
                                    onRowClick={handleRowClick}
                                    selectedId={selectedAuthor?.id}
                                    isPanelOpen={!!selectedAuthor}
                                />
                            )}
                        </div>
                    </div>

                    {/* DETAIL PANEL */}
                    <div className={`
            absolute top-3 bottom-3 w-[430px] bg-white rounded-[20px] border-[3px] border-[#1a998f]
            transition-all duration-300 ease-in-out z-20 shadow-xl overflow-hidden flex flex-col
            ${selectedAuthor ? "right-3 translate-x-0 opacity-100" : "right-3 translate-x-[110%] opacity-0 pointer-events-none"}
          `}>
                        <button
                            onClick={() => setSelectedAuthor(null)}
                            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors z-50 cursor-pointer"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex-1 overflow-hidden h-full">
                            <AuthorDetailPanel selectedItem={selectedAuthor} />
                        </div>
                    </div>
                </section>
            </main>

            {/* --- MODALS --- */}
            {userRole === "OWNER" && (
              <AuthorAddPanel
                  isOpen={isAddOpen}
                  onClose={() => setIsAddOpen(false)}
                  onSubmit={handleCreate}
              />
            )}

            {userRole === "OWNER" && (
              <AuthorEditPanel
                  isOpen={isEditOpen}
                  onClose={() => setIsEditOpen(false)}
                  onSubmit={handleUpdate}
                  initialData={selectedFormData}
              />
            )}
        </div>
    );
};