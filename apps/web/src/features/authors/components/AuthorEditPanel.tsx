import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Select } from "antd";
import { AuthorFormData } from "../types";

interface AuthorEditPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AuthorFormData) => void;
    initialData?: AuthorFormData;
}

export const AuthorEditPanel: React.FC<AuthorEditPanelProps> = ({
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

            // --- XỬ LÝ DỮ LIỆU ---
            // Khi sửa, nếu người dùng xóa trắng một trường, ta cần gửi null
            // để Backend hiểu là "hãy xóa giá trị này trong database"
            const cleanData: AuthorFormData = {
                fullName: values.fullName,
                status: values.status,
                // Dùng (values.field || null) để chuyển chuỗi rỗng "" thành null
                penName: values.penName || null,
                email: values.email || null,
                phone: values.phone || null,
                nationality: values.nationality || null,
                bio: values.bio || null,
            };

            onSubmit(cleanData);
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
                <h2 className="text-center text-3xl font-bold text-[#102e3c] mb-8">Cập Nhật Tác Giả</h2>

                <div className="flex justify-center">
                    <div className="w-full max-w-3xl">
                        <Form form={form} layout="vertical" requiredMark={false} className="space-y-4" onValuesChange={() => setIsDirty(true)}>
                            <div className="grid grid-cols-2 gap-6">
                                <Form.Item name="fullName" label={<span className="text-lg font-semibold text-[#102e3c]">Họ và Tên:</span>} rules={[{ required: true, message: "Tên không được để trống" }]}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>

                                <Form.Item name="status" label={<span className="text-lg font-semibold text-[#102e3c]">Trạng Thái:</span>}>
                                    <Select className="border-[#102e3c]">
                                        <Select.Option value="active">Hoạt động</Select.Option>
                                        <Select.Option value="retired">Nghỉ hưu</Select.Option>
                                        <Select.Option value="deceased">Đã mất</Select.Option>
                                    </Select>
                                </Form.Item>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Form.Item name="penName" label={<span className="text-lg font-semibold text-[#102e3c]">Bút Danh:</span>}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>
                                <Form.Item name="nationality" label={<span className="text-lg font-semibold text-[#102e3c]">Quốc Tịch:</span>}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Form.Item name="email" label={<span className="text-lg font-semibold text-[#102e3c]">Email:</span>} rules={[{ type: 'email', message: "Email không hợp lệ" }]}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>
                                <Form.Item name="phone" label={<span className="text-lg font-semibold text-[#102e3c]">Số Điện Thoại:</span>}>
                                    <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
                                </Form.Item>
                            </div>

                            <Form.Item name="bio" label={<span className="text-lg font-semibold text-[#102e3c]">Tiểu Sử:</span>}>
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