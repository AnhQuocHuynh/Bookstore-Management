import { useQuery } from "@tanstack/react-query";
import { supplierApi } from "../api/suppliers";

export const useSuppliers = () => {
  return useQuery({
    queryKey: ["suppliers-list"],
    queryFn: () => supplierApi.getAll(),
    staleTime: 1000 * 60 * 5, // Cache 5 phút vì danh sách NCC ít thay đổi
  });
};