// Shapes from manzu-b (med-version): pharmacy-orders.service.js fetchOrders / fetchOrderById /
// bulkUpdateOrderStatus, and utils/validation.js (validateFetchOrders, validateUpdateOrder, validateBulkUpdateOrders).
// Prisma Float → number, DateTime → ISO string.

export type OrderStatus =
  | 'CART'
  | 'PENDING'
  | 'PENDING_PRESCRIPTION'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'READY_FOR_PICKUP'
  | 'CANCELLED'
  | 'COMPLETED';

/** Statuses accepted by PATCH /orders/:id and /orders/bulk. */
export type UpdatableOrderStatus = 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'READY_FOR_PICKUP' | 'CANCELLED' | 'COMPLETED';

/** Status filter values the web offers (CONFIRMED is labelled "Pending"). */
export type OrderStatusFilter = 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';

export type DeliveryMethod = 'UNSPECIFIED' | 'PICKUP' | 'COURIER';
export type DeliveryMethodFilter = 'PICKUP' | 'COURIER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type PaymentMethod = 'PAY_NOW' | 'PAY_LATER';
export type PrescriptionStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface OrderPrescription {
  id: number;
  fileUrl: string;
  status: PrescriptionStatus;
  /** Only on GET /orders/:id. */
  createdAt?: string;
}

export interface OrderMedication {
  /** Only on GET /orders/:id. */
  id?: number;
  brandName: string;
  form: string | null;
  /** "<packSizeExpression> <packSizeUnit>" or ''. */
  packSize: string;
  activeSubstances: string;
  displayName: string;
}

export interface OrderListItem {
  id: number;
  medication: OrderMedication;
  pharmacy: { name: string; address: string };
  quantity: number;
  price: number;
}

export interface OrderSummary {
  id: number;
  /** Per-pharmacy serial number (position in getAllOrderIds). */
  sn?: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  trackingCode: string | null;
  userIdentifier: string;
  deliveryMethod: DeliveryMethod | null;
  address: string | null;
  status: OrderStatus;
  totalPrice: number;
  pharmacyAmount: number | null;
  prescription: OrderPrescription | null;
  items: OrderListItem[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface OrdersResponse {
  orders: OrderSummary[];
  pagination: Pagination;
}

export interface OrdersQuery {
  page?: number;
  /** 1–100, backend default 20. */
  limit?: number;
  search?: string;
  status?: OrderStatusFilter;
  /** YYYY-MM-DD, matched as a UTC day. */
  date?: string;
  deliveryMethod?: DeliveryMethodFilter;
}

export interface OrderDetailItem {
  id: number;
  orderId: number;
  quantity: number;
  price: number;
  medication: OrderMedication;
}

export interface OrderDetail extends Omit<OrderSummary, 'items'> {
  updatedAt: string;
  paymentReference: string | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  paymentChannel: string | null;
  filledAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  items: OrderDetailItem[];
  pharmacy: { id: number; name: string; address: string; phone: string | null; lga: string | null; state: string | null; ward: string | null } | null;
}

/** PATCH /orders/:id body. Joi only accepts {status}; cancelReason would be ignored, so cancels use bulk (PLAN D2). */
export interface UpdateOrderStatusRequest {
  status: Exclude<UpdatableOrderStatus, 'CANCELLED'>;
}

export interface UpdateOrderStatusResponse {
  message: string;
  /** Raw Prisma Order row. */
  order: { id: number; status: OrderStatus };
}

export interface BulkUpdateOrdersRequest {
  /** 1–50 positive integers. */
  orderIds: number[];
  status: UpdatableOrderStatus;
  /** Required when status is CANCELLED. */
  cancelReason?: string | null;
}

export interface BulkUpdateSuccess {
  orderId: number;
  previousStatus: OrderStatus;
  newStatus: UpdatableOrderStatus;
  refundInitiated: boolean;
  stockRestored: boolean;
}

export interface BulkUpdateFailure {
  orderId: number;
  reason: string;
}

export interface BulkUpdateOrdersResponse {
  message: string;
  results: { successful: BulkUpdateSuccess[]; failed: BulkUpdateFailure[] };
}

export interface OrderFilters {
  search: string;
  status: OrderStatusFilter | '';
  deliveryMethod: DeliveryMethodFilter | '';
  date: string;
}
