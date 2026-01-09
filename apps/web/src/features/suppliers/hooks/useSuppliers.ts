import { useQuery } from "@tanstack/react-query";
import { supplierApi } from "../api/suppliers";

const getSuppliers = async () => {
  const response = await supplierApi.getAll();
  return response.data;
};

export const useSuppliers = () => {
  return useQuery({
    queryKey: ["supplier"],
    queryFn: getSuppliers,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
