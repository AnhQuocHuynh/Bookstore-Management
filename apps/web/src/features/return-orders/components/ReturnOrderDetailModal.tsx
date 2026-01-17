import React, { useEffect, useMemo } from "react";
import { Modal, Form, InputNumber, Select, Radio, Input } from "antd";
import { ReturnOrderDetailForm } from "./CreateReturnOrderPage";
import { TransactionDetail } from "@/features/sales/types/sales.types";

interface ReturnOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (detail: ReturnOrderDetailForm) => void;
  initialValues?: ReturnOrderDetailForm | null;
  transactionDetails: TransactionDetail[];
  existingDetails: ReturnOrderDetailForm[];
}

export const ReturnOrderDetailModal: React.FC<ReturnOrderDetailModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  transactionDetails,
  existingDetails,
}) => {
  const [form] = Form.useForm();
  const type = Form.useWatch("type", form);
  const selectedProductId = Form.useWatch("productId", form);
  const quantity = Form.useWatch("quantity", form);
  const editingTempId = initialValues?.tempId;

  // Determine the chosen product from the transaction details to enforce max quantity
  const selectedTxnProduct = useMemo(
    () =>
      transactionDetails.find(
        (d) =>
          d.id === selectedProductId ||
          d.product?.id === selectedProductId ||
          // some APIs might return productId directly
          (d as any).productId === selectedProductId
      ),
    [transactionDetails, selectedProductId]
  );

  const computeRemainingForProduct = (txnDetail: TransactionDetail) => {
    const purchasedQty = txnDetail.quantity ?? 0;
    const productKey = txnDetail.product?.id || (txnDetail as any).productId || txnDetail.id;
    const usedQty = existingDetails
      .filter((d) => d.productId === productKey && (!editingTempId || d.tempId !== editingTempId))
      .reduce((sum, d) => sum + d.quantity, 0);
    // Remaining is purchased minus what other details have consumed; the current edit is excluded via filter above
    return Math.max(purchasedQty - usedQty, 0);
  };

  const currentEditingQty = useMemo(() => {
    if (!editingTempId) return 0;
    return existingDetails.find((d) => d.tempId === editingTempId)?.quantity ?? 0;
  }, [editingTempId, existingDetails]);

  const remainingQuantity = useMemo(() => {
    if (!selectedTxnProduct) return undefined;
    return computeRemainingForProduct(selectedTxnProduct);
  }, [selectedTxnProduct, existingDetails]);

  const effectiveMaxQuantity = useMemo(() => {
    if (!selectedTxnProduct) return undefined;
    const remaining = computeRemainingForProduct(selectedTxnProduct);
    return remaining + currentEditingQty; // allow keeping the original quantity when editing
  }, [selectedTxnProduct, computeRemainingForProduct, currentEditingQty]);

  // Auto-calc refund based on invoice unit price * quantity
  useEffect(() => {
    if (!selectedTxnProduct || !quantity) return;
    const unitPrice =
      selectedTxnProduct.unitPrice ??
      (selectedTxnProduct.totalPrice && selectedTxnProduct.quantity
        ? selectedTxnProduct.totalPrice / selectedTxnProduct.quantity
        : 0);
    const computed = Math.max(0, Math.round(unitPrice * quantity));
    form.setFieldsValue({ refundAmount: computed });
  }, [selectedTxnProduct, quantity, form]);

  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ type: "refund", quantity: 1, refundAmount: 0 });
      }
    }
  }, [isOpen, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (selectedTxnProduct) {
        const remaining = computeRemainingForProduct(selectedTxnProduct);
        const allowed = remaining + currentEditingQty;
        if (values.quantity > allowed) {
          return form.setFields([{ name: "quantity", errors: ["Số lượng vượt quá số lượng còn lại"] }]);
        }
      }

      const formattedValues: ReturnOrderDetailForm = {
        ...values,
        reason: values.reason?.trim() || undefined,
        ...(initialValues?.tempId && { tempId: initialValues.tempId }),
      };

      // Attach product display name from the selected transaction item
      const matchedTxnProduct = transactionDetails.find(
        (d) =>
          d.id === values.productId ||
          d.product?.id === values.productId ||
          (d as any).productId === values.productId
      );
      if (matchedTxnProduct) {
        formattedValues.productName = matchedTxnProduct.product?.name || matchedTxnProduct.productName;
        formattedValues.productId = matchedTxnProduct.product?.id || (matchedTxnProduct as any).productId || matchedTxnProduct.id;
      }

      // Auto-calc refund (already set via effect) but ensure number
      if (formattedValues.refundAmount !== undefined) {
        formattedValues.refundAmount = Number(formattedValues.refundAmount) || 0;
      }

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
      title={initialValues ? "Cập Nhật Chi Tiết" : "Thêm Chi Tiết Trả/Đổi"}
      width={600}
      okText={initialValues ? "Cập nhật" : "Thêm"}
      cancelText="Hủy"
      destroyOnClose={true}
    >
      {/* Transaction detail summary */}
      <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-3">
        <div className="text-sm font-semibold text-gray-800 mb-2">Sản phẩm trong hóa đơn</div>
        <div className="space-y-2 max-h-40 overflow-auto">
          {transactionDetails.map((d) => {
            const label = d.product?.name || d.productName;
            const qty = d.quantity;
            const price = d.totalPrice ?? d.unitPrice;
            return (
              <div key={d.id} className="flex justify-between text-sm">
                <span className="truncate pr-2">{label}</span>
                <span className="text-gray-600">x{qty}</span>
                {price !== undefined && (
                  <span className="text-teal-700 font-medium">
                    {(price as number).toLocaleString("vi-VN")} đ
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Form form={form} layout="vertical" initialValues={{ type: "refund", quantity: 1 }}>
        {/* Type Selection */}
        <Form.Item
          name="type"
          label="Loại yêu cầu"
          rules={[{ required: true, message: "Vui lòng chọn loại" }]}
        >
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio.Button value="refund">Hoàn tiền</Radio.Button>
            <Radio.Button value="exchange">Đổi hàng</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Product selection limited to purchased items */}
        <Form.Item
          name="productId"
          label="Sản phẩm trong hóa đơn"
          rules={[{ required: true, message: "Vui lòng chọn sản phẩm trong hóa đơn" }]}
        >
          <Select
            placeholder="Chọn sản phẩm đã mua"
            optionFilterProp="label"
            showSearch
            filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
            disabled={transactionDetails.length === 0}
          >
            {transactionDetails.map((detail) => {
              const label = detail.product?.name || detail.productName;
              const value = detail.product?.id || (detail as any).productId || detail.id;
              const remaining = computeRemainingForProduct(detail);
              const disabled = remaining <= 0 && value !== selectedProductId; // allow editing same item
              return (
                <Select.Option key={value} value={value} label={label} disabled={disabled}>
                  <div className="flex justify-between text-sm">
                    <span className="truncate pr-2">{label}</span>
                    <span className="text-gray-500">Còn: {remaining}</span>
                  </div>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>

        {/* Quantity */}
        <Form.Item
          name="quantity"
          label="Số lượng"
          rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
        >
          <InputNumber
            className="w-full"
            min={1}
            max={effectiveMaxQuantity ?? remainingQuantity ?? selectedTxnProduct?.quantity}
            placeholder="Nhập số lượng sản phẩm"
          />
        </Form.Item>

        {/* Refund Amount */}
        <Form.Item
          name="refundAmount"
          label="Số tiền hoàn"
          rules={[{ required: true, message: "Vui lòng nhập số tiền hoàn" }]}
        >
          <InputNumber
            className="w-full"
            min={0}
            addonAfter="đ"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            placeholder="Nhập số tiền hoàn cho khách"
          />
        </Form.Item>

        {/* New Product selection removed: exchange limited to original items */}

        {/* Reason */}
        <Form.Item name="reason" label="Lý do trả/đổi">
          <Input.TextArea
            rows={3}
            placeholder="VD: Hàng bị lỗi, không đúng mô tả..."
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
