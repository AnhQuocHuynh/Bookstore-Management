import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventory";
import { InventoryParams } from "../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

export const useInventory = (params: InventoryParams) => {
  // Loại bỏ các key có giá trị undefined, null hoặc chuỗi rỗng để tránh lỗi Backend
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== "")
  );

  return useQuery({
    queryKey: ["inventory", cleanParams],
    queryFn: () => inventoryApi.getAll(cleanParams),
    staleTime: 1000 * 60, // Cache 1 phút
    retry: false, // Không tự động gọi lại nếu lỗi (để dễ debug)
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories-list"],
    queryFn: () => inventoryApi.getCategories(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSuppliersList = () => {
  return useQuery({
    queryKey: ["suppliers-list"],
    queryFn: () => inventoryApi.getSuppliers(),
    staleTime: 1000 * 60 * 5,
  });
};

// --- THÊM MỚI: Hook xóa sản phẩm ---
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.delete(id),
    onSuccess: () => {
      message.success("Đã xóa sản phẩm thành công");
      // Làm mới danh sách sản phẩm ngay lập tức
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error: any) => {
      // Xử lý các mã lỗi từ Backend trả về
      const status = error?.response?.status;
      if (status === 403) {
        message.error("Bạn không có quyền xóa sản phẩm này (Chỉ Owner)");
      } else if (status === 409) {
        message.warning("Sản phẩm này đã bị xóa hoặc ngừng kinh doanh trước đó");
      } else if (status === 404) {
        message.error("Không tìm thấy sản phẩm");
      } else {
        message.error("Có lỗi xảy ra khi xóa sản phẩm");
      }
    },
  });
};

// --- THÊM MỚI: Hook Cập nhật sản phẩm ---
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => inventoryApi.update(id, data),
    onSuccess: () => {
      message.success("Cập nhật sản phẩm thành công");
      // Làm mới danh sách để hiển thị dữ liệu mới nhất
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 409) {
        message.error("Tên sản phẩm hoặc SKU đã tồn tại");
      } else if (status === 404) {
        message.error("Không tìm thấy sản phẩm");
      } else if (status === 403) {
        message.error("Bạn không có quyền sửa sản phẩm này");
      } else {
        message.error("Lỗi khi cập nhật sản phẩm");
      }
    },
  });
};