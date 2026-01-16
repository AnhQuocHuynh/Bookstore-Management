import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from 'antd';
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useWeekSchedule } from '../hooks/useEmployees';
import { Shift, SHIFT_LABELS, SHIFT_COLORS, SHIFT_TEXT_COLORS, ShiftType } from '../types';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ShiftModal } from '../components/ShiftModal';

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

  const getShiftsForDay = (date: Date): Shift[] => {
    if (!data?.shifts) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return data.shifts.filter((shift) => shift.date === dateStr);
  };

  const groupShiftsByType = (shifts: Shift[]) => {
    const grouped: Record<ShiftType, Shift[]> = {
      [ShiftType.MORNING]: [],
      [ShiftType.AFTERNOON]: [],
      [ShiftType.EVENING]: [],
      [ShiftType.FULL_DAY]: [],
    };

    shifts.forEach((shift) => {
      if (grouped[shift.shiftType]) {
        grouped[shift.shiftType].push(shift);
      }
    });

    return grouped;
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý thời gian biểu</h1>
        <p className="text-sm text-gray-500 mt-1">
          Lịch làm việc của nhân viên theo tuần
        </p>
      </div>

      {/* WEEK NAVIGATION */}
      <Card className="mb-4 shadow-sm rounded-xl border-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handlePreviousWeek}
              className="h-9 rounded-lg !bg-white hover:!bg-gray-100 !border !border-gray-200 !text-gray-700 !font-medium !shadow-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#26A69A]" />
              <div>
                <h2 className="text-base font-bold text-gray-800">
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
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setEditingShift(null);
                setIsShiftModalOpen(true);
              }}
              size="sm"
              className="h-9 px-4 rounded-lg !bg-white !text-emerald-600 !border !border-emerald-600 hover:!bg-emerald-50 !font-semibold !shadow-none"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Thêm Ca
            </Button>
            <Button
              onClick={handleToday}
              size="sm"
              className="h-9 px-4 rounded-lg !bg-gradient-to-r !from-emerald-500 !to-teal-600 hover:!from-emerald-600 hover:!to-teal-700 !text-white !font-bold !shadow-md hover:!shadow-lg"
            >
              Hôm nay
            </Button>
          </div>
        </div>
      </Card>

      {/* SHIFT LEGEND */}
      <Card className="mb-4 shadow-sm rounded-xl border-none">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-gray-700">Chú thích ca làm:</span>
          {Object.entries(SHIFT_LABELS).map(([key, label]) => (
            <Badge
              key={key}
              className={`${SHIFT_COLORS[key as ShiftType]} !text-white !border-none px-3 py-1 text-xs !font-semibold`}
            >
              {label}
            </Badge>
          ))}
        </div>
      </Card>

      {/* SCHEDULE GRID */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#26A69A] mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Đang tải lịch làm việc...</p>
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-400px)] border border-gray-200 rounded-xl bg-white overflow-hidden">
          <div className="grid grid-cols-7 gap-0 h-full">
            {weekDays.map((day) => {
            const shifts = getShiftsForDay(day);
            const groupedShifts = groupShiftsByType(shifts);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <Card
                key={day.toString()}
                className="border-none rounded-none border-r border-gray-200 last:border-r-0 overflow-hidden transition-all hover:shadow-sm bg-white h-full"
                bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div className="flex flex-col h-full min-h-0">
                  {/* Sticky Day Header */}
                  <div
                    className={`sticky top-0 z-10 shadow-sm border-b border-gray-200 flex-shrink-0 ${
                      isToday
                        ? '!bg-gradient-to-r !from-emerald-500 !to-teal-600'
                        : 'bg-white'
                    }`}
                  >
                    <div className="p-2 text-center">
                      <p className={`text-xs font-semibold uppercase ${isToday ? '!text-white' : 'text-gray-800'}`}>
                        {format(day, 'EEE', { locale: vi })}
                      </p>
                      <p className={`text-xl font-bold ${isToday ? '!text-white' : 'text-gray-800'}`}>{format(day, 'd')}</p>
                      <p className={`text-xs ${isToday ? '!text-white' : 'text-gray-600'}`}>{format(day, 'MMM', { locale: vi })}</p>
                    </div>
                  </div>
                  
                  {/* Shifts - Scrollable */}
                  <div className="relative z-0 p-2 space-y-1.5 flex-1 bg-white overflow-y-auto min-h-0">
                  {Object.entries(groupedShifts).map(([shiftType, shiftsOfType]) => (
                    <div key={shiftType}>
                      {shiftsOfType.length > 0 && (
                        <div className="mb-2">
                          <Badge
                            className={`${SHIFT_COLORS[shiftType as ShiftType]} !text-white !border-none mb-1 text-xs px-2 py-0.5 !font-semibold`}
                          >
                            {SHIFT_LABELS[shiftType as ShiftType]}
                          </Badge>
                          {shiftsOfType.map((shift) => (
                            <ShiftCard key={shift.id} shift={shift} onClick={() => handleShiftClick(shift)} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {shifts.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-400 py-6">
                      <Clock className="w-6 h-6 mb-1.5" />
                      <p className="text-xs text-center">Chưa có ca làm việc</p>
                    </div>
                  )}
                  </div>
                </div>
              </Card>
            );
          })}
          </div>
        </div>
      )}

      {/* SUMMARY */}
      <Card className="mt-4 shadow-sm rounded-xl border-none">
        <div className="grid grid-cols-4 gap-3">
          <SummaryItem
            label="Tổng ca làm việc"
            value={data?.shifts.length || 0}
            color="!text-emerald-500"
          />
          <SummaryItem
            label="Ca sáng"
            value={
              data?.shifts.filter((s) => s.shiftType === ShiftType.MORNING).length || 0
            }
            color="!text-amber-500"
          />
          <SummaryItem
            label="Ca chiều"
            value={
              data?.shifts.filter((s) => s.shiftType === ShiftType.AFTERNOON).length || 0
            }
            color="!text-sky-500"
          />
          <SummaryItem
            label="Ca tối"
            value={
              data?.shifts.filter((s) => s.shiftType === ShiftType.EVENING).length || 0
            }
            color="!text-indigo-500"
          />
        </div>
      </Card>

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
// SHIFT CARD COMPONENT
// ==========================================

const ShiftCard = ({ shift, onClick }: { shift: Shift; onClick?: () => void }) => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-2 mb-1 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
      onClick={onClick}
      title={shift.employeeName}
    >
      <p className="text-xs font-semibold text-gray-800 break-words whitespace-normal line-clamp-2">
        {shift.employeeName}
      </p>
      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
        <Clock className="w-3 h-3 flex-shrink-0" />
        <span className="text-xs">
          {shift.startTime} - {shift.endTime}
        </span>
      </div>
      {shift.notes && (
        <p className="text-xs text-gray-400 mt-0.5 break-words whitespace-normal line-clamp-1">
          {shift.notes}
        </p>
      )}
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
