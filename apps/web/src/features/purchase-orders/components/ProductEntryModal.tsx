import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Radio, DatePicker, Row, Col, Divider, Upload, Button, message, Image } from "antd";
import { PurchaseOrderItemForm } from "../types";
import dayjs from "dayjs";
import { Upload as UploadIcon, Trash2 } from "lucide-react";

// Import API
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useAuthors } from "@/features/authors/hooks/useAuthors";
import { usePublishers } from "@/features/publishers/hooks/usePublishers";
import { uploadApi } from "@/api/upload"; // Import API upload bạn cung cấp

interface ProductEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (item: PurchaseOrderItemForm) => void;
}

export const ProductEntryModal: React.FC<ProductEntryModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [form] = Form.useForm();

    // Watch values để render điều kiện
    const type = Form.useWatch("type", form);
    const imageUrl = Form.useWatch("imageUrl", form); // Theo dõi URL để hiện preview

    // State loading cho upload
    const [isUploading, setIsUploading] = useState(false);

    // --- LẤY DỮ LIỆU ---
    const { data: categoriesData } = useCategories();
    const { data: authorsData } = useAuthors();
    const { data: publishersData } = usePublishers();

    const categories = Array.isArray(categoriesData)
        ? categoriesData : (Array.isArray(categoriesData?.data) ? categoriesData.data : []);
    const authors = Array.isArray(authorsData)
        ? authorsData : (Array.isArray(authorsData?.data) ? authorsData.data : []);
    const publishers = Array.isArray(publishersData)
        ? publishersData : (Array.isArray(publishersData?.data) ? publishersData.data : []);

    // --- EFFECT ---
    useEffect(() => {
        if (isOpen) {
            form.resetFields();
            form.setFieldsValue({ type: 'book', quantity: 1, taxRate: 0 });
        }
    }, [isOpen, form]);

    // --- HANDLERS ---

    // Xử lý Upload ảnh
    const handleUploadImage = async (file: File) => {
        try {
            setIsUploading(true);
            const url = await uploadApi.uploadFile(file);

            // Set URL vào form field (ẩn)
            form.setFieldsValue({ imageUrl: url });
            message.success("Tải ảnh lên thành công!");
        } catch (error) {
            message.error("Lỗi khi tải ảnh lên.");
        } finally {
            setIsUploading(false);
        }
        return false; // Prevent default upload behavior of Antd
    };

    // Xóa ảnh
    const handleRemoveImage = () => {
        form.setFieldsValue({ imageUrl: null });
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            const formattedValues = {
                ...values,
                publicationDate: values.publicationDate ? dayjs(values.publicationDate).format("YYYY-MM-DD") : undefined,
            };

            onSubmit(formattedValues);
            onClose();
        } catch (error) {
            console.error("Validate Failed:", error);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            onOk={handleOk}
            title="Thêm Sản Phẩm Vào Đơn Nhập"
            width={900}
            okText="Thêm vào danh sách"
            cancelText="Hủy"
            style={{ top: 20 }}
            destroyOnClose={true}
        >
            <Form form={form} layout="vertical" initialValues={{ type: 'book' }}>

                {/* --- 1. Loại sản phẩm & Định danh --- */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="type" label="Loại sản phẩm">
                                <Radio.Group optionType="button" buttonStyle="solid">
                                    <Radio.Button value="book">Sách</Radio.Button>
                                    <Radio.Button value="stationery">Văn phòng phẩm</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="sku" label="Mã SKU (Barcode)" rules={[{ required: true, message: "Bắt buộc nhập SKU" }]}>
                                <Input placeholder="VD: BOOK-001 hoặc quét mã vạch" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: "Bắt buộc nhập tên" }]}>
                                <Input placeholder="VD: Nhà Giả Kim" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* --- 2. Giá & Số lượng --- */}
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="unitPrice" label="Giá nhập (Giá vốn)" rules={[{ required: true, message: "Nhập giá vốn" }]}>
                            <InputNumber
                                className="w-full"
                                min={0}
                                addonAfter="đ"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="price" label="Giá bán niêm yết" rules={[{ required: true, message: "Nhập giá bán" }]}>
                            <InputNumber
                                className="w-full"
                                min={0}
                                addonAfter="đ"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="quantity" label="Số lượng nhập" rules={[{ required: true, message: "Nhập số lượng" }]}>
                            <InputNumber className="w-full" min={1} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider style={{ borderColor: '#1a998f', color: '#1a998f' }}>Thông tin chi tiết</Divider>

                {/* --- 3. Thông tin chung & Upload Ảnh --- */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="categoryIds" label="Danh mục" rules={[{ required: true, message: "Chọn ít nhất 1 danh mục" }]}>
                            <Select
                                mode="multiple"
                                placeholder="Chọn danh mục"
                                options={categories.map((c: any) => ({ label: c.name, value: c.id }))}
                            />
                        </Form.Item>

                        <Form.Item name="taxRate" label="Thuế suất (VD: 0.08 = 8%)">
                            <InputNumber className="w-full" step={0.01} max={1} min={0} placeholder="0.08" />
                        </Form.Item>
                    </Col>

                    {/* CỘT UPLOAD ẢNH */}
                    <Col span={12}>
                        {/* Input ẩn để lưu URL */}
                        <Form.Item name="imageUrl" hidden>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Ảnh sản phẩm">
                            <div className="flex items-start gap-4">
                                {/* Khu vực Preview Ảnh */}
                                <div className="w-24 h-24 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                                    {imageUrl ? (
                                        <>
                                            <Image src={imageUrl} alt="preview" width="100%" height="100%" className="object-cover" />
                                            {/* Nút xóa ảnh khi hover */}
                                            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                                                <Button
                                                    type="text"
                                                    icon={<Trash2 className="text-white" size={20} />}
                                                    onClick={handleRemoveImage}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-gray-400 text-xs text-center px-1">Chưa có ảnh</span>
                                    )}
                                </div>

                                {/* Nút Upload */}
                                <div className="flex flex-col gap-2">
                                    <Upload
                                        beforeUpload={handleUploadImage}
                                        showUploadList={false}
                                        accept="image/*"
                                    >
                                        <Button icon={<UploadIcon size={16} />} loading={isUploading}>
                                            {isUploading ? "Đang tải lên..." : "Tải ảnh lên"}
                                        </Button>
                                    </Upload>
                                    <span className="text-xs text-gray-500">
                                        Hỗ trợ: JPG, PNG, WEBP. <br /> Max size: 5MB.
                                    </span>
                                </div>
                            </div>
                        </Form.Item>
                    </Col>
                </Row>

                {/* --- 4. Form riêng cho SÁCH --- */}
                {type === 'book' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                        <h4 className="text-blue-800 font-bold mb-3">Thông tin Sách</h4>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="isbn" label="ISBN" rules={[{ required: true, message: "Nhập ISBN" }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="language" label="Ngôn ngữ">
                                    <Input placeholder="VD: Tiếng Việt" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item name="authorId" label="Tác giả" rules={[{ required: true, message: "Chọn tác giả" }]}>
                                    <Select
                                        showSearch
                                        optionFilterProp="label"
                                        placeholder="Chọn tác giả"
                                        options={authors.map((a: any) => ({ label: a.fullName, value: a.id }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="publisherId" label="Nhà xuất bản" rules={[{ required: true, message: "Chọn NXB" }]}>
                                    <Select
                                        showSearch
                                        optionFilterProp="label"
                                        placeholder="Chọn NXB"
                                        options={publishers.map((p: any) => ({ label: p.name, value: p.id }))}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item name="publicationDate" label="Ngày xuất bản">
                                    <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="edition" label="Tái bản">
                                    <Input placeholder="VD: Tái bản lần 1" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                )}

                <Form.Item name="description" label="Mô tả" className="mt-4">
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
};