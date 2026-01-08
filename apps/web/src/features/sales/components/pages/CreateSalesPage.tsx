import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ProductListSection } from "@/features/sales/components/pos/ProductListSection";
import { CustomerSection } from "@/features/sales/components/pos/CustomerSection";
import { PaymentSection } from "@/features/sales/components/pos/PaymentSection";
import { ScannerModal } from "@/features/sales/components/pos/ScannerModal";
import { CartItem, PaymentMethod } from "@/features/sales/types/pos.types";
import { ProductResponse } from "@/features/products/api/products.api";

// --- MOCK DATA FOR SIMULATION (Nếu cần) ---
const MOCK_PRODUCTS: any[] = [
    { id: "1", code: "7K9P-2WXM", name: "Tập 100 trang", price: 20000, image: "https://placehold.co/60x60" },
];

export const CreateSalesPage = () => {
    // --- State ---
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [isLoyalty, setIsLoyalty] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const [amountGiven, setAmountGiven] = useState<number>(0);
    const [isPrintInvoice, setIsPrintInvoice] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // --- Effects ---
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
    const handleAddToCart = (product: ProductResponse) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [
                ...prev,
                {
                    id: product.id,
                    code: product.sku,
                    name: product.name,
                    price: product.price,
                    image: product.imageUrl || "https://placehold.co/60x60?text=NoImage",
                    quantity: 1,
                },
            ];
        });
        toast.success(`Đã thêm: ${product.name}`);
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

    const handleScanSuccess = (code: string) => {
        // Logic khi quét mã thật: Gọi API lấy product theo mã code
        // Ở đây giả lập lấy sản phẩm đầu tiên
        // Trong thực tế: const product = await productsApi.getByCode(code);
        const mockProduct: ProductResponse = {
            id: "1", sku: "7K9P-2WXM", name: "Tập 100 trang", price: 20000,
            description: "", type: "stationery", isActive: true
        };
        handleAddToCart(mockProduct);
        // Không đóng modal để quét tiếp, hoặc đóng tùy yêu cầu
        // setIsScanning(false);
    };

    const handlePayment = () => {
        if (cart.length === 0) {
            toast.error("Giỏ hàng đang trống");
            return;
        }
        toast.success(`Thanh toán thành công! ${isPrintInvoice ? "(Đang in hóa đơn...)" : ""}`);
        // Reset state sau khi thanh toán
        setCart([]);
        setAmountGiven(0);
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4 p-2 bg-gray-100 font-['Inter'] relative select-none">
            {/* Scanner Modal */}
            {isScanning && (
                <ScannerModal onClose={() => setIsScanning(false)} onScan={handleScanSuccess} />
            )}

            {/* LEFT SECTION */}
            <div className="flex-1 flex flex-col gap-4 h-full min-h-0">
                <ProductListSection
                    cart={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onAddToCart={handleAddToCart}
                    onOpenScanner={() => setIsScanning(true)}
                />
                <CustomerSection
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    customerPhone={customerPhone}
                    setCustomerPhone={setCustomerPhone}
                    isLoyalty={isLoyalty}
                    setIsLoyalty={setIsLoyalty}
                    totalAmount={totalAmount}
                />
            </div>

            {/* RIGHT SECTION */}
            <PaymentSection
                currentTime={currentTime}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                amountGiven={amountGiven}
                setAmountGiven={setAmountGiven}
                changeAmount={changeAmount}
                isPrintInvoice={isPrintInvoice}
                setIsPrintInvoice={setIsPrintInvoice}
                onPayment={handlePayment}
            />
        </div>
    );
};

export default CreateSalesPage;