import React, { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { CustomerFormData } from "../types";

interface CustomerAddPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CustomerFormData) => void;
}

export const CustomerAddPanel: React.FC<CustomerAddPanelProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [form] = Form.useForm();
    const [isDirty, setIsDirty] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
            setIsDirty(false);
        } catch { }
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
                <h2 className="text-center text-3xl font-bold text-[#102e3c] mb-8">Thêm Khách Hàng Mới</h2>

                <div className="flex justify-center">
                    <div className="w-full max-w-3xl">
                        <Form form={form} layout="vertical" requiredMark={false} className="space-y-4" onValuesChange={() => setIsDirty(true)}>
                            <div className="grid grid-cols-2 gap-6">
                                <Form.Item name="fullName" label={<span className="text-lg font-semibold text-[#102e3c]">Họ và Tên:</span>} rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>
                                <Form.Item name="phoneNumber" label={<span className="text-lg font-semibold text-[#102e3c]">Số Điện Thoại:</span>} rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>
                            </div>

                            <Form.Item name="email" label={<span className="text-lg font-semibold text-[#102e3c]">Email:</span>} rules={[{ required: true, message: "Vui lòng nhập email" }, { type: 'email', message: "Email không hợp lệ" }]}>
                                <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                            </Form.Item>

                            <Form.Item name="address" label={<span className="text-lg font-semibold text-[#102e3c]">Địa Chỉ:</span>} rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
                                <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                            </Form.Item>

                            <Form.Item name="note" label={<span className="text-lg font-semibold text-[#102e3c]">Ghi Chú:</span>}>
                                <Input.TextArea rows={3} className="border-2 border-[#102e3c] rounded-lg bg-transparent text-lg resize-none focus:border-[#1a998f] hover:border-[#1a998f]" />
                            </Form.Item>
                        </Form>
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        className="h-12 px-20 rounded-2xl bg-[#1a998f] text-2xl font-bold border-none hover:bg-[#158f85]"
                    >
                        Thêm Khách Hàng
                    </Button>
                </div>
            </div>
        </Modal>
    );
};