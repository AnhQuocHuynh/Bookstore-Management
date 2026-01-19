// File: components/ShiftManagerModal.tsx
import React from 'react';
import { Modal, List, Button, Form, Input, TimePicker, Popconfirm } from 'antd';
import { Trash2, Plus } from 'lucide-react';
import { useShifts, useCreateShift, useDeleteShift } from '../hooks/useEmployees';
import dayjs from 'dayjs';

export const ShiftManagerModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const { data: shifts, isLoading } = useShifts();
    const createMutation = useCreateShift();
    const deleteMutation = useDeleteShift();
    const [form] = Form.useForm();

    const handleCreate = async (values: any) => {
        await createMutation.mutateAsync({
            name: values.name,
            startTime: values.time[0].format('HH:mm'),
            endTime: values.time[1].format('HH:mm'),
            description: values.description
        });
        form.resetFields();
    };

    return (
        <Modal title="Quản lý Ca làm việc" open={open} onCancel={onClose} footer={null} width={700}>
            <div className="flex gap-6">
                {/* Form tạo mới */}
                <div className="w-1/2 border-r pr-6">
                    <h4 className="mb-4 font-bold text-teal-700">Tạo ca mới</h4>
                    <Form form={form} layout="vertical" onFinish={handleCreate}>
                        <Form.Item name="name" label="Tên ca" rules={[{ required: true }]}>
                            <Input placeholder="VD: Ca Sáng" />
                        </Form.Item>
                        <Form.Item name="time" label="Thời gian" rules={[{ required: true }]}>
                            <TimePicker.RangePicker format="HH:mm" className="w-full" />
                        </Form.Item>
                        <Form.Item name="description" label="Mô tả">
                            <Input.TextArea rows={2} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={createMutation.isPending} block className="bg-teal-600">
                            Thêm Ca
                        </Button>
                    </Form>
                </div>

                {/* Danh sách ca hiện có */}
                <div className="w-1/2">
                    <h4 className="mb-4 font-bold text-teal-700">Danh sách ca ({shifts?.length || 0})</h4>
                    <List
                        loading={isLoading}
                        dataSource={shifts || []}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Popconfirm title="Xóa ca này?" onConfirm={() => deleteMutation.mutate(item.id)}>
                                        <Button type="text" danger icon={<Trash2 size={16} />} />
                                    </Popconfirm>
                                ]}
                            >
                                <div className="w-full">
                                    <div className="font-bold">{item.name}</div>
                                    <div className="text-gray-500 text-sm">
                                        {item.startTime} - {item.endTime}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </div>
            </div>
        </Modal>
    );
};