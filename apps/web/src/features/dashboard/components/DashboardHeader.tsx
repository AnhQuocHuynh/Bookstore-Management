// file: components/DashboardHeader.tsx
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import dayjs from "dayjs";

interface DashboardHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const DashboardHeader = ({ selectedDate, onDateChange }: DashboardHeaderProps) => {
  // Header này dùng chung cho cả trang, bỏ DashboardChartHeader đi vì trùng lặp
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <h1 className="text-xl sm:text-2xl font-bold text-[#102E3C]">
        Tổng quan kinh doanh
      </h1>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-fit flex gap-2 border-gray-300 bg-white text-[#102E3C] hover:bg-gray-50">
            <CalendarIcon className="h-5 w-5 text-[#1A998F]" />
            <span>
              {selectedDate ? `Tháng ${dayjs(selectedDate).format("MM/YYYY")}` : "Chọn tháng"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateChange(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};