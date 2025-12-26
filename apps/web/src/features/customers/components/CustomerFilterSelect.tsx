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
        <SelectValue placeholder="Lọc theo loại KH" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả</SelectItem>
        <SelectItem value="Thành viên">Thành viên</SelectItem>
        <SelectItem value="VIP">VIP</SelectItem>
        <SelectItem value="Khách thường">Khách thường</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default CustomerFilterSelect;
