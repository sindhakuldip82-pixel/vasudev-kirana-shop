import { OrderStatus } from '@/types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-indigo-100 text-indigo-700',
  PACKING: 'bg-amber-100 text-amber-700',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'New',
  ACCEPTED: 'Accepted',
  PACKING: 'Packing',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
