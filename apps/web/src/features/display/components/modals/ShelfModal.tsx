import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";
import { CreateShelfDto } from "../../types";

interface ShelfModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: CreateShelfDto) => void;
    initialValues?: any;
    loading?: boolean;
}

export const ShelfModal: React.FC<ShelfModalProps> = ({ open, onClose, onSubmit, initialValues, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialValues) form.setFieldsValue(initialValues);
        }
    }, [open, initialValues, form]);

    return (
        <Modal title={initialValues ? "Cập nhật Kệ" : "Tạo Kệ Mới"} open={open} onCancel={onClose} onOk={() => form.submit()} confirmLoading={loading}>
            <Form form={form} layout="vertical" onFinish={onSubmit}>
                <Form.Item name="name" label="Tên Kệ" rules={[{ required: true }]}>
                    <Input placeholder="VD: Kệ A1" />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={3} placeholder="VD: Gần cửa ra vào..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};