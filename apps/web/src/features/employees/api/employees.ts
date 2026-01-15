import { apiClient } from "@/lib/axios";

export const employeesApi = {

  // Lấy danh sách (trả về Array<Employee>)

  getAll: async () => {
    const response = await apiClient.get("/employee");
    return response.data;
  },

  getById: (id: string) => apiClient.get(`/employee/${id}`),
  
  create: (data: any) => apiClient.post("/employee", data),

  update: (id: string, data: any) => apiClient.patch(`/employee/${id}`, data),

  delete: (id: string) => apiClient.delete(`/employee/${id}`),

};
