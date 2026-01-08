import React from "react";

export const TopSellingProducts = () => {
    return (
        <div>
            <h3 className="text-cyan-950 text-2xl font-bold mb-4">Các sản phẩm bán chạy:</h3>
            <div className="bg-white rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-4 border-b pb-4">
                    <img src="https://placehold.co/60x60" alt="product" className="w-15 h-15 rounded-lg object-cover" />
                    <div className="flex-1">
                        <div className="text-lg font-medium">Tập 100 trang</div>
                        <div className="text-gray-400 text-sm">7K9P-2WXM</div>
                    </div>
                    <div className="text-right">
                        <div className="text-teal-600 font-bold text-lg">2,000,000</div>
                        <div className="text-xs text-gray-500">12.71%</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <img src="https://placehold.co/60x60" alt="product" className="w-15 h-15 rounded-lg object-cover" />
                    <div className="flex-1">
                        <div className="text-lg font-medium">Sách văn học mới</div>
                        <div className="text-gray-400 text-sm">B5ND-L8QY</div>
                    </div>
                    <div className="text-right">
                        <div className="text-teal-600 font-bold text-lg">1,550,000</div>
                        <div className="text-xs text-gray-500">9.85%</div>
                    </div>
                </div>
            </div>
        </div>
    );
};