import type { OrderStatus } from '@/features/order/model/types';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Очікує оплати',
  PAID: 'Оплачено',
  FAILED: 'Не оплачено',
  CANCELLED: 'Скасовано',
};

export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
