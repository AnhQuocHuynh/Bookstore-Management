// src/features/auth/pages/SelectStorePage.tsx
import { useNavigate } from "react-router-dom";
import { message, Spin, Empty, Button } from "antd";
import { useBookStores } from "../hooks/useBookStores";
import { SelectStoreCard } from "../components/SelectStoreCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { authApi } from "../api/auth.api";
import { BookStore } from "../types/bookstore.types";

const SelectStorePage = () => {
    const navigate = useNavigate();
    const { accessToken, tempCredentials, setAccessToken, setStore, clearTemp } = useAuthStore();
    const { data: stores, isLoading, error } = useBookStores(accessToken || "");

    const handleSelectStore = async (store: BookStore) => {
        if (!tempCredentials || !accessToken) {
            message.error("Dữ liệu tạm thời bị mất. Vui lòng đăng nhập lại.");
            navigate("/auth/login");
            return;
        }

        try {
            const body = {
                ...tempCredentials,
                bookStoreId: store.id,
            };

            const response = await authApi.bookstoreLogin(accessToken, body);

            const newAccessToken = response.accessToken;
            if (!newAccessToken) throw new Error("Không nhận được accessToken");

            setAccessToken(newAccessToken);
            setStore({
                id: store.id,
                name: store.name,
                address: store.address,
                phone: store.phoneNumber,
            });

            clearTemp(); // Xóa temp credentials
            message.success(`Đã chọn và đăng nhập nhà sách: ${store.name}`);
            navigate("/dashboard");
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Đăng nhập nhà sách thất bại");
        }
    };

    if (!accessToken) {
        navigate("/auth/login");
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-teal-800 mb-3">
                        Chọn nhà sách của bạn
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Bạn đang quản lý nhiều nhà sách. Vui lòng chọn một nhà sách để bắt đầu làm việc với{" "}
                        <span className="font-bold text-teal-600">BookFlow</span>.
                    </p>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center py-20">
                        <Spin size="large" />
                        <p className="mt-4 text-lg text-gray-600">Đang tải danh sách nhà sách...</p>
                    </div>
                )}

                {/* Error */}
                {error && !isLoading && (
                    <div className="text-center py-20">
                        <p className="text-red-600 text-lg mb-4">
                            {error.message || "Không thể tải danh sách nhà sách"}
                        </p>
                        <Button type="primary" onClick={() => window.location.reload()}>
                            Thử lại
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && (!stores || stores.length === 0) && (
                    <div className="text-center py-20">
                        <Empty description="Bạn chưa có nhà sách nào" />
                        <Button
                            type="primary"
                            size="large"
                            className="mt-6"
                            onClick={() => navigate("/auth/register")}
                        >
                            Tạo nhà sách mới
                        </Button>
                    </div>
                )}

                {/* Danh sách nhà sách */}
                {!isLoading && !error && stores && stores.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
    );
};

export default SelectStorePage;