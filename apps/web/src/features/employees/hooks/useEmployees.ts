import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { employeesApi } from "../api/employees";

// Hook lấy danh sách
export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees-list"],
    queryFn: () => employeesApi.getAll(),
    staleTime: 1000 * 60 * 5,
  });
};

// --- Hook Tạo mới ---
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) => employeesApi.create(data),
    onSuccess: () => {
      message.success("Thêm nhân viên thành công");
      queryClient.invalidateQueries({ queryKey: ["employees-list"] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 409) message.error("Email hoặc SĐT đã tồn tại");
      else if (status === 403) message.error("Bạn không có quyền thực hiện");
      else message.error("Lỗi khi tạo nhân viên");
    },
  });
};

// --- Hook Cập nhật ---
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => employeesApi.update(id, data),
    onSuccess: () => {
      message.success("Cập nhật nhân viên thành công");
      queryClient.invalidateQueries({ queryKey: ["employees-list"] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 409) message.error("Email hoặc SĐT trùng với nhân viên khác");
      else if (status === 403) message.error("Bạn không có quyền thực hiện");
      else message.error("Lỗi khi cập nhật");
    },
  });
};

// --- Hook Xóa ---
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => {
      message.success("Đã xóa nhân viên");
      queryClient.invalidateQueries({ queryKey: ["employees-list"] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 403) message.error("Bạn không có quyền xóa");
      else message.error("Lỗi khi xóa nhân viên");
    },
  });
};
