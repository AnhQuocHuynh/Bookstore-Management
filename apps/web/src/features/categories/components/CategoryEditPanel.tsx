import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Button, Switch, Tag } from "antd"; // Thêm Switch, Tag
import { CategoryFormData } from "../types";

interface CategoryEditPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormData) => void;
    initialData?: CategoryFormData;
}

export const CategoryEditPanel: React.FC<CategoryEditPanelProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}) => {
    const [form] = Form.useForm();
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (initialData) {
            // Map data từ API vào Form
            form.setFieldsValue({
                ...initialData,
                // Chuyển đổi status string -> boolean cho Switch
                isActive: initialData.status === 'active',
            });
        }
    }, [initialData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Chuyển đổi ngược lại: boolean (Switch) -> status string (API)
            const submitData: CategoryFormData = {
                ...values,
                status: values.isActive ? 'active' : 'inactive',
            };

            // Xóa trường tạm isActive
            delete (submitData as any).isActive;

            onSubmit(submitData);
            setIsDirty(false);
        } catch {
            // Validate fail
        }
    };

    const handleClose = () => {
        if (isDirty) {
            Modal.confirm({
                title: "Hủy thay đổi?",
                content: "Các thay đổi chưa lưu sẽ bị mất.",
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
            width={600}
            centered
            footer={null}
            destroyOnClose={true}
            title={null}
            closeIcon={<span className="text-2xl text-[#102e3c] hover:opacity-70">×</span>}
            styles={{ body: { padding: 0 }, mask: { backgroundColor: "rgba(16, 46, 60, 0.5)" } }}
        >
            <div className="bg-[#D4E5E4] rounded-lg p-6">
                <h2 className="text-center text-2xl font-bold text-[#102e3c] mb-6">Cập Nhật Danh Mục</h2>

                <Form form={form} layout="vertical" onValuesChange={() => setIsDirty(true)}>

                    {/* Hàng 1: Tên & Trạng thái */}
                    <div className="grid grid-cols-3 gap-4">
                        <Form.Item name="name" label={<span className="font-semibold">Tên Danh Mục</span>} rules={[{ required: true }]} className="col-span-2">
                            <Input className="border-[#102e3c]" />
                        </Form.Item>

                        {/* --- TOGGLE STATUS --- */}
                        <div className="flex flex-col gap-2 pt-1">
                            <span className="font-semibold text-[#102e3c]">Trạng thái:</span>
                            <div className="flex items-center gap-3 h-[32px]">
                                <Form.Item name="isActive" valuePropName="checked" noStyle>
                                    <Switch />
                                </Form.Item>
                                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isActive !== curr.isActive}>
                                    {({ getFieldValue }) =>
                                        getFieldValue("isActive") ? (
                                            <Tag color="success">Hiện</Tag>
                                        ) : (
                                            <Tag color="error">Ẩn</Tag>
                                        )
                                    }
                                </Form.Item>
                            </div>
                        </div>
                        {/* --------------------- */}
                    </div>

                    <Form.Item name="slug" label={<span className="font-semibold">Slug (Đường dẫn tĩnh)</span>} rules={[{ required: true }]}>
                        <Input className="border-[#102e3c]" />
                    </Form.Item>

                    <Form.Item name="taxRate" label={<span className="font-semibold">Thuế suất</span>} rules={[{ required: true }]}>
                        <InputNumber className="w-full border-[#102e3c]" step={0.01} min={0} max={1} />
                    </Form.Item>

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