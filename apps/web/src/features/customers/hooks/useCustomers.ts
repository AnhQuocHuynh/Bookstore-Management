import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { customerApi } from "../api/customers";

export const useCustomers = () => {
    return useQuery({
        queryKey: ["customers-list"],
        queryFn: () => customerApi.getAll(),
        staleTime: 1000 * 60 * 5, // Cache 5 phút
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: unknown) => customerApi.create(data),
        onSuccess: () => {
            message.success("Thêm khách hàng thành công");
            queryClient.invalidateQueries({ queryKey: ["customers-list"] });
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || "Lỗi khi tạo khách hàng";
            message.error(Array.isArray(msg) ? msg[0] : msg);
        },
    });
};

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: unknown }) => customerApi.update(id, data),
        onSuccess: () => {
            message.success("Cập nhật thông tin thành công");
            queryClient.invalidateQueries({ queryKey: ["customers-list"] });
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || "Lỗi khi cập nhật");
        },
    });
};

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => customerApi.delete(id),
        onSuccess: () => {
            message.success("Đã xóa khách hàng");
            queryClient.invalidateQueries({ queryKey: ["customers-list"] });
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            if (status === 403) message.error("Bạn không có quyền xóa (Chỉ Owner)");
            else if (status === 500) message.error("Không thể xóa khách hàng đã có lịch sử mua hàng");
            else message.error("Lỗi khi xóa khách hàng");
        },
    });
};