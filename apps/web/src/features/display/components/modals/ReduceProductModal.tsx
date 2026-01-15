import React from "react";
import { Modal, Form, InputNumber } from "antd";

interface ReduceProductModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    maxQuantity: number;
}

export const ReduceProductModal: React.FC<ReduceProductModalProps> = ({ open, onClose, onSubmit, maxQuantity }) => {
    const [form] = Form.useForm();

    return (
        <Modal title="Rút hàng về kho" open={open} onCancel={onClose} onOk={() => form.submit()} destroyOnClose>
            <p className="text-gray-500 mb-4">Sản phẩm sẽ được xóa khỏi kệ và cộng lại vào tồn kho.</p>
            <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={{ quantity: 1 }}>
                <Form.Item name="quantity" label="Số lượng rút về" rules={[{ required: true }]}>
                    <InputNumber min={1} max={maxQuantity} className="w-full" />
                </Form.Item>
            </Form>
        </Modal>
    );
};