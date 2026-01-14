import React from "react";
import { Modal, Form, Select, InputNumber } from "antd";
import { useShelves } from "../../hooks/useDisplay";

interface MoveProductModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    currentShelfId?: string; // Để loại trừ kệ hiện tại khỏi danh sách
    maxQuantity: number;
}

export const MoveProductModal: React.FC<MoveProductModalProps> = ({ open, onClose, onSubmit, currentShelfId, maxQuantity }) => {
    const [form] = Form.useForm();
    const { data: shelves } = useShelves();

    // Loại trừ kệ hiện tại
    const targetShelves = shelves?.filter(s => s.id !== currentShelfId) || [];

    return (
        <Modal title="Di chuyển sản phẩm" open={open} onCancel={onClose} onOk={() => form.submit()} destroyOnClose>
            <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={{ quantity: maxQuantity }}>
                <Form.Item name="targetShelfId" label="Chuyển đến Kệ" rules={[{ required: true }]}>
                    <Select placeholder="Chọn kệ đích" options={targetShelves.map(s => ({ label: s.name, value: s.id }))} />
                </Form.Item>
                <Form.Item name="quantity" label="Số lượng chuyển" rules={[{ required: true }]}>
                    <InputNumber min={1} max={maxQuantity} className="w-full" />
                </Form.Item>
            </Form>
        </Modal>
    );
};