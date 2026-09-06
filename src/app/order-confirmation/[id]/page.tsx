import { notFound } from 'next/navigation';
import { readData } from '@/lib/db';
import ConfirmationClient from './ConfirmationClient';

export const dynamic = 'force-dynamic';

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const data = await readData();
  const order = data.orders.find((o) => o.id === params.id);
  if (!order) notFound();
  return <ConfirmationClient order={order} />;
}
