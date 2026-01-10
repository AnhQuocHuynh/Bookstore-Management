import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { PublisherFormData } from "../types";

interface PublisherEditPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PublisherFormData) => void;
    initialData?: PublisherFormData;
}

export const PublisherEditPanel: React.FC<PublisherEditPanelProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}) => {
    const [form] = Form.useForm();
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue(initialData);
        }
    }, [initialData, form]);

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
                title: "Hủy thay đổi?",
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
            width={700}
            centered
            footer={null}
            destroyOnClose={true}
            title={null}
            closeIcon={<span className="text-2xl text-[#102e3c] hover:opacity-70">×</span>}
            styles={{ body: { padding: 0 }, mask: { backgroundColor: "rgba(16, 46, 60, 0.5)" } }}
        >
            <div className="bg-[#D4E5E4] rounded-lg p-6">
                <h2 className="text-center text-2xl font-bold text-[#102e3c] mb-6">Cập Nhật Nhà Xuất Bản</h2>

                <Form form={form} layout="vertical" onValuesChange={() => setIsDirty(true)}>
                    <Form.Item name="name" label={<span className="font-semibold">Tên Nhà Xuất Bản</span>} rules={[{ required: true }]}>
                        <Input className="border-[#102e3c]" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="email" label={<span className="font-semibold">Email</span>} rules={[{ type: 'email' }]}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>
                        <Form.Item name="phone" label={<span className="font-semibold">Số Điện Thoại</span>}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="address" label={<span className="font-semibold">Địa Chỉ</span>}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>
                        <Form.Item name="website" label={<span className="font-semibold">Website</span>} rules={[{ type: 'url' }]}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>
                    </div>

                    <Form.Item name="description" label={<span className="font-semibold">Mô Tả</span>}>
                        <Input.TextArea rows={3} className="border-[#102e3c]" />
                    </Form.Item>

                    <div className="flex justify-center mt-6 gap-3">
                        <Button onClick={onClose} className="h-10 px-6 rounded-xl border-[#102e3c]">Hủy</Button>
                        <Button type="primary" onClick={handleSubmit} className="bg-[#1a998f] hover:bg-[#158f85] h-10 px-8 font-bold rounded-xl border-none">
                            Cập Nhật
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );
};