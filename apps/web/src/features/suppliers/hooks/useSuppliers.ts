import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { supplierApi } from "../api/suppliers";

// Hook lấy danh sách
export const useSuppliers = () => {
  return useQuery({
    queryKey: ["suppliers-list"],
    queryFn: () => supplierApi.getAll(),
    staleTime: 1000 * 60 * 5,
  });
};

// --- Hook Tạo mới ---
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) => supplierApi.create(data),
    onSuccess: () => {
      message.success("Thêm nhà cung cấp thành công");
      queryClient.invalidateQueries({ queryKey: ["suppliers-list"] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 409) message.error("Email hoặc SĐT đã tồn tại");
      else if (status === 403) message.error("Bạn không có quyền thực hiện (Chỉ Owner)");
      else message.error("Lỗi khi tạo nhà cung cấp");
    },
  });
};

// --- Hook Cập nhật ---
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => supplierApi.update(id, data),
    onSuccess: () => {
      message.success("Cập nhật nhà cung cấp thành công");
      queryClient.invalidateQueries({ queryKey: ["suppliers-list"] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 409) message.error("Email hoặc SĐT trùng với NCC khác");
      else if (status === 403) message.error("Bạn không có quyền thực hiện");
      else message.error("Lỗi khi cập nhật");
    },
  });
};

// --- Hook Xóa ---
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supplierApi.delete(id),
    onSuccess: (data) => {
      message.success("Đã xóa nhà cung cấp");
      // API trả về danh sách mới nhất sau khi xóa, ta có thể set trực tiếp hoặc invalidate
      // Ở đây invalidate cho an toàn và đồng bộ
      queryClient.invalidateQueries({ queryKey: ["suppliers-list"] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 403) message.error("Bạn không có quyền xóa (Chỉ Owner)");
      else message.error("Lỗi khi xóa nhà cung cấp");
    },
  });
};