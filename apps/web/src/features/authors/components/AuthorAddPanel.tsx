import React, { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { AuthorFormData } from "../types";

interface AuthorAddPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AuthorFormData) => void;
}

export const AuthorAddPanel: React.FC<AuthorAddPanelProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [form] = Form.useForm();
    const [isDirty, setIsDirty] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // --- XỬ LÝ DỮ LIỆU TRƯỚC KHI GỬI ---
            // Chuyển chuỗi rỗng "" thành undefined để API không báo lỗi 400 (Bad Request)
            // đặc biệt là với các trường có tính duy nhất như email, phone
            const cleanData: AuthorFormData = {
                fullName: values.fullName,
                penName: values.penName || undefined,
                email: values.email || undefined,
                phone: values.phone || undefined,
                nationality: values.nationality || undefined,
                bio: values.bio || undefined,
            };

            onSubmit(cleanData);
            // Logic reset sẽ được xử lý ở afterClose
        } catch (error) {
            // Form validation failed
        }
    };

    const handleClose = () => {
        if (isDirty) {
            Modal.confirm({
                title: "Hủy tạo mới?",
                content: "Dữ liệu chưa lưu sẽ bị mất.",
                okText: "Đóng",
                onOk: onClose,
            });
        } else {
            onClose();
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            afterClose={() => {
                form.resetFields();
                setIsDirty(false);
            }}
            width={1200}
            centered
            footer={null}
            destroyOnClose={true}
            title={null}
            closeIcon={<span className="text-3xl text-[#102e3c] cursor-pointer hover:opacity-70">×</span>}
            styles={{
                body: { backgroundColor: "#D4E5E4", padding: 0 },
                mask: { backgroundColor: "rgba(16, 46, 60, 0.5)" },
            }}
        >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#D4E5E4", borderRadius: 12, zIndex: 0 }} />

            <div className="bg-[#D4E5E4] rounded-xl p-8 relative" style={{ zIndex: 1 }}>
                <h2 className="text-center text-3xl font-bold text-[#102e3c] mb-8">Thêm Tác Giả Mới</h2>

                <div className="flex justify-center">
                    <div className="w-full max-w-3xl">
                        <Form form={form} layout="vertical" requiredMark={false} className="space-y-4" onValuesChange={() => setIsDirty(true)}>
                            <div className="grid grid-cols-2 gap-6">
                                <Form.Item name="fullName" label={<span className="text-lg font-semibold text-[#102e3c]">Họ và Tên:</span>} rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>
                                <Form.Item name="penName" label={<span className="text-lg font-semibold text-[#102e3c]">Bút Danh:</span>}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Form.Item name="nationality" label={<span className="text-lg font-semibold text-[#102e3c]">Quốc Tịch:</span>}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>
                                <Form.Item name="phone" label={<span className="text-lg font-semibold text-[#102e3c]">Số Điện Thoại:</span>}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>
                            </div>

                            <Form.Item name="email" label={<span className="text-lg font-semibold text-[#102e3c]">Email:</span>} rules={[{ type: 'email', message: "Email không hợp lệ" }]}>
                                <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                            </Form.Item>

                            <Form.Item name="bio" label={<span className="text-lg font-semibold text-[#102e3c]">Tiểu Sử:</span>}>
                                <Input.TextArea rows={3} className="border-2 border-[#102e3c] rounded-lg bg-transparent text-lg resize-none focus:border-[#1a998f] hover:border-[#1a998f]" />
                            </Form.Item>
                        </Form>
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <Button type="primary" onClick={handleSubmit} className="h-12 px-20 rounded-2xl bg-[#1a998f] text-2xl font-bold border-none hover:bg-[#158f85]">
                        Lưu Tác Giả
                    </Button>
                </div>
            </div>
        </Modal>
    );
};