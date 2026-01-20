import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import type { CreateBookStoreDto } from "../types";
import { bookstoreApi } from "../api/bookstore.api";

type CreateBookStoreResponse =
  | {
      message?: string;
      data?: unknown;
    }
  | unknown;

export const useCreateBookStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookStoreDto) => bookstoreApi.create(payload),
    onSuccess: (data: CreateBookStoreResponse) => {
      const msg =
        typeof data === "object" && data && "message" in data
          ? (data as any).message
          : undefined;
      message.success(msg || "Tạo chi nhánh thành công");
      queryClient.invalidateQueries({ queryKey: ["bookstores"] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.message;

      if (status === 403)
        message.error("Bạn không có quyền thực hiện (Chỉ Owner)");
      else if (status === 409)
        message.error("Tên hoặc SĐT chi nhánh đã tồn tại");
      else if (status === 400) {
        // Check if it's a token refresh issue
        const msg = serverMsg || "Dữ liệu không hợp lệ";
        if (msg.includes("đăng xuất và đăng nhập lại")) {
          message.error(msg);
        } else {
          message.error(msg);
        }
      }
      else if (status === 404) {
        message.error(serverMsg || "Không tìm thấy cơ sở dữ liệu khả dụng");
      } else if (status === 401)
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      else message.error(serverMsg || "Lỗi khi tạo chi nhánh");
    },
  });
};

