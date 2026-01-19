// File: pages/EmployeeSchedulePage.tsx
import React, { useState, useMemo } from 'react';
import { Button, Select, Spin, Tooltip, Modal, Avatar } from 'antd';
import { ChevronLeft, ChevronRight, Settings, Plus, X } from 'lucide-react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/vi';
import { useWeekSchedule, useShifts, useAssignSchedule, useUnassignSchedule, useEmployees } from '../hooks/useEmployees';
import { ShiftManagerModal } from '../components/ShiftManagerModal';
import { ShiftTemplate, DailyShift, ScheduledEmployee } from '../types';

// Extend dayjs với plugin isoWeek và locale vi
dayjs.extend(isoWeek);
dayjs.locale('vi');

export const EmployeeSchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [isShiftManagerOpen, setIsShiftManagerOpen] = useState(false);

  // State cho Modal Assign
  const [assignModalData, setAssignModalData] = useState<{ shiftId: string; date: string; shiftName: string } | null>(null);
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);

  // 1. Lấy danh sách Ca mẫu (để vẽ hàng ngang/dọc tùy ý, ở đây ta vẽ hàng dọc là Ca, hàng ngang là Ngày)
  const { data: shiftTemplates } = useShifts();

  // 2. Lấy dữ liệu lịch làm việc
  const weekDateStr = currentDate.format('YYYY-MM-DD');
  const { data: weekData, isLoading } = useWeekSchedule(weekDateStr);

  // 3. Lấy danh sách nhân viên để Assign
  const { data: employeesData } = useEmployees();
  const allEmployees = employeesData?.data || [];

  const assignMutation = useAssignSchedule();
  const unassignMutation = useUnassignSchedule();

  // --- Handlers ---
  const handleAssign = () => {
    if (!assignModalData || selectedEmpIds.length === 0) return;
    assignMutation.mutate({
      shiftId: assignModalData.shiftId,
      workDate: assignModalData.date,
      employeeIds: selectedEmpIds,
    }, {
      onSuccess: () => {
        setAssignModalData(null);
        setSelectedEmpIds([]);
      }
    });
  };

  const handleUnassign = (shiftId: string, date: string, empId: string) => {
    Modal.confirm({
      title: "Gỡ nhân viên khỏi ca?",
      onOk: () => {
        unassignMutation.mutate({
          shiftId, workDate: date, employeeIds: [empId]
        });
      }
    });
  };

  // Helper để lấy dữ liệu ca làm việc của 1 ngày cụ thể và 1 loại ca cụ thể
  const getCellData = (dateStr: string, shiftTemplateId: string): DailyShift | undefined => {
    const daySchedule = weekData?.schedule.find(d => d.date === dateStr);
    return daySchedule?.shifts.find(s => s.id === shiftTemplateId);
  };

  // Tạo danh sách 7 ngày trong tuần (Thứ 2 -> Chủ nhật) từ currentDate
  const weekDays = useMemo(() => {
    // Lấy ngày đầu tuần (Thứ 2) dựa trên currentDate
    const startOfWeek = currentDate.startOf('isoWeek'); // ISO week bắt đầu từ Thứ 2
    
    const days = [];
    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
    
    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.add(i, 'day');
      days.push({
        date: day.format('YYYY-MM-DD'),
        dayOfWeek: dayNames[i],
        dayjs: day,
      });
    }
    return days;
  }, [currentDate]);

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Spin size="large" /></div>;

  return (
    <div className="p-6 h-full flex flex-col font-['Inter'] bg-[#f8fafc]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#102e3c]">Lịch Làm Việc</h1>
          <p className="text-gray-500">
            {weekDays.length > 0 
              ? `Tuần từ ${weekDays[0].dayjs.format('DD/MM')} đến ${weekDays[6].dayjs.format('DD/MM/YYYY')}`
              : '...'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button icon={<Settings size={16} />} onClick={() => setIsShiftManagerOpen(true)}>
            Quản lý Ca
          </Button>
          <div className="flex bg-white border rounded-lg">
            <Button type="text" icon={<ChevronLeft size={16} />} onClick={() => setCurrentDate(currentDate.subtract(1, 'week'))} />
            <Button type="text" onClick={() => setCurrentDate(dayjs())}>Hôm nay</Button>
            <Button type="text" icon={<ChevronRight size={16} />} onClick={() => setCurrentDate(currentDate.add(1, 'week'))} />
          </div>
        </div>
      </div>

      {/* SCHEDULE TABLE */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-auto">
        <table className="w-full border-collapse table-fixed">
          <thead className="bg-[#1a998f] text-white sticky top-0 z-10">
            <tr>
              <th className="p-4 text-left border-r border-teal-600 w-[180px]">Ca / Ngày</th>
              {weekDays.map(day => (
                <th key={day.date} className={`p-3 text-center border-r border-teal-600 min-w-[120px] ${day.date === dayjs().format('YYYY-MM-DD') ? 'bg-[#158f85]' : ''}`}>
                  <div className="font-bold uppercase">{day.dayOfWeek}</div>
                  <div className="text-xs opacity-80">{day.dayjs.format('DD/MM')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(shiftTemplates || []).map(template => (
              <tr key={template.id} className="border-b hover:bg-gray-50">
                {/* Cột Tên Ca */}
                <td className="p-4 border-r font-medium bg-gray-50 sticky left-0 z-10">
                  <div className="text-[#102e3c]">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.startTime} - {template.endTime}</div>
                </td>

                {/* Các ô dữ liệu */}
                {weekDays.map(day => {
                  const cellData = getCellData(day.date, template.id);
                  const employees = cellData?.employees || [];

                  return (
                    <td key={`${day.date}-${template.id}`} className="p-2 border-r align-top h-[120px]">
                      <div className="flex flex-col gap-2 h-full">
                        {/* Danh sách nhân viên */}
                        <div className="flex-1 space-y-1">
                          {employees.map(emp => (
                            <div key={emp.id} className="group flex justify-between items-center bg-teal-50 text-teal-900 text-xs px-2 py-1.5 rounded border border-teal-100">
                              <span className="truncate font-medium">{emp.fullName}</span>
                              <X
                                size={12}
                                className="cursor-pointer opacity-0 group-hover:opacity-100 text-red-500"
                                onClick={() => handleUnassign(template.id, day.date, emp.id)}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Nút thêm nhân viên */}
                        <Button
                          type="dashed"
                          size="small"
                          icon={<Plus size={12} />}
                          className="w-full text-xs text-gray-400"
                          onClick={() => setAssignModalData({
                            shiftId: template.id,
                            date: day.date,
                            shiftName: `${template.name} (${day.dayOfWeek})`
                          })}
                        >
                          Thêm
                        </Button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {(!shiftTemplates || shiftTemplates.length === 0) && (
              <tr>
                <td colSpan={8} className="p-10 text-center text-gray-400">
                  Chưa có ca làm việc nào. Hãy nhấn "Quản lý Ca" để tạo ca trước.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      <ShiftManagerModal
        open={isShiftManagerOpen}
        onClose={() => setIsShiftManagerOpen(false)}
      />

      <Modal
        title={`Phân công: ${assignModalData?.shiftName}`}
        open={!!assignModalData}
        onCancel={() => { setAssignModalData(null); setSelectedEmpIds([]); }}
        onOk={handleAssign}
        confirmLoading={assignMutation.isPending}
        okText="Lưu"
        cancelText="Hủy"
      >
        <p className="mb-2 text-gray-500">Chọn nhân viên để thêm vào ca này:</p>
        <Select
          mode="multiple"
          className="w-full"
          placeholder="Chọn nhân viên..."
          value={selectedEmpIds}
          onChange={setSelectedEmpIds}
          options={allEmployees.map(e => ({ label: e.fullName, value: e.id }))}
          optionFilterProp="label"
        />
      </Modal>
    </div>
  );
};