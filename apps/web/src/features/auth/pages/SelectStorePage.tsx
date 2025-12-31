import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, message, Modal, Spin } from "antd";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { authApi } from "../api/auth.api";
import { SelectStoreCard } from "../components/SelectStoreCard";
import { useBookStores } from "../hooks/useBookStores";
import { BookStore } from "../types/bookstore.types";
import { Eye, EyeOff } from "lucide-react";
import { omit } from "lodash";
import { UserProfile } from "@/features/auth/types";

const formSchema = z.object({
  password: z.string().min(1, {
    message: "Vui lòng nhập mật khẩu",
  }),
});

const SelectStorePage = () => {
  const navigate = useNavigate();
  const { accessToken, tempCredentials, setStoreToken } = useAuthStore();

  // Load danh sách cửa hàng
  const { data: stores, isLoading, error } = useBookStores(accessToken || "");

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  // 1. Hàm xử lý đóng Modal
  const handleCancel = () => {
    form.reset();
    setIsOpen(false);
  };

  // 2. Hàm xử lý khi chọn nhà sách
  const handleSelectStore = async (store: BookStore) => {
    // Nếu là nhân viên -> Mở Modal nhập lại mật khẩu
    if (tempCredentials?.role === "EMPLOYEE") {
      setSelectedStoreId(store.id);
      setIsOpen(true);
      return;
    }

    // Nếu là Owner -> Đăng nhập luôn (Logic cũ của bạn)
    if (!accessToken || !tempCredentials) {
      message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      navigate("/auth/login");
      return;
    }

    try {
      const body = {
        email: tempCredentials.email,
        username: tempCredentials.username,
        password: tempCredentials.password,
        bookStoreId: store.id,
      };

      const response = await authApi.bookstoreLogin(accessToken, body);
      const newAccessToken = response.accessToken;

      if (!newAccessToken) throw new Error("Không nhận được Access Token");

      const storeInfo = {
        id: response.bookStoreId,
        name: store.name,
        address: response.profile.address || undefined,
        phone: response.profile.phoneNumber,
      };

      setStoreToken(newAccessToken, storeInfo, response.profile);
      message.success(`Đã vào cửa hàng: ${store.name}`);
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      message.error(
        err?.response?.data?.message || "Đăng nhập vào cửa hàng thất bại",
      );
    }
  };

  // 3. Hàm Submit form nhập mật khẩu (Dành cho Employee)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Kiểm tra dữ liệu đầu vào
    if (
      !(
        accessToken?.trim() &&
        tempCredentials?.username?.trim() &&
        selectedStoreId?.trim()
      )
    ) {
      toast.error("Thiếu thông tin đăng nhập hoặc chưa chọn cửa hàng");
      return;
    }

    setIsLoginLoading(true);
    try {
      // Gọi API đăng nhập vào cửa hàng
      const response = await authApi.bookstoreLogin(accessToken, {
        username: tempCredentials.username.trim(),
        password: values.password.trim(),
        bookStoreId: selectedStoreId,
      });

      // Tìm tên cửa hàng để hiển thị
      const selectedStoreInfo = stores?.find((s) => s.id === selectedStoreId);

      // Lấy accessToken mới
      const newAccessToken = response.accessToken;

      if (!newAccessToken) {
        throw new Error("Không nhận được Access Token từ hệ thống");
      }

      const storeData = {
        id: response.bookStoreId,
        name: selectedStoreInfo?.name || "Cửa hàng",
        address: response.profile.address || selectedStoreInfo?.address,
        phone: response.profile.phoneNumber || selectedStoreInfo?.phoneNumber,
      };

      setStoreToken(newAccessToken, storeData, {
        ...(omit(response.profile, [
          "username",
          "isFirstLogin",
          "employeeCode",
          "role",
        ]) as UserProfile),
        role: "EMPLOYEE",
        isEmailVerified: true,
        employeeProfile: {
          username: response.profile.username || "",
          isFirstLogin: response.profile.isFirstLogin || false,
          employeeCode: response.profile.employeeCode || "",
          role: response.profile.role || "STAFF",
        },
      });

      message.success(`Đăng nhập thành công vào: ${storeData.name}`);
      setIsOpen(false);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login Error Details:", error);

      // Xử lý lỗi token hết hạn
      if (error.response?.status === 410 || error.response?.status === 401) {
        toast.error(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại từ đầu.",
        );
        navigate("/auth/login");
      } else {
        const msg =
          error.response?.data?.message ||
          "Mật khẩu không đúng hoặc có lỗi xảy ra";
        toast.error(msg);
        form.setValue("password", ""); // Xóa mật khẩu
      }
    } finally {
      setIsLoginLoading(false);
    }
  }

  // Nếu không có token từ bước 1 -> Về login
  if (!accessToken) {
    navigate("/auth/login");
    return null;
  }

  return (
    <>
      <div
        className="relative min-h-screen bg-linear-to-br from-teal-50 
      to-cyan-50 flex flex-col items-center p-6 mb-10"
      >
        {/* Background shapes */}
        <div className="absolute top-5 left-5 w-64 h-64 bg-teal-200 opacity-20 rounded-full -z-10"></div>
        <div className="absolute bottom-5 right-5 w-80 h-80 bg-cyan-200 opacity-20 rounded-full -z-10"></div>

        {/* Header */}
        <div className="w-full mb-12 flex flex-col items-center text-center md:text-left">
          <img
            src="/logo.png"
            alt="App Logo"
            className="w-24 h-24 md:w-40 md:h-40"
          />
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-teal-800">
              Chọn chi nhánh làm việc
            </h1>
            <p className="text-teal-700 mt-2 max-w-xl">
              Vui lòng chọn chi nhánh mà bạn sẽ quản lý hoặc làm việc.
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center text-red-500 space-y-4">
            <p>{error.message}</p>
            <Button type="primary" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        )}

        {/* Stores Grid */}
        {!isLoading && stores && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
            {stores.map((store) => (
              <SelectStoreCard
                key={store.id}
                store={store}
                onSelect={handleSelectStore} // Gọi hàm ở đây
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal nhập Password */}
      <Modal
        title="Xác nhận mật khẩu"
        open={isOpen}
        onCancel={handleCancel} // Gọi hàm đóng modal
        centered
        footer={null}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu để đăng nhập vào nhà sách"
                        className="pr-12"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full w-12 flex items-center justify-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoginLoading}
              block
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isLoginLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
        </Form>
      </Modal>
    </>
  );
};

export default SelectStorePage;
