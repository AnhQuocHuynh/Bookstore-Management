import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserCheck, X, Loader2, UserPlus } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchCustomers, Customer } from "../../hooks/use-search-customers";

interface CustomerSectionProps {
    selectedCustomer: Customer | null;
    onSelectCustomer: (customer: Customer | null) => void;
}

export const CustomerSection = ({
    selectedCustomer,
    onSelectCustomer,
}: CustomerSectionProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showResults, setShowResults] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 500);
    const { data: customers, isLoading } = useSearchCustomers(debouncedSearch);

    const handleSelect = (cus: Customer) => {
        onSelectCustomer(cus);
        setSearchTerm("");
        setShowResults(false);
    };

    const handleClear = () => {
        onSelectCustomer(null);
        setSearchTerm("");
    };

    return (
        <Card className="p-4 border-cyan-950 rounded-2xl flex flex-col gap-3 bg-white shadow-md relative z-30">
            <h3 className="font-bold text-cyan-950 flex items-center gap-2">
                <span className="material-symbols-outlined">person</span> Khách hàng
            </h3>

            {selectedCustomer ? (
                // --- VIEW: ĐÃ CHỌN KHÁCH ---
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 relative flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="w-10 h-10 bg-teal-200 rounded-full flex items-center justify-center text-teal-800 flex-shrink-0">
                        <UserCheck size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-cyan-950 text-sm truncate">{selectedCustomer.fullName}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>{selectedCustomer.phoneNumber}</span>
                            {selectedCustomer.email && <span className="truncate">• {selectedCustomer.email}</span>}
                        </div>
                    </div>
                    <button
                        onClick={handleClear}
                        className="p-1.5 hover:bg-white rounded-full text-red-500 hover:shadow-sm transition-all"
                        title="Bỏ chọn"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                // --- VIEW: TÌM KIẾM ---
                <div className="relative group">
                    <div className="relative">
                        {/* FIX CĂN CHỈNH: Dùng top-3 (12px) cho input h-10 (40px) */}
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />

                        <Input
                            placeholder="Tìm SĐT hoặc Email khách..."
                            className="pl-9 h-10 rounded-xl border-2 border-gray-100 focus-visible:border-teal-600 focus-visible:ring-0 transition-all"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                            onBlur={() => setTimeout(() => setShowResults(false), 200)}
                        />

                        {isLoading && (
                            <div className="absolute right-3 top-3 pointer-events-none">
                                <Loader2 className="animate-spin w-4 h-4 text-teal-600" />
                            </div>
                        )}
                    </div>

                    {/* Dropdown Kết quả */}
                    {showResults && searchTerm.length >= 1 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                            {customers && customers.length > 0 ? (
                                customers.map((cus) => (
                                    <div
                                        key={cus.id}
                                        onClick={() => handleSelect(cus)}
                                        className="p-3 hover:bg-teal-50 cursor-pointer border-b last:border-0 transition-colors flex items-center justify-between group/item"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm text-cyan-950 group-hover/item:text-teal-700 transition-colors">{cus.fullName}</p>
                                            <p className="text-xs text-gray-500">{cus.phoneNumber}</p>
                                        </div>
                                        <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 group-hover/item:bg-teal-100 group-hover/item:text-teal-800">
                                            {cus.customerCode}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                !isLoading && searchTerm.length >= 3 && (
                                    <div className="p-4 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                                        <p>Không tìm thấy khách hàng</p>
                                        <Button size="sm" variant="outline" className="h-8 text-xs">
                                            <UserPlus className="w-3 h-3 mr-1" /> Tạo mới nhanh
                                        </Button>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};