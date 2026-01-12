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
            // Lấy message chi tiết từ backend nếu có
            const backendMsg = error?.response?.data?.message;
            const status = error?.response?.status;

            if (status === 409) {
                message.error("Email hoặc Số điện thoại đã tồn tại trong hệ thống.");
            } else if (status === 400) {
                // Hiển thị lỗi validation cụ thể từ backend
                // Backend thường trả về: { message: ["email must be an email", ...] }
                if (Array.isArray(backendMsg)) {
                    message.error(backendMsg[0]);
                } else {
                    message.error(backendMsg || "Dữ liệu không hợp lệ (Lỗi 400)");
                }
            } else if (status === 403) {
                message.error("Bạn không có quyền thực hiện (Chỉ Owner)");
            } else {
                message.error("Lỗi khi tạo tác giả");
            }
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
            // Logic hiển thị lỗi chi tiết
            const backendMsg = error?.response?.data?.message;
            const status = error?.response?.status;

            if (status === 409) {
                message.error("Cập nhật thất bại: Email hoặc SĐT đã tồn tại ở tác giả khác.");
            } else if (status === 400) {
                if (Array.isArray(backendMsg)) {
                    message.error(backendMsg[0]); // Lỗi validation cụ thể
                } else {
                    message.error(backendMsg || "Dữ liệu không hợp lệ (Lỗi 400)");
                }
            } else if (status === 403) {
                message.error("Bạn không có quyền thực hiện.");
            } else {
                message.error("Lỗi khi cập nhật tác giả");
            }
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