import { useQuery } from "@tanstack/react-query";
import { supplierApi } from "../api/suppliers";

export const useSupplier = () => {
  return useQuery({
    queryKey: ["supplier"],
    queryFn: () => supplierApi.getAll(),
  });
};