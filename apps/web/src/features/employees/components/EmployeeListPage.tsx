import React, { useState, useMemo } from "react";
import { message, Input, Button, Modal } from "antd";
import { Search, Plus, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

import { TableHeader, EmployeeTable } from "./EmployeeTable";
import { EmployeeDetailPanel } from "./EmployeeDetailPanel";
import { EmployeeEditPanel } from "./EmployeeEditPanel";

import { useEmployees, useDeleteEmployee, useUpdateEmployee } from "../hooks/useEmployees";
import { Employee, EmployeeTableRow, EmployeeFormData } from "../types";

export const EmployeeListPage = () => {
    // --- States ---
    const [keyword, setKeyword] = useState("");
    const debouncedKeyword = useDebounce(keyword, 300);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeTableRow | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // --- Fetching ---
    const { data: responseData, isLoading, isError } = useEmployees();
    
    // --- Mutations ---
    const deleteMutation = useDeleteEmployee();
    const updateMutation = useUpdateEmployee();
    const employeesList: Employee[] = useMemo(() => {
        if (!responseData) return [];
        if (Array.isArray(responseData)) return responseData;
        if (responseData?.data && Array.isArray(responseData.data)) return responseData.data;
        return [];
    }, [responseData]);

    // --- Transform & Filter ---
    const tableData: EmployeeTableRow[] = useMemo(() => {
        let data = employeesList.map((item: Employee) => ({
            ...item,
            key: item.id,
        }));

        if (debouncedKeyword) {
            const lowerKeyword = debouncedKeyword.toLowerCase();
            data = data.filter((item: Employee) =>
                (item.fullName && item.fullName.toLowerCase().includes(lowerKeyword)) ||
                (item.email && item.email.toLowerCase().includes(lowerKeyword)) ||
                (item.phoneNumber && item.phoneNumber.includes(lowerKeyword)) ||
                (item.id && item.id.includes(lowerKeyword))
            );
        }
        return data;
    }, [employeesList, debouncedKeyword]);

    // --- Handlers ---
    const handleRowClick = (record: EmployeeTableRow) => {
        if (selectedEmployee?.key === record.key) {
            setSelectedEmployee(null);
        } else {
            setSelectedEmployee(record);
        }
    };

    const handleDelete = () => {
        if (!selectedEmployee) {
            message.warning("Chọn nhân viên để xóa");
            return;
        }

        Modal.confirm({
            title: "Xác nhận xóa nhân viên",
            content: (
                <div>
                    <p>Bạn có chắc chắn muốn xóa <strong>{selectedEmployee.fullName}</strong>?</p>
                    <p className="text-red-500 text-xs mt-1">Lưu ý: Không thể xóa nếu nhân viên đã có lịch sử làm việc.</p>
                </div>
            ),
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: () => {
                deleteMutation.mutate(selectedEmployee.id, {
                    onSuccess: () => setSelectedEmployee(null),
                });
            }
        });
    };

    const handleUpdate = (data: EmployeeFormData) => {
        if (!selectedEmployee) return;
        updateMutation.mutate({ id: selectedEmployee.id, data }, {
            onSuccess: () => {
                setIsEditOpen(false);
                // Update local state
                setSelectedEmployee(prev => prev ? ({ ...prev, ...data }) : null);
            }
        });
    };

    // --- Mapping Data for Edit Form ---
    const selectedFormData: EmployeeFormData | undefined = selectedEmployee ? {
        fullName: selectedEmployee.fullName,
        email: selectedEmployee.email,
        phoneNumber: selectedEmployee.phoneNumber,
        address: selectedEmployee.address,
        birthDate: selectedEmployee.birthDate,
        avatarUrl: selectedEmployee.avatarUrl || undefined,
    } : undefined;

    return (
        <div className="relative w-full h-full overflow-hidden flex flex-col font-['Inter']">

            {/* --- Header --- */}
            <div className="flex-shrink-0 px-6 pt-3 pb-2">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h1 className="font-bold text-[#102e3c] text-2xl sm:text-3xl lg:text-4xl">
                            Nhân Viên
                        </h1>
                        <div className="flex items-center gap-2.5">
                            <Button onClick={handleDelete} danger disabled={!selectedEmployee} className="h-10 rounded-xl font-semibold">
                                Xóa
                            </Button>
                            <Button onClick={() => selectedEmployee ? setIsEditOpen(true) : message.warning("Chọn nhân viên để sửa")} disabled={!selectedEmployee} className="h-10 rounded-xl font-semibold border-teal-600 text-teal-700">
                                Sửa
                            </Button>
                            <Button type="primary" icon={<Plus size={18} />} className="bg-[#1a998f] hover:bg-[#158f85] h-10 px-4 rounded-xl font-bold border-none">
                                Tạo Mới
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 bg-white p-3 rounded-xl border border-[#102e3c]/10 shadow-sm">
                        <div className="relative w-full sm:w-80">
                            <Input
                                placeholder="Tìm tên, email, SĐT, mã NV..."
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
            ${selectedEmployee ? "right-[450px]" : "right-[20px]"}
          `}>
                        <div className="flex-shrink-0">
                            <TableHeader isPanelOpen={!!selectedEmployee} />
                        </div>

                        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                            {isError ? (
                                <div className="flex justify-center items-center h-full text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>
                            ) : (
                                <EmployeeTable
                                    data={tableData}
                                    loading={isLoading}
                                    onRowClick={handleRowClick}
                                    selectedId={selectedEmployee?.id}
                                    isPanelOpen={!!selectedEmployee}
                                />
                            )}
                        </div>
                    </div>

                    {/* DETAIL PANEL */}
                    <div className={`
            absolute top-3 bottom-3 w-[430px] bg-white rounded-[20px] border-[3px] border-[#1a998f]
            transition-all duration-300 ease-in-out z-20 shadow-xl overflow-hidden flex flex-col
            ${selectedEmployee ? "right-3 translate-x-0 opacity-100" : "right-3 translate-x-[110%] opacity-0 pointer-events-none"}
          `}>
                        <button
                            onClick={() => setSelectedEmployee(null)}
                            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors z-50 cursor-pointer"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex-1 overflow-hidden h-full">
                            <EmployeeDetailPanel selectedItem={selectedEmployee} />
                        </div>
                    </div>
                </section>
            </main>

            {/* --- EDIT MODAL --- */}
            <EmployeeEditPanel
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSubmit={handleUpdate}
                initialData={selectedFormData}
            />
        </div>
    );
};
