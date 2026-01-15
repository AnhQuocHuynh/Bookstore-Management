import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Radio, DatePicker, Row, Col, Divider, Upload, Button, message, Image, Checkbox, Space } from "antd";
import { PurchaseOrderItemForm } from "../types";
import dayjs from "dayjs";
import { Upload as UploadIcon, Trash2, Search } from "lucide-react";

// Import API
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useAuthors } from "@/features/authors/hooks/useAuthors";
import { usePublishers } from "@/features/publishers/hooks/usePublishers";
import { uploadApi } from "@/api/upload";
import { inventoryApi } from "@/features/inventory/api/inventory";

interface ProductEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (item: PurchaseOrderItemForm) => void;
    initialValues?: PurchaseOrderItemForm | null;
}

interface ExistingProduct {
    id: string;
    sku: string;
    name: string;
    price: number;
    imageUrl?: string;
    type: string;
    description?: string;
    isbn?: string;
    language?: string;
    authorId?: string;
    publisherId?: string;
    edition?: string;
    publicationDate?: string;
    categoryIds?: string[];
    taxRate?: number;
}

export const ProductEntryModal: React.FC<ProductEntryModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialValues,
}) => {
    const [form] = Form.useForm();

    const type = Form.useWatch("type", form);
    const imageUrl = Form.useWatch("imageUrl", form);
    const sku = Form.useWatch("sku", form);
    const name = Form.useWatch("name", form);
    
    const [isUploading, setIsUploading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [productExists, setProductExists] = useState(false);
    const [existingProduct, setExistingProduct] = useState<ExistingProduct | null>(null);
    const [searchAttempted, setSearchAttempted] = useState(false);

    // --- DATA ---
    const { data: categoriesData } = useCategories();
    const { data: authorsData } = useAuthors();
    const { data: publishersData } = usePublishers();

    const categories = Array.isArray(categoriesData) ? categoriesData : (Array.isArray(categoriesData?.data) ? categoriesData.data : []);
    const authors = Array.isArray(authorsData) ? authorsData : (Array.isArray(authorsData?.data) ? authorsData.data : []);
    const publishers = Array.isArray(publishersData) ? publishersData : (Array.isArray(publishersData?.data) ? publishersData.data : []);

    // --- EFFECT: FILL DATA KHI MỞ MODAL ---
    useEffect(() => {
        if (isOpen) {
            if (initialValues) {
                // TRƯỜNG HỢP SỬA: Fill dữ liệu
                form.setFieldsValue({
                    ...initialValues,
                    publicationDate: initialValues.publicationDate ? dayjs(initialValues.publicationDate) : undefined,
                });
                setProductExists(true);
                setExistingProduct(initialValues as any);
            } else {
                // TRƯỜNG HỢP THÊM MỚI: Reset form
                form.resetFields();
                form.setFieldsValue({ type: 'book', quantity: 1, taxRate: 0 });
                setProductExists(false);
                setExistingProduct(null);
                setSearchAttempted(false);
            }
        }
    }, [isOpen, initialValues, form]);

    // --- RESET SEARCH STATE WHEN SKU/NAME CHANGES ---
    useEffect(() => {
        if (searchAttempted) {
            setProductExists(false);
            setExistingProduct(null);
            setSearchAttempted(false);
        }
    }, [sku, name]);

    // --- HANDLERS ---
    const handleSearchProduct = async () => {
    if (!sku && !name) {
        message.warning("Vui lòng nhập SKU hoặc tên sản phẩm");
        return;
    }

    try {
        setIsSearching(true);
        setSearchAttempted(true);

        let product = null;

        // Try to search by SKU first
        if (sku) {
            try {
                const response = await inventoryApi.getById(sku);
                if (response.data) {
                    product = response.data;
                }
            } catch (error) {
                console.log("SKU search failed, trying name search...");
            }
        }

        // If SKU search failed, try searching by name using the list endpoint
        if (!product && name) {
            const response = await inventoryApi.getAll({
                name: name,
                limit: 1,
            });
            const products = Array.isArray(response.data) ? response.data : response.data?.data || [];
            if (products.length > 0) {
                product = products[0];
            }
        }

        if (product) {
            setExistingProduct(product);
            setProductExists(true);

            // Auto-fill the form fields
            const categoryIds = product.categories?.map((c: any) => c.id) || [];
            form.setFieldsValue({
                name: product.name,
                sku: product.sku,
                price: product.price,
                imageUrl: product.imageUrl,
                type: product.type,
                description: product.description,
                isbn: product.book?.isbn,
                language: product.book?.language,
                authorId: product.book?.authorId,
                publisherId: product.book?.publisherId,
                edition: product.book?.edition,
                publicationDate: product.book?.publicationDate ? dayjs(product.book.publicationDate) : undefined,
                categoryIds: categoryIds,
                taxRate: product.taxRate,
            });

            message.success("Tìm thấy sản phẩm trong hệ thống!");
        } else {
            setProductExists(false);
            setExistingProduct(null);
            message.info("Sản phẩm chưa tồn tại trong hệ thống. Bạn có thể thêm mới.");
        }
    } catch (error: any) {
        console.error("Search error:", error);
        setProductExists(false);
        setExistingProduct(null);
        message.error("Lỗi khi tìm kiếm sản phẩm");
    } finally {
        setIsSearching(false);
    }
};
    const handleUploadImage = async (file: File) => {
        try {
            setIsUploading(true);
            const url = await uploadApi.uploadFile(file);
            form.setFieldsValue({ imageUrl: url });
            message.success("Tải ảnh lên thành công!");
        } catch (error) {
            message.error("Lỗi khi tải ảnh lên.");
        } finally {
            setIsUploading(false);
        }
        return false;
    };

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
            title={initialValues ? "Cập Nhật Thông Tin Sản Phẩm" : "Thêm Sản Phẩm Vào Đơn Nhập"}
            width={900}
            okText={initialValues ? "Cập nhật" : "Thêm vào danh sách"}
            cancelText="Hủy"
            style={{ top: 20 }}
            destroyOnClose={true}
        >
            <Form form={form} layout="vertical" initialValues={{ type: 'book' }}>

                {/* --- PRODUCT EXISTENCE CHECKER --- */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-900">Kiểm tra Sản phẩm</h4>
                        <Checkbox 
                            checked={productExists} 
                            disabled
                            className="mb-0"
                        >
                            <span className="text-sm">Sản phẩm tồn tại</span>
                        </Checkbox>
                    </div>
                    <Row gutter={16} align="middle">
                        <Col span={18}>
                            <Space className="w-full" direction="vertical" style={{ width: '100%' }}>
                                <Input 
                                    placeholder="Nhập SKU (Barcode)" 
                                    value={sku} 
                                    onChange={(e) => form.setFieldsValue({ sku: e.target.value })}
                                    disabled={!!initialValues}
                                />
                                <Input 
                                    placeholder="hoặc Tên sản phẩm" 
                                    value={name} 
                                    onChange={(e) => form.setFieldsValue({ name: e.target.value })}
                                    disabled={!!initialValues}
                                />
                            </Space>
                        </Col>
                        <Col span={6}>
                            <Button 
                                type="primary" 
                                icon={<Search size={16} />} 
                                onClick={handleSearchProduct}
                                loading={isSearching}
                                disabled={!!initialValues}
                                block
                            >
                                Kiểm tra
                            </Button>
                        </Col>
                    </Row>
                    {searchAttempted && !productExists && (
                        <div className="text-sm text-amber-700 mt-2 bg-amber-50 p-2 rounded">
                            ⚠️ Sản phẩm chưa tồn tại. Vui lòng điền thông tin đầy đủ để thêm mới.
                        </div>
                    )}
                    {productExists && (
                        <div className="text-sm text-green-700 mt-2 bg-green-50 p-2 rounded">
                            ✓ Sản phẩm đã tồn tại trong hệ thống. Các trường thông tin đã được tự động điền.
                        </div>
                    )}
                </div>

                {/* --- 1. Loại & Định danh --- */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="type" label="Loại sản phẩm">
                                <Radio.Group optionType="button" buttonStyle="solid" disabled={!!initialValues}>
                                    <Radio.Button value="book">Sách</Radio.Button>
                                    <Radio.Button value="stationery">Văn phòng phẩm</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="sku" label="Mã SKU (Barcode)" rules={[{ required: true, message: "Bắt buộc nhập SKU" }]}>
                                <Input placeholder="VD: BOOK-001" disabled={!!initialValues || productExists} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: "Bắt buộc nhập tên" }]}>
                                <Input placeholder="VD: Nhà Giả Kim" disabled={productExists} />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* --- 2. Giá & Số lượng --- */}
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="unitPrice" label="Giá nhập (Giá vốn)" rules={[{ required: true, message: "Nhập giá vốn" }]}>
                            <InputNumber className="w-full" min={0} addonAfter="đ" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="price" label="Giá bán niêm yết" rules={[{ required: true, message: "Nhập giá bán" }]}>
                            <InputNumber 
                                className="w-full" 
                                min={0} 
                                addonAfter="đ" 
                                disabled={productExists}
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

                {/* --- 3. Thông tin chung & Ảnh --- */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="categoryIds" label="Danh mục" rules={[{ required: true, message: "Chọn ít nhất 1 danh mục" }]}>
                            <Select 
                                mode="multiple" 
                                placeholder="Chọn danh mục" 
                                disabled={productExists}
                                options={categories.map((c: any) => ({ label: c.name, value: c.id }))} 
                            />
                        </Form.Item>
                        <Form.Item name="taxRate" label="Thuế suất (VD: 0.08 = 8%)">
                            <InputNumber 
                                className="w-full" 
                                step={0.01} 
                                max={1} 
                                min={0} 
                                placeholder="0.08" 
                                disabled={productExists}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="imageUrl" hidden><Input /></Form.Item>
                        <Form.Item label="Ảnh sản phẩm">
                            <div className="flex items-start gap-4">
                                <div className="w-24 h-24 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                                    {imageUrl ? (
                                        <>
                                            <Image src={imageUrl} alt="preview" width="100%" height="100%" className="object-cover" />
                                            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                                                <Button type="text" icon={<Trash2 className="text-white" size={20} />} onClick={handleRemoveImage} />
                                            </div>
                                        </>
                                    ) : (<span className="text-gray-400 text-xs text-center px-1">Chưa có ảnh</span>)}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Upload beforeUpload={handleUploadImage} showUploadList={false} accept="image/*">
                                        <Button icon={<UploadIcon size={16} />} loading={isUploading}>{isUploading ? "Đang tải lên..." : "Tải ảnh lên"}</Button>
                                    </Upload>
                                    <span className="text-xs text-gray-500">JPG, PNG, WEBP. Max 5MB.</span>
                                </div>
                            </div>
                        </Form.Item>
                    </Col>
                </Row>

                {/* --- 4. Sách --- */}
                {type === 'book' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                        <h4 className="text-blue-800 font-bold mb-3">Thông tin Sách</h4>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="isbn" label="ISBN" rules={[{ required: true, message: "Nhập ISBN" }]}>
                                    <Input disabled={productExists} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="language" label="Ngôn ngữ">
                                    <Input placeholder="VD: Tiếng Việt" disabled={productExists} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="authorId" label="Tác giả" rules={[{ required: true, message: "Chọn tác giả" }]}>
                                    <Select 
                                        showSearch 
                                        optionFilterProp="label" 
                                        placeholder="Chọn tác giả" 
                                        disabled={productExists}
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
                                        disabled={productExists}
                                        options={publishers.map((p: any) => ({ label: p.name, value: p.id }))} 
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="publicationDate" label="Ngày xuất bản">
                                    <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày" disabled={productExists} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="edition" label="Tái bản">
                                    <Input placeholder="VD: Tái bản lần 1" disabled={productExists} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                )}

                <Form.Item name="description" label="Mô tả" className="mt-4">
                    <Input.TextArea rows={2} disabled={productExists} />
                </Form.Item>
            </Form>
        </Modal>
    );
};