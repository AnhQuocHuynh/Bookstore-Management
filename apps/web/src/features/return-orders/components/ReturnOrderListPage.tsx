import { useState } from "react";
import { Button, Input, Select, Modal, message } from "antd";
import { Plus, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";
import { useReturnOrders, useDeleteReturnOrder } from "../hooks/useReturnOrder";
import { ReturnOrderTable, TableHeader } from "./ReturnOrderTable";
import { ReturnOrderDetailPanel } from "./ReturnOrderDetailPanel";
import { ReturnOrderListItem } from "../types";

const { Option } = Select;

export const ReturnOrderListPage = () => {
  const navigate = useNavigate();
  
  // --- States ---
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 500);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<ReturnOrderListItem | null>(null);

  // --- Data Fetching ---
  const { data: ordersData, isLoading } = useReturnOrders({
    customerName: debouncedSearch || undefined,
    status: statusFilter as any,
  });

  // Use empty array if no real data is available and normalize customer name
  const orders = (ordersData || []).map((o: any) => ({
    ...o,
    customerName: o?.customerName || o?.customer?.fullName || o?.customer?.name || "",
  }));

  const isPanelOpen = !!selectedOrder;

  // --- Handlers ---
  const handleRowClick = (record: ReturnOrderListItem) => {
    if (selectedOrder?.id === record.id) {
      setSelectedOrder(null);
    } else {
      setSelectedOrder(record);
    }
  };

  const handleOpenCreateModal = () => {
    navigate("/dashboard/products/return-orders/create");
  };

  const deleteMutation = useDeleteReturnOrder();

  const handleEdit = () => {
    if (!selectedOrder) return;
    if (selectedOrder.status !== "pending") {
      message.warning("Chỉ có thể sửa đơn ở trạng thái chờ duyệt");
      return;
    }
    navigate(`/dashboard/products/return-orders/edit/${selectedOrder.id}`);
  };

  const handleDelete = () => {
    if (!selectedOrder) return;
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa đơn "${selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}"? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        deleteMutation.mutate(selectedOrder.id);
        setSelectedOrder(null);
      },
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col font-['Inter']">
      {/* --- Header --- */}
      <div className="flex-shrink-0 px-6 pt-3 pb-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-bold text-[#102e3c] text-2xl sm:text-3xl lg:text-4xl">
              Đơn Trả/Đổi Hàng
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={handleDelete}
                danger
                disabled={!selectedOrder || selectedOrder.status !== "pending"}
                className="h-10 rounded-xl font-semibold"
                title={selectedOrder && selectedOrder.status !== "pending" ? "Chỉ có thể xóa đơn ở trạng thái chờ duyệt" : ""}
              >
                Xóa
              </Button>
              <Button
                onClick={handleEdit}
                disabled={!selectedOrder || selectedOrder.status !== "pending"}
                className="h-10 rounded-xl font-semibold border-teal-600 text-teal-700"
                title={selectedOrder && selectedOrder.status !== "pending" ? "Chỉ có thể sửa đơn ở trạng thái chờ duyệt" : ""}
              >
                Sửa
              </Button>
              <Button
                type="primary"
                icon={<Plus size={18} />}
                className="bg-[#1a998f] hover:bg-[#158f85] h-10 px-4 rounded-xl font-bold border-none"
                onClick={handleOpenCreateModal}
              >
                Tạo Mới
              </Button>
            </div>
          </div>

          {/* --- Filter Bar --- */}
          <div className="flex flex-wrap items-center gap-3 mt-2 bg-white p-3 rounded-xl border border-[#102e3c]/10 shadow-sm">
            <div className="relative w-full sm:flex-1 min-w-[200px]">
              <Input
                prefix={<Search size={16} className="text-gray-400" />}
                placeholder="Tìm theo tên khách hàng..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="rounded-lg border-teal-600/30 hover:border-teal-600 focus:border-teal-600 h-[38px]"
              />
            </div>

            <Select
              placeholder="Trạng thái"
              allowClear
              value={statusFilter || undefined}
              onChange={(value) => setStatusFilter(value)}
              className="w-full sm:w-40 rounded-lg"
              style={{ height: "38px" }}
            >
              <Option value="pending">Chờ duyệt</Option>
              <Option value="approved">Đã duyệt</Option>
              <Option value="rejected">Từ chối</Option>
              <Option value="completed">Hoàn tất</Option>
            </Select>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <main className="flex-1 px-6 pb-6 overflow-hidden mt-4 relative">
        <section className="relative w-full h-full bg-white rounded-[20px] overflow-hidden border border-solid border-[#102e3c] shadow-sm flex flex-col">
          
          {/* Table Section */}
          <div
            className={`absolute top-3 bottom-3 left-[13px] rounded-[20px] transition-all duration-300 flex flex-col bg-white z-10 ${
              selectedOrder ? "right-[450px]" : "right-[20px]"
            }`}
          >
            <div className="flex-shrink-0">
              <TableHeader isPanelOpen={isPanelOpen} />
            </div>

            <div className="flex-1 overflow-y-auto relative custom-scrollbar">
              <ReturnOrderTable
                data={orders || []}
                loading={isLoading}
                selectedItem={selectedOrder}
                onRowClick={handleRowClick}
                isPanelOpen={isPanelOpen}
              />
            </div>
          </div>

          {/* Detail Panel */}
          <div
            className={`absolute top-3 bottom-3 w-[430px] bg-white rounded-[20px] border-[3px] border-[#1a998f] transition-all duration-300 ease-in-out z-20 shadow-xl overflow-hidden flex flex-col ${
              selectedOrder
                ? "right-3 translate-x-0 opacity-100"
                : "right-3 translate-x-[110%] opacity-0 pointer-events-none"
            }`}
          >
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors z-50 cursor-pointer"
            >
              <X size={24} />
            </button>
            <div className="flex-1 overflow-hidden h-full">
              <ReturnOrderDetailPanel orderId={selectedOrder?.id || null} onDeleteSuccess={() => setSelectedOrder(null)} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReturnOrderListPage;
