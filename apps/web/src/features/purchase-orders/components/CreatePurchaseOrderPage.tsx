import React, { useState, useMemo } from "react";
import { Button, Card, Input, Select, Table, message, Typography, Tag, Divider, Tooltip } from "antd";
import { Plus, Save, Trash2, ArrowLeft, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { useCreatePurchaseOrder } from "../hooks/usePurchaseOrder";
import { ProductEntryModal } from "./ProductEntryModal";
import { CreatePurchaseOrderDto, PurchaseOrderItemForm } from "../types";

const { Title } = Typography;

export const CreatePurchaseOrderPage = () => {
    const navigate = useNavigate();

    // --- States ---
    const [supplierId, setSupplierId] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [items, setItems] = useState<PurchaseOrderItemForm[]>([]);

    // State Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PurchaseOrderItemForm | null>(null);

    // --- Hooks ---
    const { data: responseData, isLoading: loadingSuppliers } = useSuppliers();
    const suppliers = Array.isArray(responseData)
        ? responseData
        : (Array.isArray(responseData?.data) ? responseData.data : []);

    const { mutate: createOrder, isPending: isSubmitting } = useCreatePurchaseOrder();

    // --- Computed ---
    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }, [items]);

    // --- Handlers ---

    const handleAddItem = (newItem: PurchaseOrderItemForm) => {
        const existingIndex = items.findIndex(i => i.sku === newItem.sku);

        if (existingIndex > -1) {
            const updatedItems = [...items];
            updatedItems[existingIndex] = newItem;
            setItems(updatedItems);

            if (editingItem) {
                message.success("Cập nhật thông tin sản phẩm thành công");
            } else {
                message.info(`Đã cập nhật thông tin cho sản phẩm SKU: ${newItem.sku}`);
            }
        } else {
            setItems([...items, newItem]);
            message.success("Đã thêm sản phẩm vào danh sách");
        }
    };

    const handleEditItem = (item: PurchaseOrderItemForm) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleRemoveItem = (sku: string) => {
        setItems(items.filter(item => item.sku !== sku));
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSubmit = () => {
        if (!supplierId) return message.error("Vui lòng chọn nhà cung cấp");
        if (items.length === 0) return message.error("Vui lòng thêm ít nhất 1 sản phẩm");

        const payload: CreatePurchaseOrderDto = {
            supplierId,
            note: note && note.trim() !== "" ? note : undefined,
            createPurchaseOrderDetailDtos: items.map(item => {
                const cleanTaxRate = (item.taxRate && item.taxRate > 0) ? item.taxRate : undefined;

                // --- FIX LỖI IMAGE URL ---
                // Nếu có ảnh -> giữ nguyên. Nếu là chuỗi rỗng -> chuyển thành undefined để Backend bỏ qua validate URL
                const cleanImageUrl = (item.imageUrl && item.imageUrl.trim() !== "") ? item.imageUrl : undefined;

                return {
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    createProductDto: {
                        name: item.name,
                        sku: item.sku,
                        price: item.price,

                        // Sửa tại đây:
                        imageUrl: cleanImageUrl,

                        type: item.type,
                        categoryIds: item.categoryIds,
                        taxRate: cleanTaxRate,
                        description: item.description,
                        createInventoryDto: {
                            stockQuantity: item.quantity,
                            costPrice: item.unitPrice,
                        },
                        ...(item.type === 'book' ? {
                            createBookDto: {
                                isbn: item.isbn!,
                                authorId: item.authorId!,
                                publisherId: item.publisherId!,
                                publicationDate: item.publicationDate || undefined,
                                edition: item.edition || undefined,
                                language: item.language || undefined,
                            } as any
                        } : { createBookDto: undefined })
                    }
                };
            })
        };

        createOrder(payload);
    };

    // Columns
    const columns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            width: 120,
            render: (text: string) => <Tag>{text}</Tag>
        },
        {
            title: 'Tên Sản Phẩm',
            dataIndex: 'name',
            render: (text: string, record: PurchaseOrderItemForm) => (
                <div
                    className="cursor-pointer hover:text-teal-600 group"
                    onClick={() => handleEditItem(record)}
                >
                    <div className="font-medium group-hover:underline">{text}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        {record.type === 'book' ? 'Sách' : 'VPP'}
                        {record.type === 'book' && (!record.authorId || !record.publisherId) && (
                            <span className="text-red-500 font-bold ml-1">(Thiếu thông tin!)</span>
                        )}
                    </div>
                </div>
            )
        },
        {
            title: 'Số Lượng',
            dataIndex: 'quantity',
            width: 100,
            align: 'center' as const,
        },
        {
            title: 'Giá Nhập',
            dataIndex: 'unitPrice',
            width: 150,
            align: 'right' as const,
            render: (val: number) => val.toLocaleString('vi-VN') + ' đ'
        },
        {
            title: 'Thành Tiền',
            width: 150,
            align: 'right' as const,
            render: (_: any, record: PurchaseOrderItemForm) => (
                <span className="font-bold text-teal-700">
                    {(record.quantity * record.unitPrice).toLocaleString('vi-VN')} đ
                </span>
            )
        },
        {
            title: '',
            width: 100,
            align: 'center' as const,
            render: (_: any, record: PurchaseOrderItemForm) => (
                <div className="flex justify-center gap-1">
                    <Tooltip title="Sửa thông tin">
                        <Button
                            type="text"
                            className="text-blue-600 hover:bg-blue-50"
                            icon={<Edit size={16} />}
                            onClick={() => handleEditItem(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            danger
                            icon={<Trash2 size={16} />}
                            onClick={() => handleRemoveItem(record.sku)}
                        />
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 h-full flex flex-col font-['Inter'] bg-gray-50 overflow-hidden">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Button icon={<ArrowLeft size={18} />} onClick={() => navigate(-1)} className="border-none bg-transparent shadow-none" />
                    <Title level={2} style={{ margin: 0, color: '#102e3c' }}>Tạo Phiếu Nhập Hàng</Title>
                </div>
                <div className="flex gap-3">
                    <Button size="large" onClick={() => navigate(-1)}>Hủy bỏ</Button>
                    <Button
                        type="primary"
                        size="large"
                        icon={<Save size={18} />}
                        className="bg-[#1a998f] hover:bg-[#158f85]"
                        loading={isSubmitting}
                        onClick={handleSubmit}
                    >
                        Lưu & Nhập Kho
                    </Button>
                </div>
            </div>

            <div className="flex gap-6 h-full overflow-hidden">
                {/* LEFT */}
                <div className="w-[350px] flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                    <Card title="Thông tin chung" className="shadow-sm rounded-xl">
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp <span className="text-red-500">*</span></label>
                                <Select
                                    showSearch
                                    placeholder="Chọn nhà cung cấp"
                                    optionFilterProp="label"
                                    className="w-full h-10"
                                    loading={loadingSuppliers}
                                    options={suppliers.map((s: any) => ({ label: s.name, value: s.id }))}
                                    value={supplierId}
                                    onChange={setSupplierId}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                                <Input.TextArea
                                    rows={4}
                                    placeholder="VD: Nhập hàng phục vụ khai giảng..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="shadow-sm rounded-xl bg-teal-50 border-teal-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Tổng số lượng:</span>
                            <span className="font-bold">{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Số mặt hàng:</span>
                            <span className="font-bold">{items.length}</span>
                        </div>
                        <Divider className="my-3 bg-teal-200" />
                        <div className="flex justify-between items-end">
                            <span className="text-lg font-bold text-[#102e3c]">Tổng Tiền:</span>
                            <span className="text-2xl font-extrabold text-[#1a998f]">
                                {totalAmount.toLocaleString('vi-VN')} đ
                            </span>
                        </div>
                    </Card>
                </div>

                {/* RIGHT */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Card
                        className="flex-1 shadow-sm rounded-xl flex flex-col border border-gray-200"
                        styles={{ body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' } }}
                    >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                            <h3 className="font-bold text-lg text-[#102e3c]">Danh sách sản phẩm</h3>
                            <Button
                                type="primary"
                                icon={<Plus size={18} />}
                                className="bg-[#1a998f]"
                                onClick={() => {
                                    setEditingItem(null);
                                    setIsModalOpen(true);
                                }}
                            >
                                Thêm Sản Phẩm
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <Table
                                dataSource={items}
                                columns={columns}
                                rowKey="sku"
                                pagination={false}
                                sticky
                            />
                            {items.length === 0 && (
                                <div className="p-8 text-center text-gray-400">
                                    Chưa có sản phẩm nào. Nhấn "Thêm Sản Phẩm" để bắt đầu.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <ProductEntryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleAddItem}
                initialValues={editingItem}
            />
        </div>
    );
};