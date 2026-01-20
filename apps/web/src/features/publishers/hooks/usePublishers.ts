import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { publisherApi } from "../api/publishers";

export const usePublishers = () => {
    return useQuery({
        queryKey: ["publishers-list"],
        queryFn: () => publisherApi.getAll(),
        staleTime: 1000 * 60 * 5, // Cache 5 phút
    });
};

export const useCreatePublisher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: unknown) => publisherApi.create(data),
        onSuccess: () => {
            message.success("Thêm nhà xuất bản thành công");
            queryClient.invalidateQueries({ queryKey: ["publishers-list"] });
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            if (status === 409) message.error("Tên, Email hoặc SĐT đã tồn tại");
            else if (status === 403) message.error("Bạn không có quyền thực hiện (Chỉ Owner)");
            else message.error("Lỗi khi tạo nhà xuất bản");
        },
    });
};

export const useUpdatePublisher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: unknown }) => publisherApi.update(id, data),
        onSuccess: () => {
            message.success("Cập nhật nhà xuất bản thành công");
            queryClient.invalidateQueries({ queryKey: ["publishers-list"] });
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            if (status === 409) message.error("Tên, Email hoặc SĐT đã trùng với NXB khác");
            else if (status === 403) message.error("Bạn không có quyền thực hiện");
            else message.error("Lỗi khi cập nhật");
        },
    });
};

export const useDeletePublisher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => publisherApi.delete(id),
        onSuccess: () => {
            message.success("Đã xóa nhà xuất bản");
            // API xóa trả về danh sách mới, nên invalidate để lấy lại (hoặc set data trực tiếp nếu muốn tối ưu)
            queryClient.invalidateQueries({ queryKey: ["publishers-list"] });
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            if (status === 403) message.error("Bạn không có quyền xóa (Chỉ Owner)");
            else message.error("Lỗi khi xóa nhà xuất bản");
        },
    });
};