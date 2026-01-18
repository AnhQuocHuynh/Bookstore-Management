import { useState, useMemo, useEffect } from "react";
import { Button, Card, Input, Select, Table, message, Tag, Modal, DatePicker, Row, Col } from "antd";
import { Plus, Save, Trash2, ArrowLeft, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { useCreateReturnOrder, useReturnOrderDetail } from "../hooks/useReturnOrder";
import { ReturnOrderDetailModal } from "./ReturnOrderDetailModal";
import { CreateReturnOrderDto } from "../types";
import { useTransactions } from "@/features/sales/hooks/use-transactions";
import dayjs, { Dayjs } from "dayjs";

export interface ReturnOrderDetailForm {
  type: "exchange" | "refund";
  quantity: number;
  refundAmount: number;
  productId: string; // Must be one of the purchased products
  productName: string; // For display
  newProductId?: string;
  newProductName?: string; // For display
  reason?: string;
  tempId?: string; // For local editing
}

export const CreateReturnOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingOrderId = (location.state as any)?.editingOrderId;

  // States
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [details, setDetails] = useState<ReturnOrderDetailForm[]>([]);
  
  // Search filter states
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [customerNameSearch, setCustomerNameSearch] = useState("");
  const [customerPhoneSearch, setCustomerPhoneSearch] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<ReturnOrderDetailForm | null>(null);

  // Fetch existing order data if editing
  const { data: existingOrderData, isLoading: loadingOrderData } = useReturnOrderDetail(editingOrderId);
  
  // Initialize with existing data when editing
  useEffect(() => {
    if (existingOrderData && editingOrderId) {
      console.log("[CreateReturnOrderPage] Pre-filling form with existing order data:", existingOrderData);
      setNote(existingOrderData.note || "");
      // Note: We'll populate transactionId when we have the transaction details
    }
  }, [existingOrderData, editingOrderId]);

  // Hooks
  const { data: customersResponse, isLoading: loadingCustomers } = useCustomers();
  const customers = Array.isArray(customersResponse)
    ? customersResponse
    : Array.isArray(customersResponse?.data)
    ? customersResponse.data
    : [];
  const activeCustomers = customers.filter((c: any) => c.status === "active");

  const { data: transactionsResponse, isLoading: loadingTransactions } = useTransactions();
  const allTransactions = Array.isArray(transactionsResponse) ? transactionsResponse : [];

  // Filter transactions based on search criteria
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((t: any) => {
      // Date range filter
      if (dateRange && dateRange[0] && dateRange[1]) {
        const transactionDate = dayjs(t.createdAt);
        if (
          transactionDate.isBefore(dateRange[0], "day") ||
          transactionDate.isAfter(dateRange[1], "day")
        ) {
          return false;
        }
      }

      // Customer name filter
      if (customerNameSearch.trim()) {
        const customerName = (t.customer?.fullName || t.customer?.name || "").toLowerCase();
        if (!customerName.includes(customerNameSearch.toLowerCase())) {
          return false;
        }
      }

      // Customer phone filter
      if (customerPhoneSearch.trim()) {
        const phoneNumber = (t.customer?.phoneNumber || "").toLowerCase();
        if (!phoneNumber.includes(customerPhoneSearch.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [allTransactions, dateRange, customerNameSearch, customerPhoneSearch]);

  const selectedTransaction = useMemo(
    () => filteredTransactions.find((t: any) => t.id === transactionId),
    [filteredTransactions, transactionId]
  );

  const createMutation = useCreateReturnOrder();

  // Computed
  const totalRefundAmount = useMemo(() => {
    return details
      .filter((item) => item.type === "refund")
      .reduce((sum, item) => sum + item.refundAmount, 0);
  }, [details]);

  // Handlers
  const handleAddDetail = (newDetail: ReturnOrderDetailForm) => {
    const detailWithId = { ...newDetail, tempId: Date.now().toString() };
    
    if (editingDetail && editingDetail.tempId) {
      // Update existing
      setDetails(details.map(d => d.tempId === editingDetail.tempId ? detailWithId : d));
      message.success("Cập nhật chi tiết thành công");
    } else {
      // Merge if same product (and same exchange target when applicable)
      const existingIndex = details.findIndex((d) =>
        d.productId === newDetail.productId &&
        d.type === newDetail.type &&
        (d.type !== "exchange" || d.newProductId === newDetail.newProductId)
      );

      if (existingIndex !== -1) {
        const updated = [...details];
        const target = updated[existingIndex];
        updated[existingIndex] = {
          ...target,
          quantity: target.quantity + newDetail.quantity,
          refundAmount: target.refundAmount + newDetail.refundAmount,
          // keep latest reason/new product naming if provided
          reason: newDetail.reason ?? target.reason,
          newProductId: newDetail.newProductId ?? target.newProductId,
          newProductName: newDetail.newProductName ?? target.newProductName,
        };
        setDetails(updated);
        message.success("Đã gộp vào chi tiết hiện có");
      } else {
        // Add new
        setDetails([...details, detailWithId]);
        message.success("Đã thêm chi tiết vào danh sách");
      }
    }
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

  const handleSubmit = () => {
    
    // Validation
    if (!transactionId) return message.error("Vui lòng chọn hóa đơn gốc");
    if (!customerId) return message.error("Khách hàng không được auto-fill từ hóa đơn. Vui lòng kiểm tra lại.");
    if (details.length === 0) return message.error("Vui lòng thêm ít nhất 1 chi tiết trả/đổi");

    // Validate details
    for (const detail of details) {
      if (detail.type === "exchange" && !detail.newProductId) {
        return message.error("Chi tiết đổi hàng phải có sản phẩm đổi mới");
      }
    }

    const cleanTransactionId = transactionId.trim();
    const cleanCustomerId = customerId.trim();

    const payload: CreateReturnOrderDto = {
      transactionId: cleanTransactionId,
      customerId: cleanCustomerId,
      ...(note.trim() && { note: note.trim() }),
    };
    
    
    createMutation.mutate(payload, {
      onSuccess: () => {
        message.success("Tạo đơn trả/đổi thành công!");
        navigate("/dashboard/products/return-orders/list");
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || "Lỗi khi tạo đơn trả/đổi hàng";
      },
    });
  };

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
      render: (name: string) => <span className="text-sm font-medium">{name}</span>,
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
      title: "Sản phẩm đổi mới",
      dataIndex: "newProductName",
      render: (name: string | undefined, record: ReturnOrderDetailForm) =>
        record.type === "exchange" ? (
          <span className="text-sm">{name || "Chưa chọn"}</span>
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
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
      width: 100,
      render: (_: any, record: ReturnOrderDetailForm) => (
        <div className="flex gap-2">
          <Button
            type="link"
            size="small"
            icon={<Trash2 size={16} />}
            onClick={() => handleRemoveDetail(record.tempId!)}
            danger
          />
        </div>
      ),
    },
  ];

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
              {editingOrderId ? "Sửa Đơn Trả/Đổi Hàng" : "Tạo Đơn Trả/Đổi Hàng"}
            </h1>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<Save size={18} />}
            onClick={handleSubmit}
            loading={createMutation.isPending || loadingOrderData}
            className="bg-[#1a998f] hover:bg-[#158f85] h-[42px] px-6 font-semibold"
          >
            Lưu Đơn
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6 flex gap-4">
        {/* LEFT - Form */}
        <div className="w-[400px] flex-shrink-0 flex flex-col gap-4">
          {/* Search Filters Card */}
          <Card className="shadow-sm rounded-xl border border-gray-200">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Search size={16} />
                Tìm kiếm hóa đơn
              </h3>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khoảng ngày
                </label>
                <DatePicker.RangePicker
                  className="w-full"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  format="DD/MM/YYYY"
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khách hàng
                </label>
                <Input
                  placeholder="Nhập tên khách hàng..."
                  value={customerNameSearch}
                  onChange={(e) => setCustomerNameSearch(e.target.value)}
                  allowClear
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <Input
                  placeholder="Nhập số điện thoại..."
                  value={customerPhoneSearch}
                  onChange={(e) => setCustomerPhoneSearch(e.target.value)}
                  allowClear
                />
              </div>

              {/* Clear All */}
              <Button
                className="w-full"
                onClick={() => {
                  setDateRange(null);
                  setCustomerNameSearch("");
                  setCustomerPhoneSearch("");
                }}
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          </Card>

          <Card className="shadow-sm rounded-xl border border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hóa đơn gốc <span className="text-red-500">*</span>
                </label>
                <Select
                  showSearch
                  placeholder="Chọn hóa đơn"
                  optionFilterProp="label"
                  className="w-full"
                  loading={loadingTransactions}
                  options={filteredTransactions.map((t: any) => ({
                    label: `${t.id.slice(0, 8)} - ${t.finalAmount?.toLocaleString("vi-VN")} đ - ${t.customer?.fullName || t.customer?.name || "Chưa có KH"}`,
                    value: t.id,
                  }))}
                  value={transactionId}
                  onChange={(value) => {
                    setTransactionId(value);
                    // Auto-fill customer from selected transaction
                    const selectedTransaction: any = filteredTransactions.find((t: any) => t.id === value);
                    if (selectedTransaction?.customer?.id) {
                      setCustomerId(selectedTransaction.customer.id);
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <Input.TextArea
                  rows={4}
                  placeholder="VD: Hàng lỗi, khách yêu cầu đổi..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  showCount
                />
              </div>
            </div>
          </Card>

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

          {/* Transaction detail viewer */}
          <Card className="shadow-sm rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">Chi tiết hóa đơn</h3>
              {!selectedTransaction && (
                <span className="text-xs text-red-500">Chưa chọn hóa đơn</span>
              )}
            </div>

            {selectedTransaction ? (
              <div className="max-h-64 overflow-auto">
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
              </div>
            ) : (
              <div className="text-sm text-gray-500">Chọn hóa đơn để xem chi tiết.</div>
            )}
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
                Danh sách chi tiết trả/đổi
              </h3>
              <Button
                type="primary"
                icon={<Plus size={18} />}
                className="bg-[#1a998f]"
                onClick={() => {
                  if (!selectedTransaction) {
                    return message.error("Vui lòng chọn hóa đơn gốc trước.");
                  }
                  setEditingDetail(null);
                  setIsModalOpen(true);
                }}
                disabled={!selectedTransaction}
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
