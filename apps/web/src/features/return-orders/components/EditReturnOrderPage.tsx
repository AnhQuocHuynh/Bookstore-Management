import { useState, useMemo, useEffect } from "react";
import { Button, Card, Input, Table, message, Tag, Modal, Spin } from "antd";
import { Plus, Save, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useReturnOrderDetail, useAddReturnOrderDetail, useDeleteReturnOrderDetail, useUpdateReturnOrder, useUpdateReturnOrderDetail } from "../hooks/useReturnOrder";
import { useTransactions } from "@/features/sales/hooks/use-transactions";
import { ReturnOrderDetailModal } from "./ReturnOrderDetailModal";
import { formatCurrency, formatDateTime } from "@/utils";
import dayjs, { Dayjs } from "dayjs";

export interface ReturnOrderDetailForm {
  type: "exchange" | "refund";
  quantity: number;
  refundAmount: number;
  productId: string;
  productName: string;
  reason?: string;
  tempId?: string;
  newProductId?: string;
  detailId?: string; // Store the actual API detail ID for updates
}

export const EditReturnOrderPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { orderId } = useParams<{ orderId: string }>();

  // States
  const [details, setDetails] = useState<ReturnOrderDetailForm[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<ReturnOrderDetailForm | null>(null);
  const [note, setNote] = useState("");

  // Fetch order data
  const { data: orderData, isLoading, error: orderError } = useReturnOrderDetail(orderId || null);

  useEffect(() => {
    if (!isLoading && orderData) {
      console.log("[EditReturnOrderPage][getById] data:", {
        id: orderData.id,
        orderNumber: orderData.orderNumber,
        status: orderData.status,
        totalRefundAmount: orderData.totalRefundAmount,
        detailsCount: orderData.details?.length,
        details: orderData.details,
      });
    }
  }, [isLoading, orderData]);

  // Fetch transactions
  const { data: transactionsResponse } = useTransactions();
  const allTransactions = Array.isArray(transactionsResponse) ? transactionsResponse : [];

  // Mutations
  const addDetailMutation = useAddReturnOrderDetail();
  const deleteDetailMutation = useDeleteReturnOrderDetail();
  const updateOrderMutation = useUpdateReturnOrder();
  const updateDetailMutation = useUpdateReturnOrderDetail();

  // Initialize details when order loads via useEffect (proper lifecycle management)
  useEffect(() => {
    if (orderData && orderId) {
      if (orderData.details && Array.isArray(orderData.details)) {
        const detailsForForm = orderData.details.map((detail: any, index: number) => {
          const resolvedProductId =
            detail.productId ?? detail.product?.id ?? detail.newProductId ?? detail.newProduct?.id;

          return {
            type: detail.type === "exchange" ? "exchange" : "refund",
            quantity: detail.quantity,
            refundAmount: detail.refundAmount || 0,
            productId: resolvedProductId?.toString() || "",
            productName:
              detail.productName ||
              detail.product?.name ||
              detail.newProduct?.name ||
              detail.newProduct?.productName,
            reason: detail.reason,
            tempId: `existing-${index}`,
            detailId: detail.id, // Store actual API ID
            newProductId: detail.newProductId || detail.newProduct?.id || resolvedProductId,
          };
        });
        setDetails(detailsForForm);
      } else {
        setDetails([]);
      }

      setNote(orderData.note || "");
    }
  }, [orderId, orderData?.id, isLoading]); // Re-initialize when orderId, order.id, or loading changes

  // Memoize order data for display
  const order = useMemo(() => {
    return orderData;
  }, [orderData]);

  // Get selected transaction for detail modal (prefer full transaction with details from transactions list)
  const selectedTransaction = useMemo(() => {
    const txnId = order?.transactionId || order?.transaction?.id;
    if (!txnId) return order?.transaction;

    const fromList = allTransactions.find((t: any) => t.id === txnId);
    return fromList || order?.transaction;
  }, [order?.transaction, order?.transactionId, allTransactions]);

  const handleAddDetail = (newDetail: ReturnOrderDetailForm) => {
    const detailWithId = { ...newDetail, tempId: editingDetail?.tempId || Date.now().toString() };
    const isEditingExisting = Boolean(editingDetail && editingDetail.tempId);

    if (isEditingExisting) {
      setDetails(details.map((d) => (d.tempId === editingDetail?.tempId ? detailWithId : d)));
      message.success("Cập nhật chi tiết thành công");
    } else {
      // Merge if same product and type
      const existingIndex = details.findIndex(
        (d) => d.productId === newDetail.productId && d.type === newDetail.type
      );

      if (existingIndex !== -1) {
        const updated = [...details];
        const target = updated[existingIndex];
        updated[existingIndex] = {
          ...target,
          quantity: target.quantity + newDetail.quantity,
          refundAmount: target.refundAmount + newDetail.refundAmount,
          reason: newDetail.reason ?? target.reason,
        };
        setDetails(updated);
        message.success("Đã gộp vào chi tiết hiện có");
      } else {
        setDetails([...details, detailWithId]);
        message.success("Đã thêm chi tiết vào danh sách");
      }
    }

    handleCloseModal();
  };

  const handleEditDetail = (detail: ReturnOrderDetailForm) => {
    setEditingDetail(detail);
    setIsModalOpen(true);
  };

  const handleRemoveDetail = (tempId: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa chi tiết này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        setDetails(details.filter(d => d.tempId !== tempId));
        message.success("Đã xóa chi tiết");
      },
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDetail(null);
  };

  const handleSubmit = async () => {
    if (!orderId) return message.error("Không tìm thấy ID đơn hàng");

    try {
      // 1. Update order itself (note if changed)
      if (order && order.note !== note) {
        await updateOrderMutation.mutateAsync({
          id: orderId,
          data: { note: note.trim() || undefined },
        });
      }

      // 2. Update existing details that changed
      const existingDetails = details.filter(d => d.detailId);
      for (const detail of existingDetails) {
        const originalDetail = orderData?.details?.find((d: any) => d.id === detail.detailId);
        
        // Check if detail changed
        if (originalDetail && (
          detail.quantity !== originalDetail.quantity ||
          detail.refundAmount !== originalDetail.refundAmount ||
          detail.reason !== originalDetail.reason
        )) {
          await updateDetailMutation.mutateAsync({
            id: orderId,
            detailId: detail.detailId || "",
            data: {
              quantity: detail.quantity,
              refundAmount: detail.refundAmount,
              ...(detail.reason ? { reason: detail.reason } : {}),
            },
          });
        }
      }

      // 3. Delete removed details (those in orderData but not in current details)
      const currentDetailIds = details
        .filter(d => d.detailId)
        .map(d => d.detailId);
      
      const removedDetails = orderData?.details?.filter((d: any) => !currentDetailIds.includes(d.id)) || [];
      for (const detail of removedDetails) {
        await deleteDetailMutation.mutateAsync({
          id: orderId,
          detailId: detail.id,
        });
      }

      // 4. Add new details (those without detailId)
      const newDetails = details.filter(d => !d.detailId);
      for (const detail of newDetails) {
        await addDetailMutation.mutateAsync({
          id: orderId,
          data: {
            type: detail.type === 'exchange' ? 'exchange' : 'return',
            quantity: detail.quantity,
            refundAmount: detail.refundAmount,
            newProductId: detail.productId,
            ...(detail.reason && { reason: detail.reason }),
          },
        });
      }

      message.success("Cập nhật đơn trả/đổi thành công!");
      queryClient.invalidateQueries({ queryKey: ["return-orders"] });
      navigate("/dashboard/products/return-orders/list");
    } catch (error: any) {
      message.error("Lỗi khi cập nhật đơn");
    }
  };

  const totalRefundAmount = useMemo(() => {
    return details
      .filter((item) => item.type === "refund")
      .reduce((sum, item) => sum + item.refundAmount, 0);
  }, [details]);

  // Table columns
  const columns = [
    {
      title: "Loại",
      dataIndex: "type",
      width: 100,
      render: (type: string) => (
        <Tag color={type === "exchange" ? "blue" : "green"}>
          {type === "exchange" ? "Đổi hàng" : "Hoàn tiền"}
        </Tag>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      width: 200,
      render: (_: any, record: ReturnOrderDetailForm) => {
        const name =
          record.productName ||
          (record as any).product?.name ||
          (record as any).newProduct?.name ||
          "—";
        return <span className="text-sm font-medium">{name}</span>;
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      width: 100,
      render: (qty: number) => <span className="font-medium">{qty}</span>,
    },
    {
      title: "Số tiền hoàn",
      dataIndex: "refundAmount",
      width: 150,
      render: (amount: number, record: ReturnOrderDetailForm) => (
        record.type === "refund" ? (
          <span className="font-semibold text-teal-600">
            {amount.toLocaleString("vi-VN")} đ
          </span>
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        )
      ),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      render: (reason: string | undefined) => (
        <span className="text-sm text-gray-600">{reason || "—"}</span>
      ),
    },
    {
      title: "",
      width: 80,
      render: (_: any, record: ReturnOrderDetailForm) => (
        <div className="flex gap-2">
          <Button
            type="link"
            size="small"
            onClick={() => handleRemoveDetail(record.tempId!)}
            danger
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Không tìm thấy đơn trả/đổi</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gray-50 font-['Inter']">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeft size={18} />}
              onClick={() => navigate(-1)}
              className="border-none bg-transparent shadow-none"
            />
            <h1 className="font-bold text-[#102e3c] text-2xl sm:text-3xl">
              Sửa Đơn Trả/Đổi Hàng
            </h1>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<Save size={18} />}
            onClick={handleSubmit}
            loading={addDetailMutation.isPending}
            className="bg-[#1a998f] hover:bg-[#158f85] h-[42px] px-6 font-semibold"
          >
            Lưu Thay Đổi
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6 flex gap-4">
        {/* LEFT - Info */}
        <div className="w-[420px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
          {/* Hóa đơn gốc */}
          <Card className="shadow-sm rounded-xl border border-gray-200">
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">Hóa Đơn Gốc</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã hóa đơn:</span>
                  <span className="font-mono font-semibold">{order.transaction?.id?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="font-semibold">{formatCurrency(order.transaction?.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế:</span>
                  <span className="font-semibold">{formatCurrency(order.transaction?.taxAmount || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-800 font-bold">Khách hàng phải trả:</span>
                  <span className="font-bold text-teal-700">{formatCurrency(order.transaction?.finalAmount || 0)}</span>
                </div>
              </div>

              {/* Transaction detail viewer (from CreateReturnOrder) */}
              <div className="pt-3 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">Chi tiết hóa đơn</h4>
                {selectedTransaction ? (
                  <Table
                    size="small"
                    pagination={false}
                    dataSource={selectedTransaction.details || []}
                    rowKey={(row) => row.id}
                    columns={[
                      {
                        title: "Sản phẩm",
                        dataIndex: ["product", "name"],
                        render: (_: any, row: any) => row.product?.name || row.productName || "",
                      },
                      {
                        title: "SL",
                        dataIndex: "quantity",
                        width: 60,
                      },
                      {
                        title: "Đơn giá",
                        dataIndex: "unitPrice",
                        width: 110,
                        render: (v: number) => v?.toLocaleString("vi-VN") + " đ",
                      },
                      {
                        title: "Thành tiền",
                        dataIndex: "totalPrice",
                        width: 120,
                        render: (v: number, row: any) =>
                          (v ?? row.unitPrice * row.quantity)?.toLocaleString("vi-VN") + " đ",
                      },
                    ]}
                  />
                ) : (
                  <div className="text-sm text-gray-500">Không tìm thấy chi tiết hóa đơn.</div>
                )}
              </div>
            </div>
          </Card>

          {/* Customer Info Card */}
          <Card className="shadow-sm rounded-xl border border-gray-200">
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">Thông Tin Khách Hàng</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Tên:</span>
                  <div className="font-semibold text-[#102e3c] mt-1">
                    {order.customer?.fullName || order.customerName}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Số điện thoại:</span>
                  <div className="font-semibold text-[#102e3c]">{order.customer?.phoneNumber || "—"}</div>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <div className="font-semibold text-[#102e3c]">{order.customer?.email || "—"}</div>
                </div>
                <div>
                  <span className="text-gray-600">Địa chỉ:</span>
                  <div className="font-semibold text-[#102e3c] text-xs">{order.customer?.address || "—"}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Refund Summary Card */}
          <Card className="shadow-sm rounded-xl border border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Số chi tiết:</span>
                <span className="font-semibold">{details.length}</span>
              </div>
              <div className="flex justify-between items-center text-base border-t pt-2">
                <span className="font-bold text-gray-800">Tổng hoàn:</span>
                <span className="font-bold text-xl text-teal-600">
                  {totalRefundAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
          </Card>

          {/* Notes Card (editable) */}
          <Card className="shadow-sm rounded-xl border border-gray-200">
            <div className="space-y-2">
              <h3 className="font-bold text-gray-800 text-sm">Ghi Chú</h3>
              <Input.TextArea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú..."
                maxLength={500}
                showCount
              />
            </div>
          </Card>
        </div>

        {/* RIGHT - Details List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Card
            className="flex-1 shadow-sm rounded-xl flex flex-col border border-gray-200"
            styles={{ body: { padding: 0, height: "100%", display: "flex", flexDirection: "column" } }}
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h3 className="font-bold text-lg text-[#102e3c]">
                Danh Sách Chi Tiết Trả/Đổi
              </h3>
              <Button
                type="primary"
                icon={<Plus size={18} />}
                className="bg-[#1a998f]"
                onClick={() => {
                  setEditingDetail(null);
                  setIsModalOpen(true);
                }}
              >
                Thêm Chi Tiết
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <Table
                dataSource={details}
                columns={columns}
                rowKey="tempId"
                pagination={false}
                sticky
                onRow={(record) => ({
                  onClick: () => handleEditDetail(record),
                  className: "cursor-pointer hover:bg-gray-50",
                })}
              />
              {details.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  Chưa có chi tiết nào. Nhấn "Thêm Chi Tiết" để bắt đầu.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <ReturnOrderDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddDetail}
        initialValues={editingDetail}
        transactionDetails={selectedTransaction?.details || []}
        existingDetails={details}
      />
    </div>
  );
};
