import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProductListSection } from "@/features/sales/components/pos/ProductListSection";
import { CustomerSection } from "@/features/sales/components/pos/CustomerSection";
import { PaymentSection } from "@/features/sales/components/pos/PaymentSection";
import { ScannerModal } from "@/features/sales/components/pos/ScannerModal";
import { CartItem, PaymentMethod } from "@/features/sales/types/pos.types";
import { ProductResponse } from "@/features/products/api/products.api";
import { Customer } from "@/features/sales/hooks/use-search-customers";

import { useAuthStore } from "@/stores/useAuthStore";
import { useCreateTransaction } from "@/features/sales/hooks/useCreateTransaction";
import { useCalculateTransaction } from "@/features/sales/hooks/use-calculate-transaction";
import { CreateTransactionDto, CalculateTransactionDto } from "@/features/sales/types/sales.types";
import { useDebounce } from "@/hooks/use-debounce";

export const CreateSalesPage = () => {
    // --- State ---
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const [amountGiven, setAmountGiven] = useState<number>(0);
    const [isPrintInvoice, setIsPrintInvoice] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // --- Backend Calculation State ---
    const [backendTotals, setBackendTotals] = useState({
        totalAmount: 0,
        taxAmount: 0,
        finalAmount: 0
    });

    // --- Hooks ---
    const { user } = useAuthStore();
    const { mutate: createTransaction, isPending: isPaying } = useCreateTransaction();
    const { mutate: calculateTransaction, isPending: isCalculating } = useCalculateTransaction();

    const debouncedCart = useDebounce(cart, 500);

    // --- Clock Effect ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- Calculation Logic (FIX LỖI 1: setState trong useEffect) ---
    useEffect(() => {
        if (debouncedCart.length === 0) {
            // Chỉ reset nếu giá trị hiện tại khác 0 để tránh re-render liên tục
            if (backendTotals.finalAmount !== 0) {
                setBackendTotals({ totalAmount: 0, taxAmount: 0, finalAmount: 0 });
            }
            return;
        }

        const payload: CalculateTransactionDto = {
            createTransactionDetailDtos: debouncedCart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                unitPrice: item.price
            }))
        };

        calculateTransaction(payload, {
            onSuccess: (data) => {
                setBackendTotals({
                    totalAmount: data.totalAmount,
                    taxAmount: data.taxAmount,
                    finalAmount: data.finalAmount
                });
            },
            onError: (error: any) => {
                if (error?.response?.status === 403) {
                    toast.error("Không có quyền tính toán đơn hàng (Chỉ Employee).");
                } else {
                    toast.error("Lỗi đồng bộ giá với hệ thống");
                }
            }
        });
        // Thêm backendTotals.finalAmount vào dependency để useEffect biết khi nào cần chạy lại logic check 0
    }, [debouncedCart, calculateTransaction, backendTotals.finalAmount]);

    // Derived State
    const changeAmount = amountGiven - backendTotals.finalAmount;

    // --- Handlers ---
    const handleAddToCart = (product: ProductResponse) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, {
                id: product.id,
                code: product.sku,
                name: product.name,
                price: product.price,
                image: product.imageUrl || "",
                quantity: 1,
            }];
        });
        toast.success(`Đã thêm: ${product.name}`);
    };

    const handleUpdateQuantity = (id: string, delta: number) => {
        setCart((prev) => prev.map((item) => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handleRemoveItem = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const handlePayment = () => {
        // Validation
        if (cart.length === 0) return toast.error("Giỏ hàng trống");
        if (user?.role !== "EMPLOYEE") return toast.error("Chỉ nhân viên mới được thanh toán");
        if (amountGiven < backendTotals.finalAmount) return toast.error("Khách đưa chưa đủ tiền");

        // FIX LỖI 2: Map Payment Method (Frontend 'qr' -> Backend 'bank_transfer')
        let finalPaymentMethod: "cash" | "card" | "bank_transfer" | "e_wallet" = "cash";

        if (paymentMethod === "qr") {
            finalPaymentMethod = "bank_transfer"; // Backend không có 'qr', map sang chuyển khoản
        } else {
            finalPaymentMethod = paymentMethod as any;
        }

        const payload: CreateTransactionDto = {
            createTransactionDetailDtos: cart.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
                unitPrice: item.price,
            })),
            totalAmount: backendTotals.totalAmount,
            taxAmount: backendTotals.taxAmount,
            finalAmount: backendTotals.finalAmount,
            paidAmount: amountGiven,
            changeAmount: changeAmount,
            paymentMethod: finalPaymentMethod,
            customerId: selectedCustomer?.id,
            note: selectedCustomer ? `Khách hàng: ${selectedCustomer.fullName}` : "Khách lẻ",
        };

        createTransaction(payload, {
            onSuccess: (data) => {
                if (isPrintInvoice) toast.info(`Đang in hóa đơn #${data.id.substring(0, 8)}...`);
                setCart([]);
                setAmountGiven(0);
                setSelectedCustomer(null);
                setBackendTotals({ totalAmount: 0, taxAmount: 0, finalAmount: 0 });
            },
        });
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4 p-2 bg-gray-100 font-['Inter'] relative select-none">
            {isScanning && (
                <ScannerModal onClose={() => setIsScanning(false)} onScan={(code) => toast.info(code)} />
            )}

            {/* --- LEFT SECTION (Cột Trái) --- */}
            <div className="flex-1 flex flex-col gap-4 h-full min-h-0">

                {/* 1. Customer Section (THAY ĐỔI: Đưa lên trên) */}
                <div className="flex-shrink-0">
                    <CustomerSection
                        selectedCustomer={selectedCustomer}
                        onSelectCustomer={setSelectedCustomer}
                    />
                </div>

                {/* 2. Product List (Ở dưới, chiếm hết chiều cao còn lại) */}
                <ProductListSection
                    cart={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onAddToCart={handleAddToCart}
                    onOpenScanner={() => setIsScanning(true)}
                />
            </div>

            {/* --- RIGHT SECTION (Cột Phải) --- */}
            <div className="w-full lg:w-[420px] flex flex-col gap-4 h-full min-h-0">
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
                    subTotal={backendTotals.totalAmount}
                    taxAmount={backendTotals.taxAmount}
                    finalAmount={backendTotals.finalAmount}
                    isCalculating={isCalculating}
                    isPaying={isPaying}
                />
            </div>
        </div>
    );
};

export default CreateSalesPage;