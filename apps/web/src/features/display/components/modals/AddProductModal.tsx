import React, { useState } from "react";
import { Modal, Form, Select, InputNumber, Empty, Tag } from "antd";
import { useShelves, useProductsForSelection } from "../../hooks/useDisplay";
import { useDebounce } from "@/hooks/use-debounce";

interface AddProductModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    defaultShelfId?: string;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ open, onClose, onSubmit, defaultShelfId }) => {
    const [form] = Form.useForm();

    const [keyword, setKeyword] = useState("");
    const debouncedKeyword = useDebounce(keyword, 500);

    const { data: shelves } = useShelves();

    // --- CHIẾN THUẬT "MINIMAL": Gửi request tối giản giống Inventory ---
    const { data: productsData, isLoading } = useProductsForSelection({
        keyword: debouncedKeyword,

        // 1. Chỉ giữ lại tham số sắp xếp
        sortBy: 'createdAt',
        sortOrder: 'desc',

        // 2. XÓA BỎ limit, page, status/isActive
        // Để API dùng mặc định của Server (tránh lỗi 400 do validation sai)
    });

    // Kiểm tra linh hoạt: Nếu là mảng thì lấy luôn, nếu là object thì tìm key 'data' (chuẩn Inventory) hoặc 'items'
    const products = Array.isArray(productsData)
        ? productsData
        : (productsData?.data || []);

    // Lọc Client Side: Chỉ lấy hàng Active
    // (Vì ta không gửi status lên server nên server trả về hết, ta lọc ở đây)
    const activeProducts = products.filter((p: any) =>
        p.status === 'active' || p.isActive === true
    );

    const handleCancel = () => {
        setKeyword("");
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="Thêm Hàng Lên Kệ"
            open={open}
            onCancel={handleCancel}
            onOk={() => form.submit()}
            destroyOnClose={true}
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
                        filterOption={false}
                        onSearch={setKeyword}
                        notFoundContent={isLoading ? null : <Empty description="Không tìm thấy sản phẩm" />}
                        optionLabelProp="label"
                        listHeight={250}
                    >
                        {activeProducts.map((p: any) => {
                            const available = p.inventory?.availableQuantity ?? 0;
                            const isAvailable = available > 0;

                            return (
                                <Select.Option
                                    key={p.id}
                                    value={p.id}
                                    disabled={!isAvailable}
                                    label={p.name}
                                >
                                    <div className="flex justify-between items-center py-1">
                                        <div className="flex-1 overflow-hidden mr-2">
                                            <div className="font-medium truncate">{p.name}</div>
                                            <div className="text-xs text-gray-400">
                                                {p.sku} | {p.type === 'book' ? 'Sách' : 'VPP'}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {isAvailable ? (
                                                <Tag color="blue" className="mr-0">Kho: {available}</Tag>
                                            ) : (
                                                <Tag color="red" className="mr-0">Hết hàng</Tag>
                                            )}
                                        </div>
                                    </div>
                                </Select.Option>
                            );
                        })}
                    </Select>
                </Form.Item>

                <Form.Item
                    shouldUpdate={(prev, curr) => prev.productId !== curr.productId}
                >
                    {({ getFieldValue }) => {
                        const selectedId = getFieldValue('productId');
                        const selectedProduct = activeProducts.find((p: any) => p.id === selectedId);
                        const maxQty = selectedProduct?.inventory?.availableQuantity || 9999;

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