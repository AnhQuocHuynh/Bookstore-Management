"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CustomerSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CustomerSearchBar = ({
  value,
  onChange,
  placeholder = "Tìm theo tên, SĐT hoặc mã khách hàng",
  className,
}: CustomerSearchBarProps) => {
  return (
    <div className={`relative w-full max-w-sm ${className || ""}`}>
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <Search className="h-4 w-4 text-gray-400" />
      </div>

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 w-full"
      />
    </div>
  );
};

export default CustomerSearchBar;
