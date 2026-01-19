import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Button, message, Spin } from "antd";
import { EmployeeFormData } from "../types";
import { uploadApi } from "@/api/upload";
import dayjs from "dayjs";

interface EmployeeEditPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: EmployeeFormData) => void;
    initialData?: EmployeeFormData;
}

export const EmployeeEditPanel: React.FC<EmployeeEditPanelProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}) => {
    const [form] = Form.useForm();
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [rawFile, setRawFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            form.setFieldsValue({
                fullName: initialData.fullName,
                email: initialData.email,
                phone: initialData.phone,
                address: initialData.address,
                dateOfBirth: initialData.dateOfBirth ? dayjs(initialData.dateOfBirth) : null,
            });
            setAvatarUrl(initialData.avatarUrl || "");
            setRawFile(null);
            setIsDirty(false);
        } else if (!isOpen) {
            form.resetFields();
            setAvatarUrl("");
            setRawFile(null);
            setIsDirty(false);
        }
    }, [isOpen, initialData, form]);

    const handleClose = () => {
        if (isDirty || rawFile) {
            Modal.confirm({
                title: "Bạn có chắc muốn hủy những thay đổi?",
                okText: "Có",
                cancelText: "Không",
                onOk: onClose,
            });
        } else {
            onClose();
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setRawFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarUrl(previewUrl);
            setIsDirty(true);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsUploading(true);

            let finalAvatarUrl = avatarUrl;
            if (rawFile) {
                try {
                    finalAvatarUrl = await uploadApi.uploadFile(rawFile);
                } catch (error) {
                    message.error("Upload ảnh thất bại. Vui lòng thử lại.");
                    setIsUploading(false);
                    return;
                }
            }

            // Tạo partial form data cho update (chỉ gửi các field được phép edit)
            const formData = {
                fullName: values.fullName,
                email: values.email,
                phone: values.phone,
                address: values.address,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : undefined,
                avatarUrl: finalAvatarUrl || undefined,
            } as EmployeeFormData;

            onSubmit(formData);

            setIsDirty(false);
            setRawFile(null);
        } catch (error) {
            message.error("Vui lòng kiểm tra lại thông tin");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            width={1000}
            centered
            footer={null}
            destroyOnClose={true}
            closeIcon={<span className="text-3xl text-[#102e3c] cursor-pointer hover:opacity-70">×</span>}
            styles={{
                body: { backgroundColor: "#D4E5E4", padding: 0 },
                mask: { backgroundColor: "rgba(16, 46, 60, 0.5)" },
            }}
            title={null}
        >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#D4E5E4", borderRadius: 12, zIndex: 0 }} />

            <div className="bg-[#D4E5E4] rounded-xl p-8 relative" style={{ zIndex: 1 }}>
                <h2 className="text-center text-3xl font-bold text-[#102e3c] mb-8">Cập Nhật Thông Tin Nhân Viên</h2>

                <div className="flex gap-8 justify-center">
                    {/* Avatar Upload Area */}
                    <div className="flex-shrink-0 w-[280px] flex flex-col items-center">
                        <div className="relative w-64 h-64 bg-gray-300 rounded-full border-4 border-[#102e3c] flex items-center justify-center overflow-hidden group cursor-pointer hover:border-[#1a998f] transition-colors">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            )}
                            <input type="file" accept="image/*" onChange={handleAvatarChange} className="absolute inset-0 opacity-0 cursor-pointer" />

                            {/* Loading overlay khi đang upload */}
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                    <Spin size="large" />
                                </div>
                            )}
                        </div>
                        <p className="text-center text-sm text-[#102e3c] mt-4">Chọn ảnh đại diện</p>
                    </div>

                    <div className="flex-1">
                        <Form form={form} layout="vertical" requiredMark={false} className="space-y-4" onValuesChange={() => setIsDirty(true)}>
                            <Form.Item
                                name="fullName"
                                label={<span className="text-lg font-semibold text-[#102e3c]">Họ và Tên:</span>}
                                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                            >
                                <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label={<span className="text-lg font-semibold text-[#102e3c]">Email:</span>}
                                rules={[
                                    { required: true, message: "Vui lòng nhập email" },
                                    { type: "email", message: "Email không hợp lệ" }
                                ]}
                            >
                                <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label={<span className="text-lg font-semibold text-[#102e3c]">Số Điện Thoại:</span>}
                                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                            >
                                <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                            </Form.Item>

                            <Form.Item
                                name="address"
                                label={<span className="text-lg font-semibold text-[#102e3c]">Địa Chỉ:</span>}
                                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                            >
                                <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                            </Form.Item>

                            <Form.Item
                                name="dateOfBirth"
                                label={<span className="text-lg font-semibold text-[#102e3c]">Ngày Sinh:</span>}
                            >
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày sinh"
                                    className="w-full border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]"
                                    style={{ fontSize: 18 }}
                                />
                            </Form.Item>
                        </Form>
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={isUploading}
                        disabled={isUploading}
                        className="h-12 px-20 rounded-2xl bg-[#1a998f] text-2xl font-bold border-none hover:bg-[#158f85]"
                    >
                        {isUploading ? "Đang xử lý..." : "Cập Nhật"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
