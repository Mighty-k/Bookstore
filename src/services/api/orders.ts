import { apiClient } from "./client";
import type { Order, Address, PaymentMethod } from "../../types";

export interface CreateOrderRequest {
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  notes?: string;
  emailReceipt?: boolean;
}

export interface UpdateOrderRequest {
  status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface OrderFilters {
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "date" | "amount" | "status";
  sortOrder?: "asc" | "desc";
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  revenue: number;
  averageOrderValue: number;
}

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery: string;
  events: Array<{
    date: string;
    location: string;
    status: string;
    description: string;
  }>;
}

class OrdersAPI {
  private static instance: OrdersAPI;

  private constructor() {}

  public static getInstance(): OrdersAPI {
    if (!OrdersAPI.instance) {
      OrdersAPI.instance = new OrdersAPI();
    }
    return OrdersAPI.instance;
  }

  // ========== ORDER CRUD ==========

  /**
   * Get orders with filters
   */
  async getOrders(filters: OrderFilters = {}): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
    stats: OrderStats;
  }> {
    const params = this.buildQueryParams(filters);
    return apiClient.get("/orders", { params });
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order> {
    return apiClient.get(`/orders/${id}`);
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<Order> {
    return apiClient.get(`/orders/number/${orderNumber}`);
  }

  /**
   * Create new order
   */
  async createOrder(data: CreateOrderRequest): Promise<{
    order: Order;
    paymentIntent: {
      clientSecret: string;
      id: string;
    };
  }> {
    return apiClient.post("/orders", data);
  }

  /**
   * Update order (admin)
   */
  async updateOrder(orderId: string, data: UpdateOrderRequest): Promise<Order> {
    return apiClient.patch(`/orders/${orderId}`, data);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    return apiClient.post(`/orders/${orderId}/cancel`, { reason });
  }

  /**
   * Delete order (admin)
   */
  async deleteOrder(orderId: string): Promise<{ message: string }> {
    return apiClient.delete(`/orders/${orderId}`);
  }

  // ========== ORDER STATUS MANAGEMENT ==========

  /**
   * Update order status
   */
  async updateStatus(orderId: string, status: string): Promise<Order> {
    return apiClient.patch(`/orders/${orderId}/status`, { status });
  }

  /**
   * Get available status transitions
   */
  async getStatusTransitions(orderId: string): Promise<string[]> {
    return apiClient.get(`/orders/${orderId}/status-transitions`);
  }

  /**
   * Bulk update order status
   */
  async bulkUpdateStatus(
    orderIds: string[],
    status: string,
  ): Promise<{
    updated: number;
    failed: number;
  }> {
    return apiClient.post("/orders/bulk-status", { orderIds, status });
  }

  // ========== TRACKING ==========

  /**
   * Add tracking information
   */
  async addTracking(
    orderId: string,
    trackingNumber: string,
    carrier: string,
  ): Promise<Order> {
    return apiClient.post(`/orders/${orderId}/tracking`, {
      trackingNumber,
      carrier,
    });
  }

  /**
   * Get tracking information
   */
  async getTracking(orderId: string): Promise<TrackingInfo> {
    return apiClient.get(`/orders/${orderId}/tracking`);
  }

  /**
   * Track package by tracking number
   */
  async trackPackage(
    trackingNumber: string,
    carrier: string,
  ): Promise<TrackingInfo> {
    return apiClient.get(`/orders/track/${carrier}/${trackingNumber}`);
  }

  // ========== PAYMENT ==========

  /**
   * Process payment for order
   */
  async processPayment(
    orderId: string,
    paymentMethodId: string,
  ): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    return apiClient.post(`/orders/${orderId}/process-payment`, {
      paymentMethodId,
    });
  }

  /**
   * Refund order
   */
  async refundOrder(
    orderId: string,
    amount?: number,
    reason?: string,
  ): Promise<{
    success: boolean;
    refundId: string;
    amount: number;
  }> {
    return apiClient.post(`/orders/${orderId}/refund`, { amount, reason });
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(orderId: string): Promise<{
    status: string;
    transactionId?: string;
    amount: number;
    paidAt?: string;
  }> {
    return apiClient.get(`/orders/${orderId}/payment-status`);
  }

  // ========== INVOICE ==========

  /**
   * Generate invoice
   */
  async generateInvoice(orderId: string): Promise<{
    invoiceUrl: string;
    invoiceNumber: string;
  }> {
    return apiClient.post(`/orders/${orderId}/generate-invoice`);
  }

  /**
   * Download invoice
   */
  async downloadInvoice(orderId: string): Promise<void> {
    return apiClient.download(
      `/orders/${orderId}/invoice`,
      `invoice-${orderId}.pdf`,
    );
  }

  /**
   * Email invoice
   */
  async emailInvoice(
    orderId: string,
    email?: string,
  ): Promise<{ message: string }> {
    return apiClient.post(`/orders/${orderId}/email-invoice`, { email });
  }

  // ========== RETURNS ==========

  /**
   * Request return
   */
  async requestReturn(
    orderId: string,
    items: Array<{ bookId: string; quantity: number }>,
    reason: string,
  ): Promise<{
    returnId: string;
    status: string;
  }> {
    return apiClient.post(`/orders/${orderId}/returns`, { items, reason });
  }

  /**
   * Get return status
   */
  async getReturnStatus(returnId: string): Promise<{
    status: string;
    trackingNumber?: string;
    estimatedRefund?: string;
  }> {
    return apiClient.get(`/orders/returns/${returnId}`);
  }

  /**
   * Process return (admin)
   */
  async processReturn(
    returnId: string,
    action: "approve" | "reject",
    notes?: string,
  ): Promise<{
    message: string;
    refundAmount?: number;
  }> {
    return apiClient.post(`/orders/returns/${returnId}/process`, {
      action,
      notes,
    });
  }

  // ========== ORDER STATISTICS ==========

  /**
   * Get order statistics
   */
  async getOrderStats(
    timeframe: "day" | "week" | "month" | "year" = "month",
  ): Promise<
    OrderStats & {
      chartData: Array<{ date: string; count: number; revenue: number }>;
    }
  > {
    return apiClient.get("/orders/stats", { params: { timeframe } });
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(
    dateFrom: string,
    dateTo: string,
  ): Promise<{
    total: number;
    byDay: Array<{ date: string; amount: number }>;
    byCategory: Array<{ category: string; amount: number }>;
    byPaymentMethod: Array<{ method: string; amount: number }>;
  }> {
    return apiClient.get("/orders/revenue-analytics", {
      params: { dateFrom, dateTo },
    });
  }

  // ========== CUSTOMER ORDERS ==========

  /**
   * Get customer's orders
   */
  async getCustomerOrders(
    customerId: string,
    filters?: Partial<OrderFilters>,
  ): Promise<{
    orders: Order[];
    total: number;
  }> {
    const params = { ...filters };
    return apiClient.get(`/orders/customer/${customerId}`, { params });
  }

  /**
   * Get order history for current user
   */
  async getMyOrders(filters?: Partial<OrderFilters>): Promise<{
    orders: Order[];
    total: number;
  }> {
    const params = { ...filters };
    return apiClient.get("/orders/my-orders", { params });
  }

  /**
   * Get recent orders for current user
   */
  async getRecentOrders(limit: number = 5): Promise<Order[]> {
    return apiClient.get("/orders/recent", { params: { limit } });
  }

  // ========== ORDER NOTES ==========

  /**
   * Add note to order
   */
  async addNote(
    orderId: string,
    note: string,
    isPublic: boolean = false,
  ): Promise<{
    id: string;
    note: string;
    createdAt: string;
    isPublic: boolean;
  }> {
    return apiClient.post(`/orders/${orderId}/notes`, { note, isPublic });
  }

  /**
   * Get order notes
   */
  async getNotes(orderId: string): Promise<
    Array<{
      id: string;
      note: string;
      createdAt: string;
      createdBy: string;
      isPublic: boolean;
    }>
  > {
    return apiClient.get(`/orders/${orderId}/notes`);
  }

  // ========== ORDER EXPORT ==========

  /**
   * Export orders to CSV/Excel
   */
  async exportOrders(
    format: "csv" | "excel",
    _filters?: OrderFilters,
  ): Promise<void> {
    return apiClient.download("/orders/export", `orders.${format}`);
  }

  /**
   * Export single order as PDF
   */
  async exportOrderAsPDF(orderId: string): Promise<void> {
    return apiClient.download(
      `/orders/${orderId}/export-pdf`,
      `order-${orderId}.pdf`,
    );
  }

  // ========== HELPER METHODS ==========

  private buildQueryParams(filters: OrderFilters): Record<string, any> {
    const params: Record<string, any> = {};

    if (filters.status?.length) params.status = filters.status.join(",");
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.minAmount !== undefined) params.minAmount = filters.minAmount;
    if (filters.maxAmount !== undefined) params.maxAmount = filters.maxAmount;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    return params;
  }

  /**
   * Check if order can be cancelled
   */
  async canCancelOrder(orderId: string): Promise<{
    canCancel: boolean;
    reason?: string;
    deadline?: string;
  }> {
    return apiClient.get(`/orders/${orderId}/can-cancel`);
  }

  /**
   * Get estimated delivery date
   */
  async getEstimatedDelivery(orderId: string): Promise<{
    estimated: string;
    guaranteed?: string;
  }> {
    return apiClient.get(`/orders/${orderId}/estimated-delivery`);
  }
}

// Export a singleton instance
export const ordersAPI = OrdersAPI.getInstance();
