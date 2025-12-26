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

const formSchema = z.object({
  password: z.string().min(1, {
    message: "Vui lòng nhập mật khẩu",
  }),
});

const SelectStorePage = () => {
  const navigate = useNavigate();
  const { accessToken, tempCredentials, setStoreToken } = useAuthStore();
  const { data: stores, isLoading, error } = useBookStores(accessToken || "");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (
      !(
        accessToken?.trim() &&
        tempCredentials?.username?.trim() &&
        selectedStoreId?.trim()
      )
    ) {
      return;
    }

    setIsLoginLoading(true);

    try {
      const response = await authApi.bookstoreLogin(accessToken, {
        username: tempCredentials.username.trim(),
        password: values.password.trim(),
        bookStoreId: selectedStoreId,
      });

      console.log(response);
    } catch (error: any) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(msg);
    } finally {
      setIsLoginLoading(false);
    }
  }

  const handleCancel = () => {
    form.reset();
    setIsOpen(false);
  };

  const handleSelectStore = async (store: BookStore) => {
    if (tempCredentials?.role === "EMPLOYEE") {
      setSelectedStoreId(store.id);
      setIsOpen(true);
      return;
    }

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

      const finalUser = {
        id: response.profile.id,
        email: response.profile.email,
        name: response.profile.fullName,
        role: response.profile.role,
        avatar: response.profile.avatarUrl || undefined,
      };

      const storeInfo = {
        id: response.bookStoreId,
        name: store.name,
        address: response.profile.address || undefined,
        phone: response.profile.phoneNumber,
      };

      setStoreToken(newAccessToken, storeInfo, finalUser);
      message.success(`Đã vào cửa hàng: ${store.name}`);
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      message.error(
        err?.response?.data?.message || "Đăng nhập vào cửa hàng thất bại",
      );
    }
  };

  if (!accessToken) {
    navigate("/auth/login");
    return null;
  }

  return (
    <>
      <div
        className="relative min-h-screen bg-linear-to-br
    from-teal-50 to-cyan-50 flex flex-col items-center p-6 mb-10"
      >
        {/* Decorative background shapes */}
        <div className="absolute top-5 left-5 w-64 h-64 bg-teal-200 opacity-20 rounded-full -z-10"></div>
        <div className="absolute bottom-5 right-5 w-80 h-80 bg-cyan-200 opacity-20 rounded-full -z-10"></div>

        {/* Hero section */}
        <div className="w-full mb-12 flex flex-col items-center text-center md:text-left">
          {/* Logo bên trái */}
          <img
            src="/logo.png"
            alt="App Logo"
            className="w-24 h-24 md:w-40 md:h-40"
          />

          {/* Title & description bên phải */}
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
                onSelect={handleSelectStore}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        title="Xác nhận mật khẩu"
        open={isOpen}
        onCancel={handleCancel}
        centered
        footer={null}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <Button type="primary" htmlType="submit" loading={isLoginLoading}>
              {isLoginLoading ? "Đang xử lý đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </Form>
      </Modal>
    </>
  );
};

export default SelectStorePage;
