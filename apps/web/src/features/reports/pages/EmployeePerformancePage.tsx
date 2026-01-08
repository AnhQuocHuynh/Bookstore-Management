import React from "react";
import { EmployeeHeader } from "../components/employees/EmployeeHeader";
import { EmployeeTransactionTable } from "../components/employees/EmployeeTransactionTable";
import { EmployeeSalesDistribution } from "../components/employees/EmployeeSalesDistribution";
import { EmployeeTransactionComparison } from "../components/employees/EmployeeTransactionComparison";

const EmployeePerformancePage = () => {
    return (
        <div className="p-8 font-['Inter']">
            {/* Header */}
            <EmployeeHeader />

            <div className="grid grid-cols-12 gap-8 max-w-[1600px] mx-auto">
                {/* Cột trái: Bảng lịch sử */}
                <EmployeeTransactionTable />

                {/* Cột phải: Các biểu đồ */}
                <div className="col-span-12 lg:col-span-7 bg-teal-600/10 rounded-[20px] p-8 border border-teal-200 flex flex-col">
                    <EmployeeSalesDistribution />
                    <EmployeeTransactionComparison />
                </div>
            </div>
        </div>
    );
};

export default EmployeePerformancePage;