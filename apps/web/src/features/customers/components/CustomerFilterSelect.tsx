"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomerFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const CustomerFilterSelect = ({
  value,
  onChange,
}: CustomerFilterSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Lọc theo trạng thái" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả</SelectItem>
        <SelectItem value="Hoạt động">Hoạt động</SelectItem>
        <SelectItem value="Ngừng hoạt động">Ngừng hoạt động</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default CustomerFilterSelect;
