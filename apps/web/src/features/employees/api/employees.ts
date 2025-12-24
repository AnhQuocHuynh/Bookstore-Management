import { apiClient } from "../../../lib/axios";

export const employeesApi = {
  getAll: () => apiClient.get("/employees"),
  getById: (id: string) => apiClient.get(`/employees/${id}`),
  create: (data: any) => apiClient.post("/employees", data),
};
