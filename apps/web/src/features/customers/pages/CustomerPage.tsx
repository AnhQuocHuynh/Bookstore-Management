"use client";

import Loading from "@/components/Loading";
import CustomerFilterSelect from "@/features/customers/components/CustomerFilterSelect";
import CustomerList from "@/features/customers/components/CustomerList";
import CustomerSearchBar from "@/features/customers/components/CustomerSearchBar";
import { useGetCustomers } from "@/features/customers/hooks/use-get-customers";
import { Customer } from "@/features/customers/types/customer.type";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMemo, useState } from "react";

const CustomerPage = () => {
  const { user } = useAuthStore();
  const [searchText, setSearchText] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const { data, isLoading } = useGetCustomers(user?.id ?? "");

  const customers = useMemo<Customer[]>(() => {
    return data?.data ?? [];
  }, [data]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.phoneNumber.includes(searchText) ||
        customer.id.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        customerTypeFilter === "all" ||
        customer.customerType === customerTypeFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchText, customerTypeFilter]);

  if (isLoading) return <Loading text="Đang tải dữ liệu..." />;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-xl sm:text-2xl font-bold text-[#102E3C]">
          Danh sách khách hàng
        </h1>
        <p className="text-sm text-gray-600">
          Danh sách và thông tin chi tiết khách hàng của nhà sách.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <CustomerSearchBar
            value={searchText}
            onChange={setSearchText}
            className="w-full"
          />
        </div>

        <div className="w-full sm:w-auto">
          <CustomerFilterSelect
            value={customerTypeFilter}
            onChange={setCustomerTypeFilter}
          />
        </div>
      </div>

      <CustomerList customers={filteredCustomers} />
    </div>
  );
};

export default CustomerPage;
