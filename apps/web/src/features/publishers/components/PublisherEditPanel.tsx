import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Switch, Tag } from "antd"; // Thêm Switch, Tag
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
            const submitData: PublisherFormData = {
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
                <h2 className="text-center text-3xl font-bold text-[#102e3c] mb-8">Cập Nhật Nhà Xuất Bản</h2>

                <div className="flex justify-center">
                    <div className="w-full max-w-3xl">
                        <Form form={form} layout="vertical" requiredMark={false} className="space-y-4" onValuesChange={() => setIsDirty(true)}>

                            {/* Hàng 1: Tên & Trạng thái */}
                            <div className="grid grid-cols-3 gap-6">
                                <Form.Item name="name" label={<span className="text-lg font-semibold text-[#102e3c]">Tên Nhà Xuất Bản:</span>} rules={[{ required: true }]} className="col-span-2">
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>

                                {/* --- TOGGLE STATUS --- */}
                                <div className="flex flex-col gap-2 pt-1">
                                    <span className="text-lg font-semibold text-[#102e3c]">Trạng thái:</span>
                            <div className="flex items-center gap-3 h-[32px]">
                                <Form.Item name="isActive" valuePropName="checked" noStyle>
                                    <Switch />
                                </Form.Item>
                                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isActive !== curr.isActive}>
                                    {({ getFieldValue }) =>
                                        getFieldValue("isActive") ? (
                                            <Tag color="success">Hoạt động</Tag>
                                        ) : (
                                            <Tag color="error">Ngừng</Tag>
                                        )
                                    }
                                </Form.Item>
                            </div>
                                </div>
                                {/* --------------------- */}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Form.Item name="email" label={<span className="text-lg font-semibold text-[#102e3c]">Email:</span>} rules={[{ type: 'email' }]}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>
                                <Form.Item name="phone" label={<span className="text-lg font-semibold text-[#102e3c]">Số Điện Thoại:</span>}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Form.Item name="address" label={<span className="text-lg font-semibold text-[#102e3c]">Địa Chỉ:</span>}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>
                                <Form.Item name="website" label={<span className="text-lg font-semibold text-[#102e3c]">Website:</span>} rules={[{ type: 'url' }]}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>
                            </div>

                            <Form.Item name="description" label={<span className="text-lg font-semibold text-[#102e3c]">Mô Tả:</span>}>
                                <Input.TextArea rows={3} className="border-2 border-[#102e3c] rounded-lg bg-transparent text-lg resize-none focus:border-[#1a998f] hover:border-[#1a998f]" />
                            </Form.Item>
                        </Form>
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <Button type="primary" onClick={handleSubmit} className="h-12 px-20 rounded-2xl bg-[#1a998f] text-2xl font-bold border-none hover:bg-[#158f85]">
                        Cập Nhật
                    </Button>
                </div>
            </div>
        </Modal>
    );
};