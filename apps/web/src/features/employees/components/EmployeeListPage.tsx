import React, { useState, useMemo, useEffect } from "react";
import { message, Input, Button, Modal } from "antd";
import { Search, Plus, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

import { TableHeader, EmployeeTable } from "./EmployeeTable";
import { EmployeeDetailPanel } from "./EmployeeDetailPanel";
import { EmployeeEditPanel } from "./EmployeeEditPanel";
import { EmployeeAddPage } from "./EmployeeAddPage";

import { useEmployees, useUpdateEmployee, useUpdateEmployeeStatus, useUpdateEmployeeRole } from "../hooks/useEmployees";
import { Employee, EmployeeTableRow, EmployeeFormData } from "../types";

export const EmployeeListPage = () => {
    // --- States ---
    const [keyword, setKeyword] = useState("");
    const debouncedKeyword = useDebounce(keyword, 300);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeTableRow | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // --- Fetching ---
    const { data: responseData, isLoading, isError } = useEmployees({ limit: 1000 });
    
    // --- Mutations ---
    const updateMutation = useUpdateEmployee();
    const updateStatusMutation = useUpdateEmployeeStatus();
    const updateRoleMutation = useUpdateEmployeeRole();
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
                (item.phone && item.phone.includes(lowerKeyword)) ||
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

    const handleUpdate = async (data: Partial<EmployeeFormData>) => {
        if (!selectedEmployee) return;

        // Extract role and isActive from data
        const { role, isActive, ...employeeData } = data;

        try {
            // Update employee basic info (excluding role and isActive)
            await updateMutation.mutateAsync({ id: selectedEmployee.id, data: employeeData });

            // Update role if changed
            if (role !== undefined && role !== selectedEmployee.role) {
                await updateRoleMutation.mutateAsync({ id: selectedEmployee.id, role });
            }

            // Update status if changed
            if (isActive !== undefined && isActive !== selectedEmployee.isActive) {
                await updateStatusMutation.mutateAsync({ id: selectedEmployee.id, isActive });
            }

            setIsEditOpen(false);
            // Update local state
            setSelectedEmployee(prev => prev ? ({ ...prev, ...data }) : null);
        } catch (error) {
            // Error handling is done in the hooks
        }
    };

    // --- Mapping Data for Edit Form ---
    const selectedFormData: EmployeeFormData | undefined = useMemo(() => {
        if (!selectedEmployee) return undefined;
        
        // Tìm employee đầy đủ từ employeesList
        const fullEmployee = employeesList.find(emp => emp.id === selectedEmployee.id);
        
        if (!fullEmployee) return undefined;
        
        return {
            staffId: fullEmployee.staffId,
            fullName: fullEmployee.fullName,
            email: fullEmployee.email,
            phone: fullEmployee.phone,
            dateOfBirth: fullEmployee.dateOfBirth,
            gender: fullEmployee.gender,
            address: fullEmployee.address,
            avatarUrl: fullEmployee.avatarUrl || undefined,
            role: fullEmployee.role,
            isActive: fullEmployee.isActive,
            startDate: fullEmployee.startDate,
            salary: fullEmployee.salary,
            identityCard: fullEmployee.identityCard,
            emergencyContactName: fullEmployee.emergencyContact?.name,
            emergencyContactPhone: fullEmployee.emergencyContact?.phone,
            emergencyContactRelationship: fullEmployee.emergencyContact?.relationship,
        };
    }, [selectedEmployee, employeesList]);

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
                            <Button onClick={() => selectedEmployee ? setIsEditOpen(true) : message.warning("Chọn nhân viên để sửa")} disabled={!selectedEmployee} className="bg-[#1a998f] hover:bg-[#158f85] h-10 px-4 rounded-xl font-semibold border-none text-white">
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
                            aria-label="Đóng panel chi tiết nhân viên"
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

            {/* --- ADD MODAL --- */}
            <Modal
                open={isAddOpen}
                onCancel={() => setIsAddOpen(false)}
                footer={null}
                width={800}
                destroyOnClose
                centered
                closeIcon={<span className="text-3xl text-[#102e3c] cursor-pointer hover:opacity-70">×</span>}
                styles={{
                    body: { backgroundColor: "#D4E5E4", padding: 0 },
                    mask: { backgroundColor: "rgba(16, 46, 60, 0.5)" },
                }}
                title={null}
            >
                <EmployeeAddPage
                    isModal
                    onClose={() => setIsAddOpen(false)}
                    onSuccess={() => setIsAddOpen(false)}
                />
            </Modal>
        </div>
    );
};
