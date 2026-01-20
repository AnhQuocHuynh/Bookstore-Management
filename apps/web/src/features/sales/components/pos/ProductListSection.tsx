import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScanBarcode, Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils";
import { CartItem } from "@/features/sales/types/pos.types";
import { useSearchProducts } from "@/features/products/hooks/use-search-products";
import { ProductResponse } from "@/features/products/api/products.api";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

interface ProductListSectionProps {
    cart: CartItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemoveItem: (id: string) => void;
    onAddToCart: (product: ProductResponse) => void;
    onOpenScanner: () => void;
}

export const ProductListSection = ({
    cart,
    onUpdateQuantity,
    onRemoveItem,
    onAddToCart,
    onOpenScanner,
}: ProductListSectionProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Lấy thêm biến error từ hook
    const {
        data: searchResults,
        isLoading: isSearching,
        error // <--- Lấy thêm lỗi
    } = useSearchProducts(debouncedSearch);

    const handleSelectProduct = (product: ProductResponse) => {
        onAddToCart(product);
        setSearchQuery("");
        setShowDropdown(false);
    };



    return (
        <Card className="flex-1 flex flex-col overflow-hidden border-cyan-950 rounded-2xl shadow-md min-h-0">
            {/* Search Bar */}
            <div className="p-4 border-b bg-white flex gap-2 relative z-20">
                <div className="relative flex-1 h-12">
                    <button
                        onClick={onOpenScanner}
                        className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center text-teal-600 hover:bg-teal-50 border-r border-gray-100 rounded-l-md"
                        title="F2: Quét mã"
                    >
                        <ScanBarcode className="h-7 w-7" />
                    </button>
                    <Input
                        placeholder="Tìm tên hoặc mã sản phẩm..."
                        className="pl-16 h-full text-base border-teal-600 focus-visible:ring-teal-600 rounded-lg shadow-sm"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    />

                    {/* Dropdown Results */}
                    {showDropdown && searchQuery.trim().length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-[400px] overflow-y-auto z-50">
                            {isSearching ? (
                                <div className="p-4 text-center text-gray-500 flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin h-4 w-4" /> Đang tìm kiếm...
                                </div>
                            ) : error ? (
                                // --- HIỂN THỊ LỖI ---
                                <div className="p-4 text-center text-red-500">
                                    Có lỗi xảy ra: {(error as any).message || "Không thể tải dữ liệu"}
                                </div>
                            ) : searchResults && searchResults.length > 0 ? (
                                <ul>
                                    {searchResults.map((product) => (
                                        <li
                                            key={product.id}
                                            className="px-4 py-3 hover:bg-teal-50 cursor-pointer border-b last:border-0 flex items-center gap-3 transition-colors"
                                            onClick={() => handleSelectProduct(product)}
                                        >
                                            <img
                                                src={product.imageUrl || "https://placehold.co/40x40"}
                                                alt={product.name}
                                                className="w-10 h-10 object-cover rounded border bg-gray-100"
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold text-cyan-950 text-sm">{product.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">
                                                        {product.sku}
                                                    </span>
                                                    <span className="font-bold text-teal-700">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-center text-gray-500">Không tìm thấy sản phẩm</div>
                            )}
                        </div>
                    )}
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
                <div className="w-28 text-right">Thành tiền</div>
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
                                <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:bg-gray-200 rounded text-teal-700">
                                    <Minus size={16} />
                                </button>
                                <span className="w-8 text-center font-bold border rounded bg-white py-1">{item.quantity}</span>
                                <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:bg-gray-200 rounded text-teal-700">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="w-28 text-right">{formatCurrency(item.price)}</div>
                            <div className="w-28 text-right font-bold text-teal-700 text-base">
                                {formatCurrency(item.price * item.quantity)}
                            </div>
                            <div className="w-10 flex justify-end">
                                <button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700 transition">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};