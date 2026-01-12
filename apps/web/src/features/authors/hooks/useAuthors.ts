import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { authorApi } from "../api/authors";

export const useAuthors = (keyword?: string) => {
    return useQuery({
        queryKey: ["authors-list", keyword],
        queryFn: () => authorApi.getAll(keyword),
        // Giữ cache lâu một chút để trải nghiệm mượt mà
        staleTime: 1000 * 60 * 2,
    });
};

export const useCreateAuthor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: unknown) => authorApi.create(data),
        onSuccess: () => {
            message.success("Thêm tác giả thành công");
            queryClient.invalidateQueries({ queryKey: ["authors-list"] });
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            if (status === 409) message.error("Email hoặc SĐT đã tồn tại");
            else if (status === 403) message.error("Bạn không có quyền (Chỉ Owner)");
            else message.error("Lỗi khi tạo tác giả");
        },
    });
};

export const useUpdateAuthor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: unknown }) => authorApi.update(id, data),
        onSuccess: () => {
            message.success("Cập nhật tác giả thành công");
            queryClient.invalidateQueries({ queryKey: ["authors-list"] });
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            if (status === 409) message.error("Email hoặc SĐT trùng lặp");
            else if (status === 403) message.error("Bạn không có quyền thực hiện");
            else message.error("Lỗi khi cập nhật");
        },
    });
};

export const useDeleteAuthor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => authorApi.delete(id),
        onSuccess: () => {
            message.success("Đã xóa tác giả");
            queryClient.invalidateQueries({ queryKey: ["authors-list"] });
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            if (status === 403) message.error("Bạn không có quyền xóa (Chỉ Owner)");
            else message.error("Lỗi khi xóa tác giả");
        },
    });
};