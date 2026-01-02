import { apiClient } from "../../../lib/axios";

export const userApi = {
  getAll: () => apiClient.get("/user"),
  getById: (id: string) => apiClient.get(`/user/${id}`),
  create: (data: any) => apiClient.post("/user", data),
  getMe: () => apiClient.get("/users/me"),
  updateMe: (payload: any) => apiClient.patch("/users/me", payload),
};
