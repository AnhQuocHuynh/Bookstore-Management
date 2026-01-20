import { apiClient } from "../../../lib/axios";

export const userApi = {
  getAll: () => apiClient.get("/user"),
  getById: (id: string) => apiClient.get(`/user/${id}`),
  create: (data: any) => apiClient.post("/user", data),
  getMe: () => apiClient.get("/users/me"),
  updateMe: (payload: any) => apiClient.patch("/users/me", payload),
  uploadAvt: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<{ url: string }>(
      "/files/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data;
  },
};
