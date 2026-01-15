'use server';

import { auth, signIn, signOut } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { OrderData, Order } from '@/types/order';

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
      .select('*')
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

    // Insert order into Supabase with user_id
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          customer_name: orderData.customer_name,
          phone_number: orderData.phone_number,
          delivery_method: orderData.delivery_method,
          delivery_address: orderData.delivery_address || null,
          items: orderData.items,
          total_amount: orderData.total_amount,
          notes: orderData.notes || null,
          status: 'pending',
          user_id: session.user.id
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit order'
      };
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}
