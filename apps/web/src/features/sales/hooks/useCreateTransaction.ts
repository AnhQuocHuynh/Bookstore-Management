import { useMutation, useQueryClient } from "@tanstack/react-query";
import { salesApi } from "../api/sales.api";
import { CreateTransactionDto } from "../types/sales.types";
import { toast } from "sonner";

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTransactionDto) => salesApi.create(data),
        onSuccess: (data) => {
            toast.success("Thanh toán thành công!");
            // Invalidate query để refresh danh sách đơn hàng nếu cần
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
        onError: (error: any) => {
            // Xử lý lỗi từ server trả về
            const msg = error.response?.data?.message || "Lỗi khi tạo giao dịch";
            toast.error(msg);
        },
    });
};