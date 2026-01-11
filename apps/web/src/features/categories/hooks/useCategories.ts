import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { categoryApi } from "../api/categories";

export const useCategories = () => {
    return useQuery({
        queryKey: ["categories-list"],
        queryFn: () => categoryApi.getAll(),
        staleTime: 1000 * 60 * 5,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: unknown) => categoryApi.create(data),
        onSuccess: () => {
            message.success("Thêm danh mục thành công");
            queryClient.invalidateQueries({ queryKey: ["categories-list"] });
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            if (status === 409) message.error("Tên danh mục hoặc Slug đã tồn tại");
            else message.error("Lỗi khi tạo danh mục");
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: unknown }) => categoryApi.update(id, data),
        onSuccess: () => {
            message.success("Cập nhật danh mục thành công");
            queryClient.invalidateQueries({ queryKey: ["categories-list"] });
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            if (status === 409) message.error("Tên hoặc Slug bị trùng");
            else message.error("Lỗi khi cập nhật danh mục");
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => categoryApi.delete(id),
        onSuccess: () => {
            message.success("Đã xóa danh mục");
            queryClient.invalidateQueries({ queryKey: ["categories-list"] });
        },
        onError: () => {
            message.error("Lỗi khi xóa danh mục");
        },
    });
};