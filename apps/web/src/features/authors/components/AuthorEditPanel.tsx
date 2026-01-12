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
            width={700}
            centered
            footer={null}
            destroyOnClose={true} // Reset DOM để tránh lỗi cache form cũ
            title={null}
            closeIcon={<span className="text-2xl text-[#102e3c] hover:opacity-70">×</span>}
            styles={{ body: { padding: 0 }, mask: { backgroundColor: "rgba(16, 46, 60, 0.5)" } }}
        >
            <div className="bg-[#D4E5E4] rounded-lg p-6">
                <h2 className="text-center text-2xl font-bold text-[#102e3c] mb-6">Cập Nhật Tác Giả</h2>

                <Form form={form} layout="vertical" onValuesChange={() => setIsDirty(true)}>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="fullName" label={<span className="font-semibold">Họ và Tên</span>} rules={[{ required: true, message: "Tên không được để trống" }]}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>

                        <Form.Item name="status" label={<span className="font-semibold">Trạng Thái</span>}>
                            <Select className="border-[#102e3c]">
                                <Select.Option value="active">Hoạt động</Select.Option>
                                <Select.Option value="retired">Nghỉ hưu</Select.Option>
                                <Select.Option value="deceased">Đã mất</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="penName" label={<span className="font-semibold">Bút Danh</span>}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>
                        <Form.Item name="nationality" label={<span className="font-semibold">Quốc Tịch</span>}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="email" label={<span className="font-semibold">Email</span>} rules={[{ type: 'email', message: "Email không hợp lệ" }]}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>
                        <Form.Item name="phone" label={<span className="font-semibold">Số Điện Thoại</span>}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>
                    </div>

                    <Form.Item name="bio" label={<span className="font-semibold">Tiểu Sử</span>}>
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