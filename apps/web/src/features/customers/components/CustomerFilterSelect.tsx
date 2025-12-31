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
        <SelectItem value="premium">Thành viên</SelectItem>
        <SelectItem value="vip">VIP</SelectItem>
        <SelectItem value="regular">Khách thường</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default CustomerFilterSelect;
