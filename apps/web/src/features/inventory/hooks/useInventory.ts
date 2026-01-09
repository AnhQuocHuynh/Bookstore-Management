import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventory";

const getInventory = async () => {
  const response = await inventoryApi.getAll();
  return response.data;
};

export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
