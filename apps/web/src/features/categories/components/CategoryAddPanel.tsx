import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Button } from "antd";
import { CategoryFormData } from "../types";

interface CategoryAddPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormData) => void;
}

export const CategoryAddPanel: React.FC<CategoryAddPanelProps> = ({
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
            // setIsDirty(false) sẽ được xử lý ở afterClose
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
                <h2 className="text-center text-3xl font-bold text-[#102e3c] mb-8">Thêm Danh Mục Mới</h2>

                <div className="flex justify-center">
                    <div className="w-full max-w-3xl">
                        <Form form={form} layout="vertical" requiredMark={false} className="space-y-4" onValuesChange={() => setIsDirty(true)}>
                            <Form.Item name="name" label={<span className="text-lg font-semibold text-[#102e3c]">Tên Danh Mục:</span>} rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                                <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" placeholder="VD: Sách Văn Học" />
                            </Form.Item>

                            <Form.Item name="slug" label={<span className="text-lg font-semibold text-[#102e3c]">Slug (Đường dẫn tĩnh):</span>} rules={[{ required: true, message: "Vui lòng nhập slug" }]}>
                                <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" placeholder="VD: sach-van-hoc" />
                            </Form.Item>

                            <Form.Item name="taxRate" label={<span className="text-lg font-semibold text-[#102e3c]">Thuế suất (VD: 0.1 là 10%):</span>} rules={[{ required: true, message: "Vui lòng nhập thuế suất" }]}>
                                <InputNumber className="w-full border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0" step={0.01} min={0} max={1} placeholder="0.05" />
                            </Form.Item>

                            <Form.Item name="description" label={<span className="text-lg font-semibold text-[#102e3c]">Mô Tả:</span>}>
                                <Input.TextArea rows={3} className="border-2 border-[#102e3c] rounded-lg bg-transparent text-lg resize-none focus:border-[#1a998f] hover:border-[#1a998f]" />
                            </Form.Item>
                        </Form>
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <Button type="primary" onClick={handleSubmit} className="h-12 px-20 rounded-2xl bg-[#1a998f] text-2xl font-bold border-none hover:bg-[#158f85]">
                        Lưu Danh Mục
                    </Button>
                </div>
            </div>
        </Modal>
    );
};