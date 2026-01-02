import React, { useState, useEffect } from "react";
import { message, Modal } from "antd";
import { ActionButton } from "./ActionButton";
import { SupplierTable, TableHeader } from "./SupplierTable";
import { SupplierDetailPanel } from "./SupplierDetailPanel";
import { SorterButton } from "./SorterButton";
import { SupplierAddPanel, SupplierFormData } from "./SupplierAddPanel";
import { SupplierEditPanel } from "./SupplierEditPanel";
import { MOCK_SUPPLIERS } from "./mockData";

/** ================= TYPES ================= */
interface Supplier {
  key: number;
  id?: string;
  supplierId: string;
  name: string;
  email: string;
  phoneNumber: string;
  contactPerson: string;
  status: string;
  address?: string;
  taxCode?: string;
  note?: string;
  createdDate?: string;
  updateDate?: string;
}

/** ================= PAGE ================= */
export const SuppliersPage = () => {
  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(null);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const scrollbarTrackRef = React.useRef<HTMLDivElement>(null);

  /** ================= FETCH LIST ================= */
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);

        /* ================= REAL API (COMMENTED) =================
        const response = await axios.get("/api/v1/suppliers", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (response.data?.data) {
          const supplierList = Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data];

          const formattedSuppliers = supplierList.map(
            (supplier: any, index: number) => ({
              key: supplier.id || index,
              id: supplier.id,
              supplierId: supplier.supplierCode || "N/A",
              name: supplier.name || "N/A",
              email: supplier.email || "N/A",
              phoneNumber: supplier.phoneNumber || "N/A",
              contactPerson: supplier.contactPerson || "N/A",
              status: supplier.status || "N/A",
              address: supplier.address || "N/A",
              taxCode: supplier.taxCode || "N/A",
              note: supplier.note || "",
              createdDate: supplier.createdAt || "N/A",
              updateDate: supplier.updatedAt || "N/A",
            }),
          );

          setData(formattedSuppliers);
        }
        ========================================================== */

        // ✅ MOCK DATA
        setTimeout(() => {
          const sortedData = sortSuppliers(MOCK_SUPPLIERS, sortBy);
          setData(sortedData);
          setLoading(false);
        }, 500);
      } catch (error) {
        message.error("Không thể tải danh sách nhà cung cấp");
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [sortBy]);

  /** ================= HANDLE ROW CLICK ================= */
  const handleRowClick = (record: Supplier) => {
    setSelectedSupplier(record);
  };

  /** ================= HANDLE ADD SUPPLIER ================= */
  const handleAddSupplier = (data: SupplierFormData) => {
    const newSupplier: Supplier = {
      key: Math.max(...MOCK_SUPPLIERS.map(s => s.key), 0) + 1,
      supplierId: `SUP${Date.now()}`,
      name: data.name,
      email: data.email,
      phoneNumber: data.phone,
      contactPerson: data.contactPerson,
      status: data.status,
      address: data.address,
      taxCode: data.taxCode,
      note: data.note,
      createdDate: new Date().toLocaleDateString("vi-VN"),
      updateDate: new Date().toLocaleDateString("vi-VN"),
    };

    setData((prev) => [newSupplier, ...prev]);
    setIsAddPanelOpen(false);
  };

  /** ================= HANDLE EDIT SUPPLIER ================= */
  const handleEditClick = () => {
    if (!selectedSupplier) {
      message.warning("Bạn chưa chọn nhà cung cấp");
      return;
    }
    setIsEditPanelOpen(true);
  };

  const handleEditSupplier = (formData: SupplierFormData) => {
    if (!selectedSupplier) return;

    setData((prev) =>
      prev.map((supplier) =>
        supplier.key === selectedSupplier.key
          ? {
              ...supplier,
              name: formData.name,
              email: formData.email,
              phoneNumber: formData.phone,
              contactPerson: formData.contactPerson,
              status: formData.status,
              address: formData.address,
              taxCode: formData.taxCode,
              note: formData.note,
              updateDate: new Date().toLocaleDateString("vi-VN"),
            }
          : supplier
      )
    );
    setIsEditPanelOpen(false);
  };

  /** ================= HANDLE DELETE SUPPLIER ================= */
  const handleDeleteClick = () => {
    if (!selectedSupplier) {
      message.warning("Bạn chưa chọn nhà cung cấp");
      return;
    }

    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa nhà cung cấp?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => {
        setData((prev) => prev.filter((s) => s.key !== selectedSupplier.key));
        setSelectedSupplier(null);
        message.success("Đã xóa nhà cung cấp thành công");
      },
    });
  };

  /** ================= SORT SUPPLIERS ================= */
  const sortSuppliers = (suppliers: Supplier[], sortKey: string): Supplier[] => {
    const sorted = [...suppliers].sort((a, b) => {
      let aValue = "";
      let bValue = "";

      if (sortKey === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortKey === "contactPerson") {
        aValue = a.contactPerson.toLowerCase();
        bValue = b.contactPerson.toLowerCase();
      } else if (sortKey === "supplierId") {
        aValue = a.supplierId.toLowerCase();
        bValue = b.supplierId.toLowerCase();
      }

      return aValue.localeCompare(bValue, "vi");
    });

    return sorted;
  };

  /** ================= HANDLE SORT CHANGE ================= */
  const handleSortChange = (sortKey: string) => {
    setSortBy(sortKey);
    const sortedData = sortSuppliers(data, sortKey);
    setData(sortedData);
  };

  /** ================= CHECK IF SCROLLING NEEDED ================= */
  const checkScrollNeeded = () => {
    // If more than 5 rows, scrolling will be needed (each row is 48px, header is 48px)
    // Estimate: header 48px + 5 rows = 288px. If content exceeds container height
    const rowHeight = 48; // h-12 = 48px
    const headerHeight = 48;
    const maxVisibleRows = Math.floor((window.innerHeight - 200) / rowHeight);
    setNeedsScroll(data.length > maxVisibleRows);
  };

  useEffect(() => {
    checkScrollNeeded();
    window.addEventListener("resize", checkScrollNeeded);
    return () => window.removeEventListener("resize", checkScrollNeeded);
  }, [data]);

  /** ================= HANDLE TABLE SCROLL ================= */
  const handleTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    setScrollTop(scrollTop);

    // Calculate thumb height
    const proportion = clientHeight / scrollHeight;
    const trackHeight = target.clientHeight - 24; // Subtract top/bottom padding
    const calculatedThumbHeight = Math.max(proportion * trackHeight, 40); // Min thumb height of 40px
    setThumbHeight(calculatedThumbHeight);
  };

  /** ================= HANDLE SCROLLBAR THUMB DRAG ================= */
  const handleThumbMouseDown = () => {
    setIsDragging(true);
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!tableContainerRef.current || !scrollbarTrackRef.current) return;

      const track = scrollbarTrackRef.current;
      const table = tableContainerRef.current;

      const trackRect = track.getBoundingClientRect();
      const thumbHeight = Math.max(
        (table.clientHeight / table.scrollHeight) * (table.clientHeight - 24),
        40
      );
      const trackHeight = track.clientHeight;

      let newTop = e.clientY - trackRect.top - thumbHeight / 2;
      newTop = Math.max(0, Math.min(newTop, trackHeight - thumbHeight));

      const proportion = newTop / (trackHeight - thumbHeight);
      const scrollPosition = proportion * (table.scrollHeight - table.clientHeight);

      table.scrollTop = scrollPosition;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  /** ================= HANDLE SCROLLBAR TRACK CLICK ================= */
  const handleScrollbarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tableContainerRef.current || !scrollbarTrackRef.current) return;

    const track = scrollbarTrackRef.current;
    const table = tableContainerRef.current;
    const clickY = e.clientY - track.getBoundingClientRect().top;

    const thumbHeight = Math.max(
      (table.clientHeight / table.scrollHeight) * (table.clientHeight - 24),
      40
    );
    const trackHeight = track.clientHeight;

    let newTop = clickY - thumbHeight / 2;
    newTop = Math.max(0, Math.min(newTop, trackHeight - thumbHeight));

    const proportion = newTop / (trackHeight - thumbHeight);
    const scrollPosition = proportion * (table.scrollHeight - table.clientHeight);

    table.scrollTop = scrollPosition;
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Header */}
      <header className="flex flex-col w-[calc(100%_-_64px)] items-start absolute top-[11px] left-8">
        <h1 className="relative flex items-center justify-start self-stretch mt-[-1.00px] font-bold text-[#102e3c] text-4xl tracking-[-0.75px] leading-[37.5px]">
          Danh sách Nhà cung cấp
        </h1>
      </header>

      
      {/* Action Buttons */}
      <section className="absolute top-[7px] right-7 h-[58px] flex items-center">
  {/* Sorter — bigger gap */}
  <div className="mr-10">
    <SorterButton
      onSortChange={handleSortChange}
      currentSort={sortBy}
    />
  </div>

  {/* Action buttons — smaller gap */}
  <div className="flex items-center gap-2.5">
    <ActionButton label="Xóa" variant="outlined" onClick={handleDeleteClick} />
    <ActionButton label="Sửa" variant="outlined" onClick={handleEditClick} />
    <ActionButton label="Tạo Mới" variant="filled" onClick={() => setIsAddPanelOpen(true)} />
  </div>
</section>


      {/* Main Section */}
      <main>
        <section className="absolute top-[70px] left-6 right-6 bottom-6 bg-white rounded-[20px] overflow-hidden border border-solid border-[#102e3c] shadow-[0px_1px_2px_#0000000d]">
          {/* Custom Scrollbar Slider */}
          {needsScroll && (
            <div
              ref={scrollbarTrackRef}
              className={`absolute top-[72px] bottom-3 w-[15px] bg-[#d4e5e4] rounded-[999px] cursor-pointer transition-all duration-300 ${
                selectedSupplier ? "right-[480px]" : "right-[20px]"
              }`}
              role="scrollbar"
              aria-orientation="vertical"
              aria-valuemin={0}
              aria-valuemax={100}
              onClick={handleScrollbarClick}
            >
              <div 
                className={`w-[15px] bg-[#102e3c] rounded-[999px] hover:bg-[#1a998f] transition-colors cursor-grab active:cursor-grabbing ${
                  isDragging ? "bg-[#1a998f]" : ""
                }`}
                style={{
                  height: `${thumbHeight || 40}px`,
                  transform: `translateY(${
                    tableContainerRef.current
                      ? (scrollTop / (tableContainerRef.current.scrollHeight - tableContainerRef.current.clientHeight)) *
                        (tableContainerRef.current.clientHeight - 24 - (thumbHeight || 40))
                      : 0
                  }px)`,
                  transition: isDragging ? "none" : "transform 0.1s ease-out",
                }}
                onMouseDown={handleThumbMouseDown}
              />
            </div>
          )}

          {/* Navigation Controls */}
          <button
  type="button"
  aria-label="Toggle detail panel"
  className={`absolute top-[15px] w-12 h-12
    cursor-pointer
    hover:opacity-70
    transition-all duration-300
    outline-none border-none
    focus:outline-none focus:ring-0
    active:outline-none
    ${
      selectedSupplier
        ? "right-[462px] rotate-90"
        : "right-[2px] rotate-0"
    }`}
  onClick={() => {
    if (selectedSupplier) {
      setSelectedSupplier(null);
    } else if (data.length > 0) {
      setSelectedSupplier(data[0]);
    }
  }}
>

            <svg className="w-full h-full" viewBox="0 0 48 48" fill="none">
              <path d="M31 10H22L32 24L22 38H31L41 24L31 10Z" fill="#102E3C" />
              <path d="M17 10H8L18 24L8 38H17L27 24L17 10Z" fill="#102E3C" />
            </svg>
          </button>

          {/* Table Wrapper - Contains both header and scrollable body */}
          <div 
            className={`absolute top-3 bottom-3 left-[13px] rounded-[20px] transition-all duration-300 flex flex-col ${
              selectedSupplier ? "right-[525px]" : "right-[65px]"
            }`}
          >
            {/* Table Header (Sticky) */}
            <div className="flex-shrink-0">
              <TableHeader />
            </div>

            {/* Table Container (Scrollable) */}
            <div 
              ref={tableContainerRef}
              className="flex flex-col items-start overflow-y-auto flex-1"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              onScroll={handleTableScroll}
            >
              <style>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <SupplierTable
                data={data}
                loading={loading}
                selectedSupplier={selectedSupplier}
                onRowClick={handleRowClick}
              />
            </div>
          </div>

          {/* Detail Panel */}
          <SupplierDetailPanel selectedSupplier={selectedSupplier} />
        </section>
      </main>

      {/* Add Supplier Modal */}
      <SupplierAddPanel
        isOpen={isAddPanelOpen}
        onClose={() => setIsAddPanelOpen(false)}
        onSubmit={handleAddSupplier}
      />

      {/* Edit Supplier Modal */}
      <SupplierEditPanel
        isOpen={isEditPanelOpen}
        onClose={() => setIsEditPanelOpen(false)}
        onSubmit={handleEditSupplier}
        initialData={
          selectedSupplier
            ? {
                name: selectedSupplier.name,
                email: selectedSupplier.email,
                phone: selectedSupplier.phoneNumber,
                address: selectedSupplier.address || "",
                status: selectedSupplier.status as "Hoạt động" | "Ngưng hoạt động",
                taxCode: selectedSupplier.taxCode || "",
                contactPerson: selectedSupplier.contactPerson,
                note: selectedSupplier.note || "",
              }
            : undefined
        }
      />
    </div>
  );
};
