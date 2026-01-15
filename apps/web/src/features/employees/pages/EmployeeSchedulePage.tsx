import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from 'antd';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { useWeekSchedule } from '../hooks/useEmployees';
import { Shift, SHIFT_LABELS, SHIFT_COLORS, ShiftType } from '../types';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import { vi } from 'date-fns/locale';

// ==========================================
// EMPLOYEE SCHEDULE PAGE
// ==========================================

export const EmployeeSchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

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
      <Card className="mb-6 shadow-md rounded-2xl border-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
              className="rounded-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#26A69A]" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Tuần {format(weekStart, 'w', { locale: vi })} - {format(currentDate, 'yyyy')}
                </h2>
                <p className="text-sm text-gray-500">
                  {format(weekStart, 'dd/MM/yyyy')} - {format(weekEnd, 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              className="rounded-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <Button
            onClick={handleToday}
            className="bg-gradient-to-r from-[#26A69A] to-[#4DB6AC] hover:from-[#00897B] hover:to-[#26A69A] text-white rounded-xl"
          >
            Hôm nay
          </Button>
        </div>
      </Card>

      {/* SHIFT LEGEND */}
      <Card className="mb-6 shadow-md rounded-2xl border-none">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-semibold text-gray-700">Chú thích ca làm:</span>
          {Object.entries(SHIFT_LABELS).map(([key, label]) => (
            <Badge
              key={key}
              className={`bg-gradient-to-r ${SHIFT_COLORS[key as ShiftType]} text-white border-none px-4 py-1.5`}
            >
              {label}
            </Badge>
          ))}
        </div>
      </Card>

      {/* SCHEDULE GRID */}
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26A69A] mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải lịch làm việc...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const shifts = getShiftsForDay(day);
            const groupedShifts = groupShiftsByType(shifts);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <Card
                key={day.toString()}
                className={`shadow-lg rounded-2xl border-none overflow-hidden transition-all hover:shadow-xl ${
                  isToday ? 'ring-2 ring-[#26A69A]' : ''
                }`}
              >
                {/* Day Header */}
                <div
                  className={`p-4 text-center ${
                    isToday
                      ? 'bg-gradient-to-r from-[#26A69A] to-[#4DB6AC] text-white'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase">
                    {format(day, 'EEE', { locale: vi })}
                  </p>
                  <p className="text-2xl font-bold">{format(day, 'd')}</p>
                  <p className="text-xs">{format(day, 'MMM', { locale: vi })}</p>
                </div>

                {/* Shifts */}
                <div className="p-3 space-y-2 min-h-[400px]">
                  {Object.entries(groupedShifts).map(([shiftType, shiftsOfType]) => (
                    <div key={shiftType}>
                      {shiftsOfType.length > 0 && (
                        <div className="mb-3">
                          <Badge
                            className={`bg-gradient-to-r ${
                              SHIFT_COLORS[shiftType as ShiftType]
                            } text-white border-none mb-2 text-xs`}
                          >
                            {SHIFT_LABELS[shiftType as ShiftType]}
                          </Badge>
                          {shiftsOfType.map((shift) => (
                            <ShiftCard key={shift.id} shift={shift} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {shifts.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                      <Clock className="w-8 h-8 mb-2" />
                      <p className="text-xs text-center">Chưa có ca làm việc</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* SUMMARY */}
      <Card className="mt-6 shadow-md rounded-2xl border-none">
        <div className="grid grid-cols-4 gap-4">
          <SummaryItem
            label="Tổng ca làm việc"
            value={data?.shifts.length || 0}
            color="text-blue-600"
          />
          <SummaryItem
            label="Ca sáng"
            value={
              data?.shifts.filter((s) => s.shiftType === ShiftType.MORNING).length || 0
            }
            color="text-amber-600"
          />
          <SummaryItem
            label="Ca chiều"
            value={
              data?.shifts.filter((s) => s.shiftType === ShiftType.AFTERNOON).length || 0
            }
            color="text-cyan-600"
          />
          <SummaryItem
            label="Ca tối"
            value={
              data?.shifts.filter((s) => s.shiftType === ShiftType.EVENING).length || 0
            }
            color="text-indigo-600"
          />
        </div>
      </Card>
    </div>
  );
};

// ==========================================
// SHIFT CARD COMPONENT
// ==========================================

const ShiftCard = ({ shift }: { shift: Shift }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-2 mb-2 hover:shadow-md transition-shadow">
      <p className="text-sm font-semibold text-gray-800 truncate">
        {shift.employeeName}
      </p>
      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
        <Clock className="w-3 h-3" />
        <span>
          {shift.startTime} - {shift.endTime}
        </span>
      </div>
      {shift.notes && (
        <p className="text-xs text-gray-400 mt-1 truncate">{shift.notes}</p>
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
    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
};
