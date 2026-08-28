export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export type AdminOrderItem = {
  id: number;
  menuItemId: string | null;
  name: string;
  photo: string | null;
  unitPrice: number;
  quantity: number;
};

export type AdminOrder = {
  uuid: string;
  restaurantId: string;
  status: OrderStatus;
  currency: string;
  totalAmount: number;
  monoInvoiceId: string | null;
  monoPageUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  table: { uuid: string; label: string } | null;
  items: AdminOrderItem[];
};
