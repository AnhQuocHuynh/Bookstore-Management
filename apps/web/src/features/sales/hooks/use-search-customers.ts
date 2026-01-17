// src/features/sales/hooks/use-search-customers.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

// Định nghĩa nhanh type Customer nếu chưa export từ module khác
export interface Customer {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    customerCode: string;
}

const searchCustomers = async (keyword: string): Promise<Customer[]> => {
    if (!keyword) return [];
    // Gọi API danh sách khách hàng với params lọc
    const response = await apiClient.get<Customer[]>("/customers", {
        params: { phoneNumber: keyword } // Hoặc 'email': keyword tùy logic backend
    });
    return response.data;
};

export const useSearchCustomers = (keyword: string) => {
    return useQuery({
        queryKey: ["search-customers", keyword],
        queryFn: () => searchCustomers(keyword),
        enabled: keyword.length >= 3, // Chỉ tìm khi nhập >= 3 ký tự
        staleTime: 1000 * 60,
    });
};