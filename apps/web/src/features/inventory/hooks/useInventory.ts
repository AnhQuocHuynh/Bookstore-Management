// src/features/inventory/hooks/useInventory.ts
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventory";
import { InventoryParams } from "../types";

// Hook lấy danh sách sản phẩm (có filter)
export const useInventory = (params: InventoryParams) => {
  return useQuery({
    queryKey: ["inventory", params], // Key thay đổi theo params để trigger fetch lại
    queryFn: () => inventoryApi.getAll(params),
    staleTime: 1000 * 60, // 1 phút
  });
};

// Hook lấy danh mục
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories-list"],
    queryFn: () => inventoryApi.getCategories(),
    staleTime: 1000 * 60 * 5, // 5 phút
  });
};

// Hook lấy nhà cung cấp
export const useSuppliersList = () => {
  return useQuery({
    queryKey: ["suppliers-list"],
    queryFn: () => inventoryApi.getSuppliers(),
    staleTime: 1000 * 60 * 5,
  });
};