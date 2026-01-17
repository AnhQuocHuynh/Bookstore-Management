export type ReturnOrderStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed';

export type ReturnDetailType = 'exchange' | 'refund';

// Dữ liệu hiển thị ở Bảng danh sách
export interface ReturnOrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  totalRefundAmount: number;
  status: ReturnOrderStatus;
  createdAt: string;
  updatedAt: string;
  note?: string;
}

// Chi tiết của một sản phẩm trong đơn trả/đổi
export interface ReturnOrderDetailItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  detailType: ReturnDetailType;
  reason?: string;
  status?: string;
}

// Dữ liệu chi tiết đầy đủ của đơn trả/đổi
export interface ReturnOrderDetail {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: ReturnOrderStatus;
  totalRefundAmount: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  details: ReturnOrderDetailItem[];
}

// Form data để tạo đơn trả/đổi
export interface CreateReturnOrderDto {
  transactionId: string;
  customerId: string;
  note?: string;
}

// Form data để thêm chi tiết vào đơn
export interface AddReturnOrderDetailDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  detailType: ReturnDetailType;
  reason?: string;
}

// Form data để cập nhật chi tiết
export interface UpdateReturnOrderDetailDto {
  quantity?: number;
  unitPrice?: number;
  detailType?: ReturnDetailType;
  reason?: string;
}

// Parameters for listing
export interface ReturnOrderListParams {
  status?: ReturnOrderStatus;
  customerName?: string;
}

// Payload for calculating refund
export interface RecalculateRefundResponse {
  totalRefundAmount: number;
}
