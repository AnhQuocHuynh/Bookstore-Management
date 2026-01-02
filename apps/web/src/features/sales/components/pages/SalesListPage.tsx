// src/features/sales/pages/SalesListPage.tsx

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Filter, FileText, X, User, ChevronRight, Printer, Loader2 } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/utils";
import { cn } from "@/lib/utils";
import { useTransactions } from "../../hooks/use-transactions"
import { Transaction } from "../../types/sales.types";

// Hàm helper để map phương thức thanh toán sang tiếng Việt
const getPaymentMethodLabel = (method: string | null) => {
    switch (method) {
        case "bank_transfer": return "Chuyển khoản";
        case "cash": return "Tiền mặt";
        case "card": return "Thẻ";
        default: return "Chưa thanh toán";
    }
};

export const SalesListPage = () => {
    // --- Data Fetching ---
    // Tạm thời chưa truyền params ngày tháng, bạn có thể state hóa nó sau
    const { data: transactions, isLoading, isError } = useTransactions();

    const [selectedSale, setSelectedSale] = useState<Transaction | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // --- Filter Logic ---
    const filteredSales = useMemo(() => {
        if (!transactions) return [];

        return transactions.filter((sale) => {
            const searchLower = searchTerm.toLowerCase();
            // Tìm theo ID (lấy 8 ký tự đầu làm mã đơn) hoặc tên nhân viên
            const shortCode = sale.id.substring(0, 8).toUpperCase();
            const staffName = sale.cashier?.fullName?.toLowerCase() || "";

            return shortCode.includes(searchLower) || staffName.includes(searchLower);
        });
    }, [transactions, searchTerm]);

    const handleRowClick = (sale: Transaction) => {
        setSelectedSale(sale);
    };

    const handleCloseDetail = () => {
        setSelectedSale(null);
    };

    // Tính tổng số lượng sản phẩm trong đơn (vì API trả về mảng details)
    const calculateTotalItems = (sale: Transaction) => {
        return sale.details.reduce((acc, item) => acc + item.quantity, 0);
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-4 p-2 bg-slate-50 font-['Inter'] overflow-hidden">
            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>

            {/* Header & Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-1 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-cyan-950">Danh sách giao dịch</h1>
                    <p className="text-gray-500 text-sm">Quản lý lịch sử bán hàng</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64 h-10">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-400 pointer-events-none">
                            <Search className="w-4 h-4" />
                        </div>
                        <Input
                            placeholder="Tìm theo mã đơn, nhân viên..."
                            className="pl-10 h-full bg-white border-teal-600/30 focus-visible:ring-teal-600 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" className="border-teal-600 text-teal-700 hover:bg-teal-50 h-10">
                        <Calendar className="w-4 h-4 mr-2" /> Ngày
                    </Button>
                    <Button variant="outline" size="sm" className="border-teal-600 text-teal-700 hover:bg-teal-50 h-10">
                        <Filter className="w-4 h-4 mr-2" /> Lọc
                    </Button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex flex-row gap-4 flex-1 min-h-0 relative w-full">

                {/* --- LEFT: TRANSACTION LIST TABLE --- */}
                <div className="flex-1 bg-white rounded-[20px] shadow-sm border border-cyan-950/20 overflow-hidden flex flex-col transition-all duration-300 ease-in-out min-w-0">
                    {/* Table Header */}
                    <div className="w-full bg-teal-600 h-11 flex items-center px-4 text-white font-bold text-xs uppercase tracking-wide flex-shrink-0">
                        <div className="w-12 text-center">STT</div>
                        <div className="w-24 text-center">Mã đơn</div>

                        {/* Cột Thời gian */}
                        <div className={cn("px-4 transition-all", selectedSale ? "flex-1" : "w-48")}>Thời gian</div>

                        {/* Cột Nhân viên */}
                        <div className={cn("px-4", selectedSale ? "hidden" : "hidden sm:block flex-1")}>Nhân Viên</div>

                        <div className={cn("w-20 text-center", selectedSale ? "hidden" : "block")}>Số SP</div>
                        <div className="w-28 text-right pr-2">Tổng Giá</div>
                        <div className={cn("w-28 text-center", selectedSale ? "hidden" : "hidden md:block")}>Trạng Thái</div>
                        <div className="w-8"></div>
                    </div>

                    {/* Table Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredSales.map((sale, index) => {
                            const shortCode = sale.id.substring(0, 8).toUpperCase(); // Giả lập mã ngắn từ UUID
                            const totalItems = calculateTotalItems(sale);

                            return (
                                <div
                                    key={sale.id}
                                    onClick={() => handleRowClick(sale)}
                                    className={cn(
                                        "w-full h-12 flex items-center px-4 border-b border-gray-100 cursor-pointer transition-all text-sm text-cyan-950 group select-none",
                                        selectedSale?.id === sale.id
                                            ? "bg-teal-50 border-l-4 border-l-teal-600 pl-[12px]"
                                            : "hover:bg-gray-50 bg-white border-l-4 border-l-transparent",
                                        index % 2 !== 0 && selectedSale?.id !== sale.id ? "bg-gray-50/30" : ""
                                    )}
                                >
                                    <div className="w-12 text-center text-gray-500 text-xs">{index + 1}</div>
                                    <div className="w-24 text-center font-bold text-teal-700 truncate" title={shortCode}>
                                        #{shortCode}
                                    </div>

                                    <div className={cn("px-4 truncate text-xs sm:text-sm text-gray-600", selectedSale ? "flex-1" : "w-48")}>
                                        {formatDateTime(sale.createdAt)}
                                    </div>

                                    <div className={cn("px-4 truncate font-medium", selectedSale ? "hidden" : "hidden sm:block flex-1")}>
                                        {sale.cashier.fullName}
                                    </div>

                                    <div className={cn("w-20 text-center", selectedSale ? "hidden" : "block")}>
                                        {totalItems}
                                    </div>

                                    {/* Dùng finalAmount (số tiền thực trả) */}
                                    <div className="w-28 text-right pr-2 font-bold">{formatCurrency(sale.finalAmount)}</div>

                                    <div className={cn("w-28 text-center", selectedSale ? "hidden" : "hidden md:block")}>
                                        {sale.isCompleted ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                                HOÀN THÀNH
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                CHƯA XONG
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-8 flex justify-center">
                                        <ChevronRight className={cn("w-4 h-4 text-gray-300 transition-transform", selectedSale?.id === sale.id && "text-teal-600 translate-x-1")} />
                                    </div>
                                </div>
                            );
                        })}

                        {filteredSales.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                                <FileText className="w-12 h-12 opacity-20" />
                                <p>Không tìm thấy giao dịch nào</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- RIGHT: DETAIL PANEL --- */}
                <div
                    className={cn(
                        "flex-shrink-0 transition-all duration-300 ease-out overflow-hidden flex flex-col h-full",
                        selectedSale ? "w-[400px] opacity-100 translate-x-0 ml-0" : "w-0 opacity-0 translate-x-10 ml-0"
                    )}
                >
                    {selectedSale && (
                        <div className="w-full h-full bg-white rounded-[20px] border border-gray-200 shadow-xl flex flex-col overflow-hidden relative">

                            {/* 1. Header Detail */}
                            <div className="flex-shrink-0 bg-cyan-950 p-4 text-white flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold">#{selectedSale.id.substring(0, 8).toUpperCase()}</h2>
                                        {selectedSale.isCompleted ? (
                                            <Badge className="bg-green-500 hover:bg-green-600 text-white text-[10px] h-5">Hoàn thành</Badge>
                                        ) : (
                                            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-[10px] h-5">Chưa xong</Badge>
                                        )}
                                    </div>
                                    <p className="text-cyan-200 text-xs mt-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {formatDateTime(selectedSale.createdAt)}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCloseDetail}
                                    className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* 2. Staff Info */}
                            <div className="flex-shrink-0 p-3 bg-teal-50/50 border-b border-gray-100 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-cyan-900">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                                        <User className="w-4 h-4 text-teal-700" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Nhân viên</span>
                                        <span className="font-bold">{selectedSale.cashier.fullName}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500">Số lượng SP</span>
                                    <p className="font-bold text-cyan-900">{calculateTotalItems(selectedSale)}</p>
                                </div>
                            </div>

                            {/* 3. Product List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 bg-white">
                                <div className="space-y-3">
                                    {selectedSale.details.map((item) => (
                                        <div key={item.id} className="flex flex-col border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-shadow bg-gray-50/30">
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="text-sm font-semibold text-cyan-950 line-clamp-2 leading-tight">
                                                    {item.productName}
                                                </span>
                                                <span className="text-sm font-bold text-teal-700 whitespace-nowrap">
                                                    {formatCurrency(item.totalPrice)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                                                        SL: <strong className="text-cyan-900">{item.quantity}</strong>
                                                    </span>
                                                    <span>x {formatCurrency(item.unitPrice)}</span>
                                                </div>
                                                {/* Nếu có ghi chú trong detail thì hiển thị */}
                                                {item.note && <span className="italic text-gray-400 text-[10px]">{item.note}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 4. Payment Summary */}
                            <div className="flex-shrink-0 bg-gray-50 p-4 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                                <div className="space-y-1 text-xs sm:text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Hình thức</span>
                                        <span className="font-medium text-cyan-900">
                                            {getPaymentMethodLabel(selectedSale.paymentMethod)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tổng tiền hàng</span>
                                        {/* API trả về totalAmount (chưa trừ discount) */}
                                        <span className="font-medium">{formatCurrency(selectedSale.totalAmount)}</span>
                                    </div>
                                    {selectedSale.discountAmount > 0 && (
                                        <div className="flex justify-between text-red-500">
                                            <span>Giảm giá</span>
                                            <span>-{formatCurrency(selectedSale.discountAmount)}</span>
                                        </div>
                                    )}

                                    <div className="w-full border-t border-dashed border-gray-300 my-2"></div>

                                    <div className="flex justify-between items-end">
                                        <span className="text-base font-bold text-cyan-950">Khách cần trả</span>
                                        <span className="text-xl font-extrabold text-teal-700">{formatCurrency(selectedSale.finalAmount)}</span>
                                    </div>

                                    {/* API JSON không có trường customerGiven (tiền khách đưa) và tiền thừa.
                                Tôi sẽ ẩn dòng này hoặc giả lập nếu cần. Tạm thời hiển thị Ghi chú chung nếu có */}
                                    {selectedSale.note && (
                                        <div className="pt-2 text-xs italic text-gray-500 border-t border-gray-200 mt-2">
                                            Ghi chú: {selectedSale.note}
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <div className="mt-4">
                                    <Button className="w-full h-10 bg-cyan-950 hover:bg-cyan-900 text-white font-bold flex items-center justify-center gap-2 rounded-xl">
                                        <Printer className="w-4 h-4" />
                                        In lại hóa đơn
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesListPage;