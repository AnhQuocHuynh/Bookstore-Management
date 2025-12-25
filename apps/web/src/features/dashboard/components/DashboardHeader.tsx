import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

export const DashboardHeader = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [open, setOpen] = useState(false);

  const handleSelect = (date: Date) => {
    setSelectedDate(date);
    setOpen(false); // đóng popover khi chọn
  };

  return (
    <div className="flex items-center justify-between pr-4">
      {/* Tiêu đề */}
      <h1 className="text-xl sm:text-2xl font-bold text-[#102E3C]">
        Tổng quan kinh doanh
      </h1>

      {/* Bộ lọc ngày */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-lg border 
            border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <CalendarIcon className="h-5 w-5 text-[#1A998F]" />
            <span className="text-[#102E3C]">
              {selectedDate ? selectedDate.toLocaleDateString() : "Chọn ngày"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 mr-5">
          <Calendar
            mode="single"
            required
            selected={selectedDate}
            onSelect={handleSelect}
            className="border-0"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
