import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils";

interface CustomerSectionProps {
    customerName: string;
    setCustomerName: (val: string) => void;
    customerPhone: string;
    setCustomerPhone: (val: string) => void;
    isLoyalty: boolean;
    setIsLoyalty: (val: boolean) => void;
    totalAmount: number;
}

export const CustomerSection = ({
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    isLoyalty,
    setIsLoyalty,
    totalAmount,
}: CustomerSectionProps) => {
    return (
        <div className="flex flex-col lg:flex-row gap-4 h-auto flex-shrink-0">
            {/* Customer Info */}
            <Card className="flex-1 p-5 border-cyan-950 rounded-2xl flex flex-col gap-3 bg-white shadow-md">
                <h3 className="font-bold text-cyan-950 flex items-center gap-2">
                    <span className="material-symbols-outlined">person</span> Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                        placeholder="Họ tên khách hàng..."
                        className="h-10 rounded-xl border-2 border-teal-100 focus-visible:border-teal-600"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <Input
                        placeholder="Số điện thoại..."
                        className="h-10 rounded-xl border-2 border-teal-100 focus-visible:border-teal-600"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                </div>
                <Input
                    placeholder="Mã giảm giá (nếu có)"
                    className="h-10 rounded-xl border-dashed border-2 border-gray-300 focus-visible:border-teal-600"
                />
                <div className="flex items-center space-x-2 mt-1">
                    <Checkbox
                        id="loyalty"
                        checked={isLoyalty}
                        onCheckedChange={(checked) => setIsLoyalty(checked as boolean)}
                        className="data-[state=checked]:bg-teal-600 border-teal-600"
                    />
                    <Label htmlFor="loyalty" className="text-sm font-medium text-cyan-900 cursor-pointer select-none">
                        Tích điểm thành viên
                    </Label>
                </div>
            </Card>

            {/* Price Summary */}
            <Card className="flex-1 p-5 border-cyan-950 rounded-2xl flex flex-col justify-center bg-white shadow-md">
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-gray-600">
                        <span className="text-base">Tổng tiền hàng</span>
                        <span className="text-xl font-bold text-cyan-950">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                        <span className="text-base">Giảm giá</span>
                        <span className="text-xl font-bold text-teal-600">0 ₫</span>
                    </div>
                    <div className="w-full h-[2px] bg-gray-200 my-1"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-cyan-950">Khách cần trả</span>
                        <span className="text-3xl font-extrabold text-teal-700">{formatCurrency(totalAmount)}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};