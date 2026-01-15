import { redirect } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { getUserOrders } from '../actions';
import OrderHistoryClient from './OrderHistoryClient';

export default async function OrdersPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations();

  // Redirect to sign-in if not authenticated
  if (!session?.user) {
    redirect(`/${locale}`);
  }

  // Fetch user's orders
  const ordersResult = await getUserOrders();

  return (
    <OrderHistoryClient 
      orders={ordersResult.success ? ordersResult.data || [] : []}
      error={ordersResult.success ? undefined : ordersResult.error}
      locale={locale}
    />
  );
}
