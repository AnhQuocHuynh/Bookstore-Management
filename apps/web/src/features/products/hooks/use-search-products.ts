// src/features/products/hooks/use-search-products.ts
import { useQuery } from "@tanstack/react-query";
import { productsApi, ProductResponse } from "../api/products.api";

export const useSearchProducts = (keyword: string) => {
    return useQuery<ProductResponse[]>({
        queryKey: ["product-search", keyword],
        queryFn: () => productsApi.search(keyword),
        // Chỉ kích hoạt query khi keyword có độ dài > 0
        enabled: keyword.trim().length > 0,
        // Cache kết quả trong 1 phút để tránh gọi lại API nếu user gõ lại từ khóa cũ
        staleTime: 1000 * 60,
    });
};