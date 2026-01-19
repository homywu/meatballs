'use server';

import { auth, signIn, signOut } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { OrderData, Order, OrderItem } from '@/types/order';

export async function getUserSession() {
  const session = await auth();
  return session;
}

export async function signInWithGoogle() {
  await signIn('google');
}

export async function signOutUser() {
  await signOut();
}

export async function getUserOrders(): Promise<{ success: boolean; data?: Order[]; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch orders'
      };
    }

    return {
      success: true,
      data: data as Order[]
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function submitOrder(orderData: OrderData) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Authentication required. Please sign in to place an order.'
      };
    }

    // Validate required fields
    if (!orderData.customer_name || !orderData.phone_number) {
      return {
        success: false,
        error: 'Customer name and phone number are required'
      };
    }

    if (!orderData.items || orderData.items.length === 0) {
      return {
        success: false,
        error: 'Order must contain at least one item'
      };
    }

    // Validate delivery method
    if (orderData.delivery_method === 'delivery' && !orderData.delivery_address) {
      return {
        success: false,
        error: 'Delivery address is required for delivery orders'
      };
    }

    // 1. Insert order into Supabase
    // Note: We don't verify success of items insert here as Supabase doesn't support transactions via REST API easily.
    // Ideally we'd use a stored procedure, but for now we'll do sequential.
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          customer_name: orderData.customer_name,
          phone_number: orderData.phone_number,
          delivery_method: orderData.delivery_method,
          delivery_address: orderData.delivery_address || null,
          total_amount: orderData.total_amount,
          notes: orderData.notes || null,
          status: 'pending',
          reference_number: generateReferenceNumber(),
          user_id: session.user.id
        }
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Supabase order error:', orderError);
      return {
        success: false,
        error: orderError.message || 'Failed to create order'
      };
    }

    // 2. Insert order items
    const itemsToInsert = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id || item.id, // Fallback to id if product_id not set in frontend yet
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Supabase items error:', itemsError);
      // Try to clean up the order
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return {
        success: false,
        error: itemsError.message || 'Failed to create order items'
      };
    }

    return {
      success: true,
      data: order
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function getAdminStats() {
  try {
    const session = await auth();
    // Check for admin role
    if (!session?.user?.id || session.user.role !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // Query unfulfilled items (pending or paid)
    // We want the sum of quantities grouped by product_id/name
    // Complex queries are hard with Supabase JS client. 
    // We can fetch all relevant order_items and aggregate in JS for simplicity unless dataset is huge.
    // Or we can use .rpc() if we made a function, but let's stick to simple JS aggregation for now.

    // First get unfulfilled order IDs
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .in('status', ['pending', 'paid']);

    if (ordersError) {
      throw ordersError;
    }

    const orderIds = orders.map(o => o.id);

    if (orderIds.length === 0) {
      return { success: true, data: [] };
    }

    // Get items for these orders
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('product_id, name, quantity')
      .in('order_id', orderIds);

    if (itemsError) {
      throw itemsError;
    }

    // Aggregate
    const stats: Record<string, { name: string; quantity: number }> = {};

    items.forEach((item) => {
      const key = item.product_id;
      if (!stats[key]) {
        stats[key] = { name: item.name, quantity: 0 };
      }
      stats[key].quantity += item.quantity;
    });

    return {
      success: true,
      data: Object.values(stats)
    };

  } catch (error) {
    console.error('Admin stats error:', error);
    return {
      success: false,
      error: 'Failed to fetch admin stats'
    };
  }
}

function generateReferenceNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude I, O, 0, 1, Q to avoid confusion
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
