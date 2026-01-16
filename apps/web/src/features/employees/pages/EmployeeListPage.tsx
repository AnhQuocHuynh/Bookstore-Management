import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, Table, Spin, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, UserPlus, Mail, Phone, MapPin, Calendar, CreditCard, Users } from 'lucide-react';
import { useEmployees, useDeleteEmployee } from '../hooks/useEmployees';
import {
  Employee,
  EmployeeRole,
  EmployeeStatus,
  ROLE_LABELS,
  STATUS_LABELS,
} from '../types';
import { EmployeeModal } from '../components/EmployeeModal';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ==========================================
// EMPLOYEE LIST PAGE
// ==========================================

export const EmployeeListPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Filters
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<EmployeeRole | undefined>();
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | undefined>();

  // Data fetching
  const { data, isLoading, refetch } = useEmployees({
    keyword,
    role: roleFilter,
    status: statusFilter,
  });
  
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee();

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleRowClick = (record: Employee) => {
    setSelectedEmployee(record);
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      deleteEmployee(id, {
        onSuccess: () => {
          if (selectedEmployee?.id === id) {
            setSelectedEmployee(null);
          }
          refetch();
        },
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    refetch();
  };

  // ==========================================
  // TABLE COLUMNS
  // ==========================================

  const columns: ColumnsType<Employee> = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      render: (_: any, __: any, index: number) => (
        <span className="font-medium text-gray-700">{index + 1}</span>
      ),
    },
    {
      title: 'Mã NV',
      dataIndex: 'staffId',
      key: 'staffId',
      width: 100,
      render: (text: string) => (
        <span className="font-semibold text-[#26A69A]">{text}</span>
      ),
    },
    {
      title: 'Tên nhân viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: Employee) => (
        <div className="flex items-center gap-3">
          {record.avatarUrl ? (
            <img
              src={record.avatarUrl}
              alt={text}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#26A69A]"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#26A69A] to-[#4DB6AC] flex items-center justify-center text-white font-bold">
              {text.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium text-gray-800">{text}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => (
        <span className="text-sm text-gray-600">{text}</span>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: EmployeeRole) => (
        <Badge
          className={`
            ${role === EmployeeRole.OWNER ? '!bg-gradient-to-r !from-purple-500 !to-pink-500 !text-white' : ''}
            ${role === EmployeeRole.MANAGER ? '!bg-gradient-to-r !from-blue-500 !to-cyan-500 !text-white' : ''}
            ${role === EmployeeRole.CASHIER ? '!bg-gradient-to-r !from-green-500 !to-emerald-500 !text-white' : ''}
            ${role === EmployeeRole.WAREHOUSE ? '!bg-gradient-to-r !from-orange-500 !to-amber-500 !text-white' : ''}
            ${role === EmployeeRole.SALES ? '!bg-gradient-to-r !from-pink-500 !to-rose-500 !text-white' : ''}
            !border-none !font-semibold
          `}
        >
          {ROLE_LABELS[role]}
        </Badge>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: EmployeeStatus) => (
        <Badge
          className={`
            ${status === EmployeeStatus.ACTIVE ? '!bg-green-500 hover:!bg-green-600 !text-white' : ''}
            ${status === EmployeeStatus.INACTIVE ? '!bg-gray-400 hover:!bg-gray-500 !text-white' : ''}
            ${status === EmployeeStatus.ON_LEAVE ? '!bg-yellow-500 hover:!bg-yellow-600 !text-white' : ''}
            !border-none !font-semibold
          `}
        >
          {STATUS_LABELS[status]}
        </Badge>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_: any, record: Employee) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
            className="h-8 px-3 rounded-lg !bg-blue-50 hover:!bg-blue-100 !text-blue-700 hover:!text-blue-800 !font-medium !shadow-none !border-none"
          >
            Sửa
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record.id);
            }}
            disabled={isDeleting}
            className="h-8 px-3 rounded-lg !bg-red-50 hover:!bg-red-100 !text-red-700 hover:!text-red-800 !font-medium !shadow-none !border-none disabled:!opacity-50"
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="flex w-full items-start justify-start gap-6">
        {/* LEFT — EMPLOYEE TABLE */}
        <div className={`flex-1 transition-all duration-300 ${selectedEmployee ? 'mr-0' : ''}`}>
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Danh sách nhân viên</h1>
              <p className="text-sm text-gray-500 mt-1">
                Quản lý thông tin nhân viên của cửa hàng
              </p>
            </div>
            <Button
              onClick={handleAdd}
              className="h-11 px-6 rounded-xl !bg-gradient-to-r !from-emerald-500 !to-teal-600 hover:!from-emerald-600 hover:!to-teal-700 !text-white !font-bold !shadow-md hover:!shadow-lg"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Thêm nhân viên
            </Button>
          </div>

          {/* FILTERS */}
          <Card className="mb-4 shadow-sm rounded-xl border-none">
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, mã NV, email..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="h-11 pl-10 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <Select
                placeholder="Vai trò"
                value={roleFilter}
                onChange={setRoleFilter}
                allowClear
                className="w-40"
                size="middle"
              >
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <Select.Option key={key} value={key}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
              <Select
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                className="w-40"
                size="middle"
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <Select.Option key={key} value={key}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Card>

          {/* TABLE */}
          <Card className="shadow-sm rounded-xl border-none overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Spin size="large" />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={data?.data || []}
                rowKey="id"
                pagination={{
                  total: data?.total || 0,
                  pageSize: data?.limit || 10,
                  current: data?.page || 1,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} nhân viên`,
                }}
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                  className: `cursor-pointer hover:bg-teal-50 transition-colors ${
                    selectedEmployee?.id === record.id ? 'bg-teal-100' : ''
                  }`,
                })}
              />
            )}
          </Card>
        </div>

        {/* DETAIL SHEET */}
        <Sheet open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
          <SheetContent className="w-[400px] sm:w-[480px] p-0">
            <SheetHeader className="px-6 pt-6 pb-4 border-b">
              <SheetTitle className="text-xl font-bold text-gray-800">
                Thông tin nhân viên
              </SheetTitle>
            </SheetHeader>
            
            {selectedEmployee && (
              <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="px-6 py-4">
                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-6">
                    {selectedEmployee.avatarUrl ? (
                      <img
                        src={selectedEmployee.avatarUrl}
                        alt={selectedEmployee.fullName}
                        className="w-32 h-32 rounded-xl object-cover border-4 border-[#26A69A] shadow-md"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[#26A69A] to-[#4DB6AC] flex items-center justify-center text-white text-4xl font-bold shadow-md">
                        {selectedEmployee.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h2 className="text-xl font-bold text-gray-800 mt-3">
                      {selectedEmployee.fullName}
                    </h2>
                    <p className="text-sm text-gray-500">{selectedEmployee.staffId}</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <DetailItem
                      icon={<Mail className="w-4 h-4 text-[#26A69A]" />}
                      label="Email"
                      value={selectedEmployee.email}
                    />
                    <DetailItem
                      icon={<Phone className="w-4 h-4 text-[#26A69A]" />}
                      label="Điện thoại"
                      value={selectedEmployee.phone}
                    />
                    <DetailItem
                      icon={<MapPin className="w-4 h-4 text-[#26A69A]" />}
                      label="Địa chỉ"
                      value={selectedEmployee.address}
                    />
                    <DetailItem
                      icon={<Calendar className="w-4 h-4 text-[#26A69A]" />}
                      label="Ngày sinh"
                      value={format(new Date(selectedEmployee.dateOfBirth), 'dd/MM/yyyy')}
                    />
                    <DetailItem
                      icon={<CreditCard className="w-4 h-4 text-[#26A69A]" />}
                      label="CMND/CCCD"
                      value={selectedEmployee.identityCard}
                    />
                    <DetailItem
                      icon={<Calendar className="w-4 h-4 text-[#26A69A]" />}
                      label="Ngày vào làm"
                      value={format(new Date(selectedEmployee.startDate), 'dd/MM/yyyy')}
                    />
                    {selectedEmployee.emergencyContact && (
                      <>
                        <hr className="my-3" />
                        <DetailItem
                          icon={<Users className="w-4 h-4 text-[#26A69A]" />}
                          label="Liên hệ khẩn cấp"
                          value={`${selectedEmployee.emergencyContact.name} (${selectedEmployee.emergencyContact.relationship})`}
                        />
                        <DetailItem
                          icon={<Phone className="w-4 h-4 text-[#26A69A]" />}
                          label="SĐT khẩn cấp"
                          value={selectedEmployee.emergencyContact.phone}
                        />
                      </>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* MODAL */}
      <EmployeeModal
        open={isModalOpen}
        onClose={handleModalClose}
        employee={editingEmployee}
      />
    </div>
  );
};

// ==========================================
// DETAIL ITEM COMPONENT
// ==========================================

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
    <div className="mt-0.5">{icon}</div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
    </div>
  </div>
);
