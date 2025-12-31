import { customersApi } from "@/features/customers/api/customers";
import { useQuery } from "@tanstack/react-query";

export const useGetCustomers = (userId: string) => {
  return useQuery({
    queryKey: [`${userId}/customers`],
    queryFn: customersApi.getAll,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!userId,
  });
};
