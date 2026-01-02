// src/features/sales/pages/CreateSalesPage.tsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Trash2, Plus, Minus, QrCode, CreditCard, Banknote, Printer,
    ScanBarcode, X, Zap, Camera
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/utils";
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

// --- Mock Data ---
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

    // Customer State
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [isLoyalty, setIsLoyalty] = useState(false);

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "qr">("cash");
    const [amountGiven, setAmountGiven] = useState<number>(0);
    const [isPrintInvoice, setIsPrintInvoice] = useState(true);

    // Camera/Scanner State
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [currentTime, setCurrentTime] = useState(new Date());

    // --- Effects ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- Real Camera Logic ---
    useEffect(() => {
        const startCamera = async () => {
            if (isScanning) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: "environment" } // Ưu tiên camera sau trên điện thoại
                    });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    toast.error("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
                    setIsScanning(false);
                }
            }
        };

        if (isScanning) {
            startCamera();
        } else {
            // Cleanup: Tắt camera khi đóng modal
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [isScanning]);

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

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
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

    // Giả lập quét thành công khi click vào video (vì chưa tích hợp thư viện giải mã barcode như zxing)
    const handleSimulateScan = () => {
        // Giả sử quét được sản phẩm đầu tiên
        handleAddToCart(MOCK_PRODUCTS[0]);
        toast.success(`Đã quét: ${MOCK_PRODUCTS[0].name}`);
        // Không tắt modal ngay để có thể quét tiếp, hoặc tắt tùy logic
        // setIsScanning(false); 
    };

    const handlePayment = () => {
        if (cart.length === 0) {
            toast.error("Giỏ hàng đang trống");
            return;
        }
        toast.success(`Thanh toán thành công! ${isPrintInvoice ? '(Đang in hóa đơn...)' : ''}`);
    };

    return (
        // FIX: Thêm select-none để ngăn chặn bôi đen/con trỏ soạn thảo trên text tĩnh
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4 p-2 bg-gray-100 font-['Inter'] relative select-none">

            {/* --- SCANNER MODAL OVERLAY --- */}
            {isScanning && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
                    {/* Header Scanner */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-10">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <ScanBarcode className="text-teal-400" /> Quét mã vạch
                        </h2>
                        <button
                            onClick={() => setIsScanning(false)}
                            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Camera Viewport */}
                    <div className="relative w-full max-w-lg aspect-[3/4] sm:aspect-square bg-black rounded-3xl overflow-hidden border-2 border-gray-800 shadow-2xl">
                        {/* Real Video Element */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            onClick={handleSimulateScan} // Giả lập quét khi click vào màn hình
                            className="absolute inset-0 w-full h-full object-cover"
                        />

                        {/* Scanner Overlay UI */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            {/* Frame */}
                            <div className="relative w-64 h-40 border-2 border-teal-500/50 rounded-lg bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                                {/* Corners */}
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-400 -mt-1 -ml-1 rounded-tl-lg"></div>
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-400 -mt-1 -mr-1 rounded-tr-lg"></div>
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-400 -mb-1 -ml-1 rounded-bl-lg"></div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-400 -mb-1 -mr-1 rounded-br-lg"></div>

                                {/* Laser scanning effect */}
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-[scan_2s_linear_infinite]"></div>
                            </div>
                            <p className="mt-8 text-teal-100 text-sm bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                                Di chuyển camera đến mã vạch
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex gap-4">
                        <Button
                            variant="outline"
                            className="border-teal-500 text-teal-400 hover:bg-teal-950 hover:text-teal-300"
                            onClick={() => toast.info("Đã bật đèn flash (Giả lập)")}
                        >
                            <Zap className="mr-2 h-4 w-4" /> Bật đèn flash
                        </Button>
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => setIsScanning(false)}
                        >
                            Nhập mã thủ công
                        </Button>
                    </div>
                </div>
            )}

            {/* --- LEFT SECTION: PRODUCT LIST & CUSTOMER --- */}
            <div className="flex-1 flex flex-col gap-4 h-full min-h-0">

                {/* 1. Product Table Area */}
                <Card className="flex-1 flex flex-col overflow-hidden border-cyan-950 rounded-2xl shadow-md min-h-0">
                    {/* Search Bar Wrapper */}
                    <div className="p-4 border-b bg-white flex gap-2">
                        <div className="relative flex-1 h-12">
                            <button
                                onClick={() => setIsScanning(true)}
                                className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center text-teal-600 hover:bg-teal-50 hover:text-teal-800 transition-colors rounded-l-md z-10 border-r border-gray-100"
                                title="Bật camera quét mã (F2)"
                            >
                                <ScanBarcode className="h-7 w-7" />
                            </button>
                            <Input
                                placeholder="Nhập tên hoặc mã vạch sản phẩm..."
                                className="pl-16 h-full text-base border-teal-600 focus-visible:ring-teal-600 rounded-lg shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="bg-teal-600 text-white font-bold h-12 flex items-center px-4 text-sm uppercase flex-shrink-0">
                        <div className="w-10 text-center">STT</div>
                        <div className="w-28 text-center">Mã SP</div>
                        <div className="w-20 text-center">Ảnh</div>
                        <div className="flex-1 px-2">Tên Sản phẩm</div>
                        <div className="w-24 text-center">SL</div>
                        <div className="w-28 text-right">Đơn giá</div>
                        <div className="w-28 text-right">Tổng giá</div>
                        <div className="w-10"></div>
                    </div>

                    {/* Table Body */}
                    <div className="flex-1 overflow-y-auto bg-white">
                        {cart.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                                <ScanBarcode className="h-16 w-16 opacity-20" />
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
                                    <div className="flex-1 px-2 font-medium text-base">{item.name}</div>
                                    <div className="w-24 flex items-center justify-center gap-1">
                                        <button onClick={() => handleUpdateQuantity(item.id, -1)} className="p-1 hover:bg-gray-200 rounded text-teal-700"><Minus size={16} /></button>
                                        <span className="w-8 text-center font-bold border rounded bg-white py-1">{item.quantity}</span>
                                        <button onClick={() => handleUpdateQuantity(item.id, 1)} className="p-1 hover:bg-gray-200 rounded text-teal-700"><Plus size={16} /></button>
                                    </div>
                                    <div className="w-28 text-right">{formatCurrency(item.price)}</div>
                                    <div className="w-28 text-right font-bold text-teal-700 text-base">{formatCurrency(item.price * item.quantity)}</div>
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
                <div className="flex flex-col lg:flex-row gap-4 h-auto flex-shrink-0">
                    {/* Customer Inputs */}
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
                            <Label
                                htmlFor="loyalty"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-cyan-900 cursor-pointer select-none"
                            >
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
            </div>

            {/* --- RIGHT SECTION: PAYMENT & ACTIONS --- */}
            <div className="w-full lg:w-[420px] flex flex-col gap-4 h-full min-h-0">

                {/* FIX: Bỏ justify-between, dùng flex-col thường để các phần tử xếp liền nhau từ trên xuống */}
                <Card className="flex-1 border-cyan-950 rounded-2xl shadow-md p-4 flex flex-col bg-white overflow-hidden">

                    {/* --- TOP SCROLLABLE CONTENT (Để khi màn hình nhỏ thì cuộn, màn hình to thì dính liền) --- */}
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto">

                        {/* 1. Date & Title */}
                        <div className="text-center flex-shrink-0">
                            <p className="text-gray-500 text-sm font-medium">{formatDateTime(currentTime)}</p>
                            <h2 className="text-lg font-bold text-cyan-950 mt-1 uppercase tracking-wide">Thanh toán</h2>
                        </div>

                        {/* 2. Payment Method */}
                        <div className="flex gap-2 w-full flex-shrink-0">
                            <button
                                onClick={() => setPaymentMethod('cash')}
                                className={`flex-1 h-16 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${paymentMethod === 'cash' ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                                    }`}
                            >
                                <Banknote size={20} />
                                <span className="font-bold text-xs">Tiền mặt</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={`flex-1 h-16 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${paymentMethod === 'card' ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                                    }`}
                            >
                                <CreditCard size={20} />
                                <span className="font-bold text-xs">Thẻ</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('qr')}
                                className={`flex-1 h-16 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${paymentMethod === 'qr' ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                                    }`}
                            >
                                <QrCode size={20} />
                                <span className="font-bold text-xs">QR Code</span>
                            </button>
                        </div>

                        {/* 3. Calculation */}
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
                                <span className={`text-xl font-bold ${changeAmount < 0 ? 'text-red-500' : 'text-teal-700'}`}>
                                    {formatCurrency(Math.max(0, changeAmount))}
                                </span>
                            </div>
                        </div>

                        {/* 4. Quick Money Grid */}
                        <div className="grid grid-cols-3 gap-2 flex-shrink-0">
                            {QUICK_MONEY.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => handleQuickMoney(amount)}
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

                    {/* 5. Actions Footer (Sẽ luôn nằm dưới cùng card, nhưng ngay sát Quick Money nếu màn hình to) */}
                    <div className="flex flex-col gap-2 flex-shrink-0 pt-4 mt-auto border-t border-gray-100">
                        {/* Checkbox In hóa đơn */}
                        <div className="flex items-center justify-end space-x-2 px-1 mb-1">
                            <Label
                                htmlFor="print-invoice"
                                className="text-xs font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-500 cursor-pointer select-none"
                            >
                                In hóa đơn
                            </Label>
                            <Checkbox
                                id="print-invoice"
                                checked={isPrintInvoice}
                                onCheckedChange={(checked) => setIsPrintInvoice(checked as boolean)}
                                // FIX: Đổi màu bg-cyan-950 thành bg-teal-600 để đồng bộ với checkbox tích điểm
                                className="data-[state=checked]:bg-teal-600 border-teal-600 w-4 h-4"
                            />
                        </div>

                        <Button
                            className="w-full h-12 text-lg font-bold bg-cyan-950 hover:bg-cyan-900 shadow-lg flex items-center gap-2 uppercase"
                            onClick={handlePayment}
                        >
                            {isPrintInvoice && <Printer className="w-5 h-5" />}
                            Thanh toán (F9)
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-10 text-teal-700 border-teal-600 hover:bg-teal-50 font-bold"
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