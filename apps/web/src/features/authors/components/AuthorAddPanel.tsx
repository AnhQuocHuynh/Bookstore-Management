import React, { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { AuthorFormData } from "../types";

interface AuthorAddPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AuthorFormData) => void;
}

export const AuthorAddPanel: React.FC<AuthorAddPanelProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [form] = Form.useForm();
    const [isDirty, setIsDirty] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // --- XỬ LÝ DỮ LIỆU TRƯỚC KHI GỬI ---
            // Chuyển chuỗi rỗng "" thành undefined để API không báo lỗi 400 (Bad Request)
            // đặc biệt là với các trường có tính duy nhất như email, phone
            const cleanData: AuthorFormData = {
                fullName: values.fullName,
                penName: values.penName || undefined,
                email: values.email || undefined,
                phone: values.phone || undefined,
                nationality: values.nationality || undefined,
                bio: values.bio || undefined,
            };

            onSubmit(cleanData);
            // Logic reset sẽ được xử lý ở afterClose
        } catch (error) {
            // Form validation failed
        }
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
            width={700}
            centered
            footer={null}
            // SỬA LỖI WARNING: Antd v5 khuyến khích destroyOnClose (nhưng log của bạn báo deprecated thì có thể thử bỏ đi 
            // vì ta đã dùng afterClose để reset form rồi, hoặc dùng destroyOnClose={true} nếu bản antd của bạn vẫn hỗ trợ)
            // Nếu log báo dùng `destroyOnHidden`, bạn hãy đổi thành `destroyOnHidden={true}`. 
            // Tuy nhiên, cách an toàn nhất để tránh warning và vẫn reset form là giữ `afterClose` ở trên và xóa prop destroy... đi.
            // Ở đây tôi giữ lại destroyOnClose={true} vì nó phổ biến, nếu vẫn warn bạn hãy xóa dòng này đi nhé.
            destroyOnClose={true}

            title={null}
            closeIcon={<span className="text-2xl text-[#102e3c] hover:opacity-70">×</span>}
            styles={{ body: { padding: 0 }, mask: { backgroundColor: "rgba(16, 46, 60, 0.5)" } }}
        >
            <div className="bg-[#D4E5E4] rounded-lg p-6">
                <h2 className="text-center text-2xl font-bold text-[#102e3c] mb-6">Thêm Tác Giả Mới</h2>

                <Form form={form} layout="vertical" onValuesChange={() => setIsDirty(true)}>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="fullName" label={<span className="font-semibold">Họ và Tên</span>} rules={[{ required: true, message: "Bắt buộc nhập" }]}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>
                        <Form.Item name="penName" label={<span className="font-semibold">Bút Danh</span>}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="nationality" label={<span className="font-semibold">Quốc Tịch</span>}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>
                        <Form.Item name="phone" label={<span className="font-semibold">Số Điện Thoại</span>}>
                            <Input className="border-[#102e3c]" />
                        </Form.Item>
                    </div>

                    <Form.Item name="email" label={<span className="font-semibold">Email</span>} rules={[{ type: 'email', message: "Email không hợp lệ" }]}>
                        <Input className="border-[#102e3c]" />
                    </Form.Item>

                    <Form.Item name="bio" label={<span className="font-semibold">Tiểu Sử</span>}>
                        <Input.TextArea rows={3} className="border-[#102e3c]" />
                    </Form.Item>

                    <div className="flex justify-center mt-6">
                        <Button type="primary" onClick={handleSubmit} className="bg-[#1a998f] hover:bg-[#158f85] h-10 px-10 font-bold rounded-xl border-none">
                            Lưu Tác Giả
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );
};