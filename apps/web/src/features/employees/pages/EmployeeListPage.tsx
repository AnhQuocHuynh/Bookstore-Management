import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, Table, Spin, Select, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, UserPlus, Mail, Phone, MapPin, Calendar, CreditCard, Users, X } from 'lucide-react';
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
        <span className="font-semibold text-teal-700">{text}</span>
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
              className="w-9 h-9 rounded-full object-cover border-2 border-[#1a998f]"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a998f] to-[#158f85] flex items-center justify-center text-white font-bold">
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
    <div className="relative w-full h-full overflow-hidden flex flex-col font-['Inter']">
      {/* HEADER */}
      <div className="flex-shrink-0 px-6 pt-3 pb-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-bold text-[#102e3c] text-2xl sm:text-3xl lg:text-4xl">
              Nhân Viên
            </h1>
            <div className="flex items-center gap-2.5">
              <Button
                onClick={handleAdd}
                type="primary"
                className="bg-[#1a998f] hover:bg-[#158f85] h-10 px-4 rounded-xl font-bold border-none"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Tạo Mới
              </Button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap items-center gap-3 mt-2 bg-white p-3 rounded-xl border border-[#102e3c]/10 shadow-sm">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm tên, email, SĐT, mã NV..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="h-[38px] pl-10 rounded-lg border-teal-600/30 hover:border-teal-600 focus:border-teal-600"
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
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-6 pb-6 overflow-hidden mt-4 relative">
        <section className="relative w-full h-full bg-white rounded-[20px] overflow-hidden border border-solid border-[#102e3c] shadow-sm flex flex-col">
          
          {/* TABLE CONTAINER */}
          <div className={`
            absolute top-3 bottom-3 left-[13px] rounded-[20px] transition-all duration-300 flex flex-col bg-white z-10 overflow-hidden
            ${selectedEmployee ? "right-[450px]" : "right-[20px]"}
          `}>
            <Card className="shadow-sm rounded-[20px] border-none h-full flex flex-col overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Spin size="large" />
                </div>
              ) : (
                <div className="overflow-y-auto custom-scrollbar flex-1">
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
                    scroll={{ y: 'calc(100vh - 400px)' }}
                  />
                </div>
              )}
            </Card>
          </div>

          {/* DETAIL PANEL */}
          <div className={`
            absolute top-3 bottom-3 w-[430px] bg-white rounded-[20px] border-[3px] border-[#1a998f]
            transition-all duration-300 ease-in-out z-20 shadow-xl overflow-hidden flex flex-col
            ${selectedEmployee ? "right-3 translate-x-0 opacity-100" : "right-3 translate-x-[110%] opacity-0 pointer-events-none"}
          `}>
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors z-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedEmployee && (
              <ScrollArea className="flex-1 overflow-hidden h-full">
                <div className="px-6 py-4">
                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-6 mt-8">
                    {selectedEmployee.avatarUrl ? (
                      <img
                        src={selectedEmployee.avatarUrl}
                        alt={selectedEmployee.fullName}
                        className="w-32 h-32 rounded-xl object-cover border-4 border-[#1a998f] shadow-md"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[#1a998f] to-[#158f85] flex items-center justify-center text-white text-4xl font-bold shadow-md">
                        {selectedEmployee.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h2 className="text-xl font-bold text-[#102e3c] mt-3">
                      {selectedEmployee.fullName}
                    </h2>
                    <p className="text-sm text-gray-500">{selectedEmployee.staffId}</p>
                    <Badge
                      className={`
                        mt-2
                        ${selectedEmployee.status === EmployeeStatus.ACTIVE ? '!bg-green-500 !text-white' : ''}
                        ${selectedEmployee.status === EmployeeStatus.INACTIVE ? '!bg-gray-400 !text-white' : ''}
                        ${selectedEmployee.status === EmployeeStatus.ON_LEAVE ? '!bg-yellow-500 !text-white' : ''}
                        !border-none !font-semibold
                      `}
                    >
                      {STATUS_LABELS[selectedEmployee.status]}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <DetailItem
                      icon={<Mail className="w-4 h-4 text-[#1a998f]" />}
                      label="Email"
                      value={selectedEmployee.email}
                    />
                    <DetailItem
                      icon={<Phone className="w-4 h-4 text-[#1a998f]" />}
                      label="Điện thoại"
                      value={selectedEmployee.phone}
                    />
                    <DetailItem
                      icon={<MapPin className="w-4 h-4 text-[#1a998f]" />}
                      label="Địa chỉ"
                      value={selectedEmployee.address}
                    />
                    <DetailItem
                      icon={<Calendar className="w-4 h-4 text-[#1a998f]" />}
                      label="Ngày sinh"
                      value={format(new Date(selectedEmployee.dateOfBirth), 'dd/MM/yyyy')}
                    />
                    <DetailItem
                      icon={<CreditCard className="w-4 h-4 text-[#1a998f]" />}
                      label="CMND/CCCD"
                      value={selectedEmployee.identityCard}
                    />
                    <DetailItem
                      icon={<Calendar className="w-4 h-4 text-[#1a998f]" />}
                      label="Ngày vào làm"
                      value={format(new Date(selectedEmployee.startDate), 'dd/MM/yyyy')}
                    />
                    <DetailItem
                      icon={<Users className="w-4 h-4 text-[#1a998f]" />}
                      label="Vai trò"
                      value={ROLE_LABELS[selectedEmployee.role]}
                    />
                    {selectedEmployee.emergencyContact && (
                      <>
                        <hr className="my-3 border-gray-200" />
                        <p className="text-xs font-semibold text-gray-500 mb-2">LIÊN HỆ KHẨN CẤP</p>
                        <DetailItem
                          icon={<Users className="w-4 h-4 text-[#1a998f]" />}
                          label="Người liên hệ"
                          value={`${selectedEmployee.emergencyContact.name} (${selectedEmployee.emergencyContact.relationship})`}
                        />
                        <DetailItem
                          icon={<Phone className="w-4 h-4 text-[#1a998f]" />}
                          label="SĐT khẩn cấp"
                          value={selectedEmployee.emergencyContact.phone}
                        />
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-6">
                    <Button
                      onClick={() => handleEdit(selectedEmployee)}
                      className="flex-1 h-10 rounded-lg border-teal-600 text-teal-700 hover:bg-teal-50"
                    >
                      Sửa
                    </Button>
                    <Button
                      onClick={() => handleDelete(selectedEmployee.id)}
                      disabled={isDeleting}
                      danger
                      className="flex-1 h-10 rounded-lg"
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
        </section>
      </main>

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
  <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="mt-0.5">{icon}</div>
    <div className="flex-1">
      <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">{label}</p>
      <p className="text-sm font-medium text-[#102e3c] break-words">{value}</p>
    </div>
  </div>
);
