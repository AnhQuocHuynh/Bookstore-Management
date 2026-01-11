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
            width={800}
            centered
            footer={null}
            destroyOnClose={true}
            title={null}
            closeIcon={<span className="text-2xl text-[#102e3c] hover:opacity-70">×</span>}
            styles={{ body: { padding: 0 }, mask: { backgroundColor: "rgba(16, 46, 60, 0.5)" } }}
        >
            <div className="bg-[#D4E5E4] rounded-lg p-6">
                <h2 className="text-center text-2xl font-bold text-[#102e3c] mb-6">Thêm Khách Hàng</h2>

                <Form form={form} layout="vertical" onValuesChange={() => setIsDirty(true)}>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="fullName" label={<span className="font-semibold">Họ và Tên</span>} rules={[{ required: true, message: "Bắt buộc nhập" }]}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>
                        <Form.Item name="phoneNumber" label={<span className="font-semibold">Số Điện Thoại</span>} rules={[{ required: true, message: "Bắt buộc nhập" }]}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>
                    </div>

                    <Form.Item name="email" label={<span className="font-semibold">Email</span>} rules={[{ required: true, message: "Bắt buộc nhập" }, { type: 'email', message: "Email không hợp lệ" }]}>
                        <Input className="border-[#102e3c]" />
                    </Form.Item>

                    <Form.Item name="address" label={<span className="font-semibold">Địa Chỉ</span>} rules={[{ required: true, message: "Bắt buộc nhập" }]}>
                        <Input className="border-[#102e3c]" />
                    </Form.Item>

                    <Form.Item name="note" label={<span className="font-semibold">Ghi Chú</span>}>
                        <Input.TextArea rows={3} className="border-[#102e3c]" />
                    </Form.Item>

                    <div className="flex justify-center mt-6">
                        <Button type="primary" onClick={handleSubmit} className="bg-[#1a998f] hover:bg-[#158f85] h-10 px-10 font-bold rounded-xl border-none">
                            Thêm Khách Hàng
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );
};