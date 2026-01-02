// src/features/sales/pages/CreateSalesPage.tsx

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Trash2, Plus, Minus, QrCode, CreditCard, Banknote } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/utils"; // Hàm utils có sẵn trong dự án của bạn
import { toast } from "sonner";

// --- Types ---
interface Product {
    id: string;
    code: string;
    name: string;
    price: number;
    image: string;
}

interface CartItem extends Product {
    quantity: number;
}

// --- Mock Data (Tạm thời để test giao diện) ---
const MOCK_PRODUCTS: Product[] = [
    { id: "1", code: "7K9P-2WXM", name: "Tập 100 trang", price: 20000, image: "https://placehold.co/60x60" },
    { id: "2", code: "BOOK-001", name: "Đắc Nhân Tâm", price: 85000, image: "https://placehold.co/60x60" },
    { id: "3", code: "PEN-002", name: "Bút bi Thiên Long", price: 5000, image: "https://placehold.co/60x60" },
];

const QUICK_MONEY = [
    1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000
];

export const CreateSalesPage = () => {
    // --- State ---
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "qr">("cash");
    const [amountGiven, setAmountGiven] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    // --- Effects ---
    // Cập nhật thời gian thực
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- Computed ---
    const totalAmount = useMemo(() => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cart]);

    const changeAmount = amountGiven - totalAmount;

    // --- Handlers ---
    const handleAddToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const handleUpdateQuantity = (id: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newQty = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const handleRemoveItem = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const handleQuickMoney = (value: number) => {
        setAmountGiven((prev) => prev + value);
    };

    // Giả lập search (khi enter)
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            // Logic tìm sản phẩm thật sẽ ở đây
            const product = MOCK_PRODUCTS.find(p =>
                p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (product) {
                handleAddToCart(product);
                setSearchQuery("");
            } else {
                toast.error("Không tìm thấy sản phẩm");
            }
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4 p-2 bg-gray-100 font-['Inter']">

            {/* --- LEFT SECTION: PRODUCT LIST & CUSTOMER --- */}
            <div className="flex-1 flex flex-col gap-4 h-full">

                {/* 1. Product Table Area */}
                <Card className="flex-1 flex flex-col overflow-hidden border-cyan-950 rounded-2xl shadow-md">
                    {/* Search Bar */}
                    <div className="p-4 border-b bg-white flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Tìm sản phẩm (F3) - Nhập mã hoặc tên..."
                                className="pl-9 h-10 border-teal-600 focus-visible:ring-teal-600"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="bg-teal-600 text-white font-bold h-12 flex items-center px-4 text-sm uppercase">
                        <div className="w-10 text-center">STT</div>
                        <div className="w-28 text-center">Mã SP</div>
                        <div className="w-20 text-center">Ảnh</div>
                        <div className="flex-1 px-2">Tên Sản phẩm</div>
                        <div className="w-24 text-center">SL</div>
                        <div className="w-28 text-right">Đơn giá</div>
                        <div className="w-28 text-right">Tổng giá</div>
                        <div className="w-10"></div>
                    </div>

                    {/* Table Body (Scrollable) */}
                    <div className="flex-1 overflow-y-auto bg-white">
                        {cart.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                                <Search className="h-10 w-10 opacity-50" />
                                <p>Chưa có sản phẩm nào trong giỏ</p>
                            </div>
                        ) : (
                            cart.map((item, index) => (
                                <div key={item.id} className="flex items-center border-b px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-cyan-950">
                                    <div className="w-10 text-center font-medium">{index + 1}</div>
                                    <div className="w-28 text-center text-gray-600">{item.code}</div>
                                    <div className="w-20 flex justify-center">
                                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover border" />
                                    </div>
                                    <div className="flex-1 px-2 font-medium">{item.name}</div>
                                    <div className="w-24 flex items-center justify-center gap-1">
                                        <button onClick={() => handleUpdateQuantity(item.id, -1)} className="p-1 hover:bg-gray-200 rounded text-teal-700"><Minus size={14} /></button>
                                        <span className="w-8 text-center font-bold border rounded bg-white">{item.quantity}</span>
                                        <button onClick={() => handleUpdateQuantity(item.id, 1)} className="p-1 hover:bg-gray-200 rounded text-teal-700"><Plus size={14} /></button>
                                    </div>
                                    <div className="w-28 text-right">{formatCurrency(item.price)}</div>
                                    <div className="w-28 text-right font-bold text-teal-700">{formatCurrency(item.price * item.quantity)}</div>
                                    <div className="w-10 flex justify-end">
                                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 transition">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* 2. Customer & Summary Area */}
                <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-72">
                    {/* Customer Inputs */}
                    <Card className="flex-1 p-6 border-cyan-950 rounded-2xl flex flex-col gap-4 bg-white shadow-md">
                        <h3 className="font-bold text-cyan-950 flex items-center gap-2">
                            <span className="material-symbols-outlined">person</span> Thông tin khách hàng
                        </h3>
                        <Input
                            placeholder="Nhập họ và tên khách hàng..."
                            className="h-12 rounded-xl border-2 border-teal-100 focus-visible:border-teal-600 transition-colors"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                        <Input
                            placeholder="Nhập số điện thoại..."
                            className="h-12 rounded-xl border-2 border-teal-100 focus-visible:border-teal-600 transition-colors"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                        <Input
                            placeholder="Mã giảm giá (nếu có)"
                            className="h-12 rounded-xl border-dashed border-2 border-gray-300 focus-visible:border-teal-600 transition-colors"
                        />
                    </Card>

                    {/* Price Summary */}
                    <Card className="flex-1 p-6 border-cyan-950 rounded-2xl flex flex-col justify-between bg-white shadow-md">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-gray-600">
                                <span className="text-lg">Tổng tiền hàng</span>
                                <span className="text-2xl font-bold text-cyan-950">{formatCurrency(totalAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                                <span className="text-lg">Giảm giá</span>
                                <span className="text-2xl font-bold text-teal-600">0 ₫</span>
                            </div>
                            <div className="w-full h-[2px] bg-gray-200 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-cyan-950">Khách cần trả</span>
                                <span className="text-3xl font-extrabold text-teal-700">{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* --- RIGHT SECTION: PAYMENT & ACTIONS --- */}
            <div className="w-full lg:w-[400px] flex flex-col gap-4 h-full">

                <Card className="flex-1 border-cyan-950 rounded-2xl shadow-md p-4 flex flex-col bg-white overflow-y-auto">
                    {/* Date Time */}
                    <div className="text-center mb-6">
                        <p className="text-gray-500 text-sm">{formatDateTime(currentTime)}</p>
                        <h2 className="text-xl font-bold text-cyan-950 mt-1">Thanh toán</h2>
                    </div>

                    {/* Payment Method */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <button
                            onClick={() => setPaymentMethod('cash')}
                            className={`h-20 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${paymentMethod === 'cash' ? 'bg-teal-600 text-white border-teal-600' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                                }`}
                        >
                            <Banknote size={24} />
                            <span className="font-bold text-sm">Tiền mặt</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('card')}
                            className={`h-20 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${paymentMethod === 'card' ? 'bg-teal-600 text-white border-teal-600' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                                }`}
                        >
                            <CreditCard size={24} />
                            <span className="font-bold text-sm">Thẻ</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('qr')}
                            className={`h-20 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${paymentMethod === 'qr' ? 'bg-teal-600 text-white border-teal-600' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                                }`}
                        >
                            <QrCode size={24} />
                            <span className="font-bold text-sm">QR Code</span>
                        </button>
                    </div>

                    {/* Payment Calculation */}
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center bg-teal-50 p-3 rounded-lg border border-teal-100">
                            <span className="text-teal-800 font-medium">Khách đưa</span>
                            <Input
                                className="w-40 text-right font-bold text-xl h-10 border-teal-200 focus-visible:ring-teal-600 bg-white"
                                type="number"
                                value={amountGiven || ""}
                                onChange={(e) => setAmountGiven(Number(e.target.value))}
                                placeholder="0"
                            />
                        </div>
                        <div className="flex justify-between items-center px-3">
                            <span className="text-gray-600 font-medium">Tiền thừa trả khách</span>
                            <span className={`text-xl font-bold ${changeAmount < 0 ? 'text-red-500' : 'text-teal-700'}`}>
                                {formatCurrency(Math.max(0, changeAmount))}
                            </span>
                        </div>
                        {changeAmount < 0 && (
                            <div className="text-right text-xs text-red-500">Khách còn thiếu: {formatCurrency(Math.abs(changeAmount))}</div>
                        )}
                    </div>

                    {/* Quick Money Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {QUICK_MONEY.map((amount) => (
                            <button
                                key={amount}
                                onClick={() => handleQuickMoney(amount)}
                                className="h-12 rounded-lg border border-teal-100 bg-white text-teal-700 font-bold text-sm hover:bg-teal-50 hover:border-teal-500 active:scale-95 transition-all shadow-sm"
                            >
                                {amount.toLocaleString()}
                            </button>
                        ))}
                        <button
                            onClick={() => setAmountGiven(0)}
                            className="h-12 rounded-lg bg-red-50 text-red-600 font-bold text-sm border border-red-100 hover:bg-red-100 transition-all col-span-3"
                        >
                            Xóa tiền khách đưa (F7)
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex flex-col gap-3">
                        <Button
                            className="w-full h-14 text-lg font-bold bg-cyan-950 hover:bg-cyan-900 shadow-lg"
                            onClick={() => toast.success("Đã thanh toán thành công!")}
                        >
                            THANH TOÁN & IN (F9)
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-12 text-teal-700 border-teal-600 hover:bg-teal-50 font-bold"
                        >
                            Lưu tạm (F8)
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CreateSalesPage;