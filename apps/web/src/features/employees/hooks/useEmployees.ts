import { useQuery } from "@tanstack/react-query";
import { employeesApi } from "../api/employees";

export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => employeesApi.getAll(),
  });
};
