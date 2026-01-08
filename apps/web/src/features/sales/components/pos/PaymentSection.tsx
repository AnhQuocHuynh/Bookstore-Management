import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Banknote, CreditCard, QrCode, X, Printer } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/utils";
import { PaymentMethod } from "@/features/sales/types/pos.types";

const QUICK_MONEY = [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];

interface PaymentSectionProps {
    currentTime: Date;
    paymentMethod: PaymentMethod;
    setPaymentMethod: (val: PaymentMethod) => void;
    amountGiven: number;
    setAmountGiven: (val: number | ((prev: number) => number)) => void;
    changeAmount: number;
    isPrintInvoice: boolean;
    setIsPrintInvoice: (val: boolean) => void;
    onPayment: () => void;
}

export const PaymentSection = ({
    currentTime,
    paymentMethod,
    setPaymentMethod,
    amountGiven,
    setAmountGiven,
    changeAmount,
    isPrintInvoice,
    setIsPrintInvoice,
    onPayment,
}: PaymentSectionProps) => {
    return (
        <div className="w-full lg:w-[420px] flex flex-col gap-4 h-full min-h-0">
            <Card className="flex-1 border-cyan-950 rounded-2xl shadow-md p-4 flex flex-col bg-white overflow-hidden">
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                    <div className="text-center flex-shrink-0">
                        <p className="text-gray-500 text-sm font-medium">{formatDateTime(currentTime)}</p>
                        <h2 className="text-lg font-bold text-cyan-950 mt-1 uppercase tracking-wide">Thanh toán</h2>
                    </div>

                    {/* Payment Method */}
                    <div className="flex gap-2 w-full flex-shrink-0">
                        {[
                            { id: "cash", icon: Banknote, label: "Tiền mặt" },
                            { id: "card", icon: CreditCard, label: "Thẻ" },
                            { id: "qr", icon: QrCode, label: "QR Code" },
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                                className={`flex-1 h-16 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${paymentMethod === m.id
                                        ? "bg-teal-600 text-white border-teal-600 shadow-md"
                                        : "bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100"
                                    }`}
                            >
                                <m.icon size={20} />
                                <span className="font-bold text-xs">{m.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Calculation */}
                    <div className="space-y-3 flex-shrink-0">
                        <div className="flex justify-between items-center bg-teal-50 p-3 rounded-lg border border-teal-100">
                            <span className="text-teal-900 font-bold text-sm">KHÁCH ĐƯA</span>
                            <Input
                                className="w-40 text-right font-extrabold text-xl h-10 border-teal-200 focus-visible:ring-teal-600 bg-white text-teal-800"
                                type="number"
                                value={amountGiven || ""}
                                onChange={(e) => setAmountGiven(Number(e.target.value))}
                                placeholder="0"
                            />
                        </div>
                        <div className="flex justify-between items-center px-3 py-1">
                            <span className="text-gray-600 font-medium text-sm">Tiền thừa trả khách</span>
                            <span className={`text-xl font-bold ${changeAmount < 0 ? "text-red-500" : "text-teal-700"}`}>
                                {formatCurrency(Math.max(0, changeAmount))}
                            </span>
                        </div>
                    </div>

                    {/* Quick Money */}
                    <div className="grid grid-cols-3 gap-2 flex-shrink-0">
                        {QUICK_MONEY.map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setAmountGiven((prev) => prev + amount)}
                                className="h-10 rounded-lg border border-teal-100 bg-white text-teal-700 font-bold text-xs hover:bg-teal-50 hover:border-teal-500 active:scale-95 transition-all shadow-sm"
                            >
                                {amount.toLocaleString()}
                            </button>
                        ))}
                        <button
                            onClick={() => setAmountGiven(0)}
                            className="h-10 rounded-lg bg-red-50 text-red-600 font-bold text-xs border border-red-100 hover:bg-red-100 transition-all col-span-3 flex items-center justify-center gap-2"
                        >
                            <X size={14} /> Xóa tiền khách đưa (F7)
                        </button>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0 pt-4 mt-auto border-t border-gray-100">
                    <div className="flex items-center justify-end space-x-2 px-1 mb-1">
                        <Label htmlFor="print-invoice" className="text-xs font-semibold text-gray-500 cursor-pointer select-none">
                            In hóa đơn
                        </Label>
                        <Checkbox
                            id="print-invoice"
                            checked={isPrintInvoice}
                            onCheckedChange={(checked) => setIsPrintInvoice(checked as boolean)}
                            className="data-[state=checked]:bg-teal-600 border-teal-600 w-4 h-4"
                        />
                    </div>
                    <Button
                        className="w-full h-12 text-lg font-bold bg-cyan-950 hover:bg-cyan-900 shadow-lg flex items-center gap-2 uppercase"
                        onClick={onPayment}
                    >
                        {isPrintInvoice && <Printer className="w-5 h-5" />}
                        Thanh toán (F9)
                    </Button>
                    <Button variant="outline" className="w-full h-10 text-teal-700 border-teal-600 hover:bg-teal-50 font-bold">
                        Lưu tạm (F8)
                    </Button>
                </div>
            </Card>
        </div>
    );
};