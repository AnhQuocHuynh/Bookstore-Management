import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from 'antd';
import { ChevronLeft, ChevronRight, Calendar, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWeekSchedule } from '../hooks/useEmployees';
import { Shift, SHIFT_LABELS, SHIFT_COLORS, ShiftType } from '../types';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ShiftModal } from '../components/ShiftModal';
import { useShiftTimes } from '@/features/settings';

// ==========================================
// EMPLOYEE SCHEDULE PAGE
// ==========================================

export const EmployeeSchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  // Calculate week range
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Fetch schedule data
  const { data, isLoading } = useWeekSchedule({
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    weekEnd: format(weekEnd, 'yyyy-MM-dd'),
  });

  // Fetch shift times from settings
  const { data: shiftTimesData, isLoading: isLoadingShiftTimes } = useShiftTimes();

  // ==========================================
  // HANDLERS
  // ==========================================

  const handlePreviousWeek = () => {
    setCurrentDate((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleShiftClick = (shift: Shift) => {
    // Check if shift date is in the past
    const shiftDate = new Date(shift.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    shiftDate.setHours(0, 0, 0, 0);
    
    if (shiftDate < today) {
      toast.error('Không thể sửa hoặc xóa ca làm việc cho các ngày trong quá khứ');
      return;
    }
    
    setEditingShift(shift);
    setIsShiftModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsShiftModalOpen(false);
    setEditingShift(null);
  };

  // ==========================================
  // HELPERS
  // ==========================================

  const getShiftsForDayAndType = (date: Date, shiftType: ShiftType): Shift[] => {
    if (!data?.shifts) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return data.shifts.filter((shift: Shift) => shift.date === dateStr && shift.shiftType === shiftType);
  };

  // Define shift schedule structure - động từ settings
  const shiftSchedule = useMemo(() => {
    if (!shiftTimesData) {
      // Fallback khi chưa có data từ settings
      return [
        { type: ShiftType.MORNING, label: 'Ca Sáng', time: '07:30 - 12:00' },
        { type: ShiftType.AFTERNOON, label: 'Ca Chiều', time: '13:00 - 17:30' },
        { type: ShiftType.EVENING, label: 'Ca Tối', time: '17:30 - 21:30' },
        { type: ShiftType.FULL_DAY, label: 'Ca Cả Ngày', time: '07:30 - 21:30' },
      ];
    }

    return [
      { 
        type: ShiftType.MORNING, 
        label: shiftTimesData.morning.name, 
        time: `${shiftTimesData.morning.startTime} - ${shiftTimesData.morning.endTime}` 
      },
      { 
        type: ShiftType.AFTERNOON, 
        label: shiftTimesData.afternoon.name, 
        time: `${shiftTimesData.afternoon.startTime} - ${shiftTimesData.afternoon.endTime}` 
      },
      { 
        type: ShiftType.EVENING, 
        label: shiftTimesData.evening.name, 
        time: `${shiftTimesData.evening.startTime} - ${shiftTimesData.evening.endTime}` 
      },
      { 
        type: ShiftType.FULL_DAY, 
        label: shiftTimesData.fullDay.name, 
        time: `${shiftTimesData.fullDay.startTime} - ${shiftTimesData.fullDay.endTime}` 
      },
    ];
  }, [shiftTimesData]);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col font-['Inter']">
      {/* HEADER */}
      <div className="flex-shrink-0 px-6 pt-3 pb-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-bold text-[#102e3c] text-2xl sm:text-3xl lg:text-4xl">
              Thời Gian Biểu
            </h1>
            <div className="flex items-center gap-2.5">
            <Button
  onClick={() => {
    setEditingShift(null);
    setIsShiftModalOpen(true);
  }}
  type="button"
  className="bg-[#1a998f] hover:bg-[#158f85] text-white h-10 px-4 rounded-xl font-bold border-none"
>
  <Plus className="w-4 h-4 mr-2" />
  Thêm Ca
</Button>

            </div>
          </div>

          {/* WEEK NAVIGATION */}
          <div className="flex flex-wrap items-center gap-3 mt-2 bg-white p-3 rounded-xl border border-[#102e3c]/10 shadow-sm">
            <Button
              size="sm"
              onClick={handlePreviousWeek}
              className="h-9 rounded-lg !bg-white hover:!bg-gray-100 !border !border-gray-200 !text-gray-700 !font-medium !shadow-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1a998f]" />
              <div>
                <h2 className="text-base font-bold text-[#102e3c]">
                  Tuần {format(weekStart, 'w', { locale: vi })} - {format(currentDate, 'yyyy')}
                </h2>
                <p className="text-xs text-gray-500">
                  {format(weekStart, 'dd/MM/yyyy')} - {format(weekEnd, 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleNextWeek}
              className="h-9 rounded-lg !bg-white hover:!bg-gray-100 !border !border-gray-200 !text-gray-700 !font-medium !shadow-none"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleToday}
              size="sm"
              className="ml-auto h-9 px-4 rounded-lg bg-[#1a998f] hover:bg-[#158f85] !text-white !font-bold"
            >
              Hôm nay
            </Button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-6 pb-6 overflow-hidden mt-4 relative">
        <section className="relative w-full h-full bg-white rounded-[20px] overflow-hidden border border-solid border-[#102e3c] shadow-sm">
          {(isLoading || isLoadingShiftTimes) ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#1a998f] mx-auto mb-3" />
                <p className="text-sm text-gray-500">Đang tải lịch làm việc...</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto custom-scrollbar">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-[#1a998f] text-white">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left font-bold min-w-[150px]">
                      Ca / Ngày
                    </th>
                    {weekDays.map((day) => {
                      const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                      return (
                        <th
                          key={day.toString()}
                          className={`border border-gray-300 p-3 text-center font-bold min-w-[140px] ${
                            isToday ? 'bg-[#158f85]' : ''
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold uppercase">
                              {format(day, 'EEE', { locale: vi })}
                            </p>
                            <p className="text-lg font-bold">{format(day, 'd')}</p>
                            <p className="text-xs">{format(day, 'MMM', { locale: vi })}</p>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {shiftSchedule.map((shift) => (
                    <tr key={shift.type}>
                      <td className="border border-gray-300 p-3 bg-gray-50">
                        <div>
                          <p className="font-bold text-[#102e3c] text-sm">{shift.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{shift.time}</p>
                        </div>
                      </td>
                      {weekDays.map((day) => {
                        const shifts = getShiftsForDayAndType(day, shift.type);
                        const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                        return (
                          <td
                            key={`${day.toString()}-${shift.type}`}
                            className={`border border-gray-300 p-2 align-top ${
                              isToday ? 'bg-teal-50' : 'bg-white'
                            }`}
                          >
                            <div className="space-y-1">
                              {shifts.map((s: Shift) => (
                                <div
                                  key={s.id}
                                  onClick={() => handleShiftClick(s)}
                                  className="bg-white border border-[#1a998f] rounded-lg p-2 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                                  title={s.employeeName}
                                >
                                  <p className="text-xs font-semibold text-[#102e3c] truncate">
                                    {s.employeeName}
                                  </p>
                                  {s.notes && (
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                                      {s.notes}
                                    </p>
                                  )}
                                </div>
                              ))}
                              {shifts.length === 0 && (
                                <p className="text-xs text-gray-300 text-center py-2">-</p>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* SUMMARY */}
      <div className="px-6 pb-6">
        <Card className="shadow-sm rounded-xl border-none">
          <div className="grid grid-cols-4 gap-3">
            <SummaryItem
              label="Tổng ca làm việc"
              value={data?.shifts.length || 0}
              color="!text-[#1a998f]"
            />
            <SummaryItem
              label="Ca sáng"
              value={
                data?.shifts.filter((s: Shift) => s.shiftType === ShiftType.MORNING).length || 0
              }
              color="!text-amber-500"
            />
            <SummaryItem
              label="Ca chiều"
              value={
                data?.shifts.filter((s: Shift) => s.shiftType === ShiftType.AFTERNOON).length || 0
              }
              color="!text-sky-500"
            />
            <SummaryItem
              label="Ca tối"
              value={
                data?.shifts.filter((s: Shift) => s.shiftType === ShiftType.EVENING).length || 0
              }
              color="!text-indigo-500"
            />
          </div>
        </Card>
      </div>

      {/* SHIFT MODAL */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={handleCloseModal}
        defaultDate={format(currentDate, 'yyyy-MM-dd')}
        editingShift={editingShift}
      />
    </div>
  );
};

// ==========================================
// SUMMARY ITEM COMPONENT
// ==========================================

const SummaryItem = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => {
  return (
    <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
};
