import React, { useState } from "react";
import { Modal, Form, Select, InputNumber, Empty, Tag } from "antd";
import { useShelves, useProductsForSelection } from "../../hooks/useDisplay"; // Import hook mới từ display
import { useDebounce } from "@/hooks/use-debounce";

interface AddProductModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    defaultShelfId?: string;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ open, onClose, onSubmit, defaultShelfId }) => {
    const [form] = Form.useForm();

    // --- STATE TÌM KIẾM ---
    const [keyword, setKeyword] = useState("");
    const debouncedKeyword = useDebounce(keyword, 500);

    // --- DATA ---
    const { data: shelves } = useShelves();

    // Gọi API lấy sản phẩm (Pagination limit 20 để list dài chút)
    const { data: productsData, isLoading } = useProductsForSelection({
        keyword: debouncedKeyword,
        limit: 20,
        status: 'active'
    });

    const products = productsData?.items || [];

    // Reset form khi đóng/mở
    const handleCancel = () => {
        setKeyword(""); // Reset từ khóa
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="Thêm Hàng Lên Kệ"
            open={open}
            onCancel={handleCancel}
            onOk={() => form.submit()}
            destroyOnClose
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
                initialValues={{ displayShelfId: defaultShelfId, quantity: 1 }}
            >
                <Form.Item name="displayShelfId" label="Chọn Kệ" rules={[{ required: true, message: "Vui lòng chọn kệ" }]}>
                    <Select
                        placeholder="Chọn kệ trưng bày"
                        options={shelves?.map(s => ({ label: s.name, value: s.id }))}
                        disabled={!!defaultShelfId}
                    />
                </Form.Item>

                <Form.Item name="productId" label="Chọn Sản Phẩm (Từ kho)" rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}>
                    <Select
                        showSearch
                        placeholder="Gõ tên hoặc SKU để tìm..."
                        loading={isLoading}
                        filterOption={false} // Tắt filter client để dùng search server-side
                        onSearch={setKeyword} // Cập nhật keyword khi gõ
                        notFoundContent={isLoading ? null : <Empty description="Không tìm thấy sản phẩm" />}
                        optionLabelProp="label" // Hiển thị label ngắn gọn khi đã chọn
                    >
                        {products.map((p) => {
                            const isAvailable = p.inventory.availableQuantity > 0;
                            return (
                                <Select.Option
                                    key={p.id}
                                    value={p.id}
                                    disabled={!isAvailable}
                                    label={p.name}
                                >
                                    <div className="flex justify-between items-center py-1">
                                        <div className="flex-1">
                                            <div className="font-medium truncate max-w-[300px]">{p.name}</div>
                                            <div className="text-xs text-gray-400">
                                                {p.sku} | {p.type === 'book' ? 'Sách' : 'VPP'}
                                            </div>
                                        </div>
                                        <div>
                                            {isAvailable ? (
                                                <Tag color="blue">Kho: {p.inventory.availableQuantity}</Tag>
                                            ) : (
                                                <Tag color="red">Hết hàng</Tag>
                                            )}
                                        </div>
                                    </div>
                                </Select.Option>
                            );
                        })}
                    </Select>
                </Form.Item>

                {/* Validation số lượng max dựa trên sản phẩm đã chọn */}
                <Form.Item
                    shouldUpdate={(prev, curr) => prev.productId !== curr.productId}
                >
                    {({ getFieldValue }) => {
                        const selectedId = getFieldValue('productId');
                        const selectedProduct = products.find(p => p.id === selectedId);
                        const maxQty = selectedProduct?.inventory.availableQuantity || 9999;

                        return (
                            <Form.Item
                                name="quantity"
                                label="Số lượng"
                                rules={[
                                    { required: true, message: "Nhập số lượng" },
                                    {
                                        type: 'number',
                                        max: maxQty,
                                        message: `Không được vượt quá tồn kho khả dụng (${maxQty})`
                                    }
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    max={maxQty}
                                    className="w-full"
                                    placeholder={selectedProduct ? `Tối đa: ${maxQty}` : "Nhập số lượng"}
                                />
                            </Form.Item>
                        );
                    }}
                </Form.Item>
            </Form>
        </Modal>
    );
};