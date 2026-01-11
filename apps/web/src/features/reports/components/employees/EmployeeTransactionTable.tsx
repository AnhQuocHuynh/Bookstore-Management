import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/utils";

// Mock data giả lập
const MOCK_TRANSACTIONS = Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    name: `Nhân Viên ${String.fromCharCode(65 + (i % 6))}`, // A, B, C...
    amount: Math.floor(Math.random() * 500 + 100) * 1000,
}));

export const EmployeeTransactionTable = () => {
    return (
        <div className="col-span-12 lg:col-span-5 bg-white rounded-[20px] shadow-lg border border-zinc-100 overflow-hidden flex flex-col h-[800px]">
            <div className="bg-teal-600 p-5 text-white font-bold text-xl text-center flex-shrink-0">
                Lịch sử giao dịch nhân viên
            </div>

            {/* Header Table */}
            <div className="flex bg-gray-50 border-b font-bold text-cyan-950 text-sm py-4 px-2 shadow-sm">
                <div className="w-16 text-center">STT</div>
                <div className="flex-1">Nhân Viên</div>
                <div className="w-32 text-right pr-4">Tổng Tiền</div>
            </div>

            {/* Body Table */}
            <ScrollArea className="flex-1">
                <div className="w-full">
                    {MOCK_TRANSACTIONS.map((item, index) => (
                        <div
                            key={item.id}
                            className={`flex items-center py-4 px-2 border-b text-sm text-cyan-950 transition-colors hover:bg-teal-50 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                        >
                            <div className="w-16 text-center text-gray-500">{item.id}</div>
                            <div className="flex-1 font-medium">{item.name}</div>
                            <div className="w-32 text-right pr-4 font-bold text-teal-600">
                                {formatCurrency(item.amount)}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};