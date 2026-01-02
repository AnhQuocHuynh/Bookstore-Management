export enum NotificationType {
  // Account & Role
  ACCOUNT_CREATED = 'account_created', // tài khoản được tạo (cho user)
  ROLE_CHANGED = 'role_changed', // thay đổi quyền nhân viên
  EMPLOYEE_ADDED = 'employee_added', // thêm nhân viên (cho owner)

  // System
  SYSTEM_ALERT = 'system_alert',
  GENERAL_ANNOUNCEMENT = 'general_announcement',

  // Workforce
  SHIFT_ASSIGNED = 'shift_assigned',

  // Inventory & Supplier
  PURCHASE_ORDER_CREATED = 'purchase_order_created',
  ITEM_RECEIVED = 'item_received',
  ITEM_UPDATED = 'item_updated',
  STOCK_LOW = 'stock_low',
  ITEM_OUT_OF_STOCK = 'item_out_of_stock',

  // Customer
  RETURN_REQUEST = 'return_request',
}
