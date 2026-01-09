import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventory";
import { InventoryParams } from "../types";

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