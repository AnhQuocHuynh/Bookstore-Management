"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CustomerDetailModal from "@/features/customers/components/CustomerDetailModal";
import {
  Customer,
  CUSTOMER_TYPE_LABEL,
} from "@/features/customers/types/customer.type";
import { Eye, AlertCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

const PAGE_SIZE = 5;

interface CustomerListProps {
  customers: Customer[];
}

const CustomerList = ({ customers }: CustomerListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const totalPages = Math.ceil(customers.length / PAGE_SIZE);

  const paginatedData = customers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <>
      <div className="rounded-xl border bg-white shadow-sm w-full overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="px-4 sm:px-6 py-3">Mã KH</TableHead>
                <TableHead className="px-4 sm:px-6 py-3">
                  Tên khách hàng
                </TableHead>
                <TableHead className="px-4 sm:px-6 py-3">
                  Số điện thoại
                </TableHead>
                <TableHead className="px-4 sm:px-6 py-3 hidden md:table-cell">
                  Email
                </TableHead>
                <TableHead className="px-4 sm:px-6 py-3 hidden lg:table-cell">
                  Loại KH
                </TableHead>
                <TableHead className="px-4 sm:px-6 py-3 text-right hidden sm:table-cell">
                  Ngày tạo hồ sơ
                </TableHead>
                <TableHead className="px-4 sm:px-6 py-3 text-center w-20">
                  Xem
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <TableCell className="px-4 sm:px-6 py-4 font-medium">
                      {customer.customerCode}
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-4">
                      {customer.fullName}
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-4">
                      {customer.phoneNumber}
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-4 hidden md:table-cell">
                      {customer.email}
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          customer.customerType === "premium"
                            ? "bg-green-100 text-green-800"
                            : customer.customerType === "vip"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {CUSTOMER_TYPE_LABEL[customer.customerType] ??
                          "Không xác định"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-4 text-right text-sm text-gray-600 hidden sm:table-cell">
                      {format(new Date(customer.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="flex flex-col items-center justify-center py-6 text-gray-500 gap-2">
                      <AlertCircle className="h-6 w-6 text-gray-400" />
                      <span>Không tìm thấy khách hàng</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination: chỉ hiển thị khi có dữ liệu */}
        {paginatedData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t px-4 sm:px-6 py-4 gap-2 sm:gap-0">
            <span className="text-sm text-gray-500">
              Trang {currentPage} / {totalPages}
            </span>

            <div className="flex gap-2 select-none">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal xem chi tiết */}
      <CustomerDetailModal
        customer={selectedCustomer}
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </>
  );
};

export default CustomerList;
