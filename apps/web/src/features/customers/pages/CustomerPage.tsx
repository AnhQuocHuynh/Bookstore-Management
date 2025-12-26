"use client";

import CustomerFilterSelect from "@/features/customers/components/CustomerFilterSelect";
import CustomerList from "@/features/customers/components/CustomerList";
import CustomerSearchBar from "@/features/customers/components/CustomerSearchBar";
import { mockCustomers } from "@/features/customers/data/customers";
import { useMemo, useState } from "react";

const CustomerPage = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.phone.includes(searchText) ||
        customer.id.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchText, statusFilter]);

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
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      <CustomerList customers={filteredCustomers} />
    </div>
  );
};

export default CustomerPage;
