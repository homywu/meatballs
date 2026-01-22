'use server';

import { auth, signIn, signOut } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { OrderData, Order, OrderItem } from '@/types/order';
import type { Product } from '@/types/product';

export async function getUserSession() {
  const session = await auth();
  return session;
}

export async function getProducts(): Promise<{ success: boolean; data?: Product[]; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { success: true, data: data as Product[] };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: 'Failed to fetch products' };
  }
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
      .select(`
        *, 
        items:order_items(*),
        schedule_delivery:schedule_deliveries(
          delivery_time,
          delivery_option:delivery_options(
            label,
            address,
            description,
            map_url,
            delivery_method
          )
        )
      `)
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
      data: data as unknown as Order[]
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function getInventoryStatus() {
  try {
    // 1. Get future schedule products
    // We only care about schedules that have valid delivery times in the future > NOW
    const nowISO = new Date().toISOString();

    // Get all future deliveries for PUBLISHED schedules
    const { data: futureDeliveries } = await supabaseAdmin
      .from('schedule_deliveries')
      .select('id, schedule_id, production_schedules!inner(status)')
      .gt('delivery_time', nowISO)
      .eq('production_schedules.status', 'published');

    const futureScheduleIds = Array.from(new Set(futureDeliveries?.map(d => d.schedule_id) || []));

    if (futureScheduleIds.length === 0) {
      return { success: true, data: {} };
    }

    // Get production quantities for these schedules
    const { data: production } = await supabaseAdmin
      .from('schedule_products')
      .select('product_id, quantity')
      .in('schedule_id', futureScheduleIds);

    // Get sold items linked to these schedules via orders -> schedule_delivery -> schedule_id
    // This join is tricky in Supabase JS.
    // Easier path: Query orders that have schedule_delivery_id IN (futureDeliveries ids)

    const futureDeliveryIds = futureDeliveries?.map(d => d.id) || [];

    const { data: used } = await supabaseAdmin
      .from('order_items')
      .select('product_id, quantity, orders!inner(status, schedule_delivery_id)')
      .in('orders.status', ['pending', 'paid', 'completed'])
      .in('orders.schedule_delivery_id', futureDeliveryIds);

    const inventory: Record<string, { total: number; remaining: number }> = {};

    // Sum production
    production?.forEach(item => {
      if (!inventory[item.product_id]) {
        inventory[item.product_id] = { total: 0, remaining: 0 };
      }
      inventory[item.product_id].total += item.quantity;
      inventory[item.product_id].remaining += item.quantity;
    });

    // Subtract used
    used?.forEach(item => {
      if (inventory[item.product_id]) {
        inventory[item.product_id].remaining -= item.quantity;
      }
    });

    // Ensure no negative
    Object.keys(inventory).forEach(key => {
      if (inventory[key].remaining < 0) inventory[key].remaining = 0;
    });

    return { success: true, data: inventory };
  } catch (error) {
    console.error('Inventory error:', error);
    return { success: false, error: 'Failed to fetch inventory' };
  }
}

export async function getAvailableDeliverySlots() {
  try {
    const now = new Date();
    // Logic: Available if delivery_time > NOW and cutoff_time (if set) > NOW.
    // Also, per requirements, we might want to filter out "Today".
    // Let's implement strict "tomorrow onwards" or just "delivery_time > now" + "cutoff > now".
    // User asked: "当delivery_date當天，用戶就不能再選擇這個option了" -> So strictly future dates.

    // Start of tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const { data, error } = await supabaseAdmin
      .from('schedule_deliveries')
      .select(`
        id,
        delivery_time,
        cutoff_time,
        schedule_id,
        delivery_option:delivery_options(*),
        production_schedules!inner(status)
      `)
      .gt('delivery_time', tomorrow.toISOString())
      .eq('production_schedules.status', 'published')
      .order('delivery_time', { ascending: true });

    if (error) throw error;

    // Further filter by cutoff_time if it exists
    const validSlots = data.filter(slot => {
      if (slot.cutoff_time) {
        return new Date(slot.cutoff_time) > now;
      }
      return true;
    });

    return { success: true, data: validSlots };
  } catch (error) {
    console.error('Get slots error:', error);
    return { success: false, error: 'Failed to fetch delivery slots' };
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

    if (!orderData.schedule_delivery_id) {
      return {
        success: false,
        error: 'Please select a delivery time'
      };
    }

    // 1. Validate Slot & Inventory
    // Fetch the slot to know the schedule_id and ensure it's PUBLISHED
    const { data: slot, error: slotError } = await supabaseAdmin
      .from('schedule_deliveries')
      .select('id, schedule_id, delivery_time, cutoff_time, production_schedules!inner(status)')
      .eq('id', orderData.schedule_delivery_id)
      .eq('production_schedules.status', 'published')
      .single();

    if (slotError || !slot) {
      return { success: false, error: 'Invalid delivery slot' };
    }

    // Check cutoff
    const now = new Date();
    if (slot.cutoff_time && new Date(slot.cutoff_time) <= now) {
      return { success: false, error: 'This delivery slot is no longer available (cutoff time passed)' };
    }

    // Check inventory SPECIFIC TO THIS SCHEDULE
    const { data: production } = await supabaseAdmin
      .from('schedule_products')
      .select('product_id, quantity')
      .eq('schedule_id', slot.schedule_id);

    const { data: used } = await supabaseAdmin
      .from('order_items')
      .select('quantity, product_id, orders!inner(schedule_delivery_id)')
      .eq('orders.schedule_delivery_id', slot.id) // Inventory is per Delivery Slot? NO, per Schedule.
    // Wait, multiple delivery slots can belong to the same schedule (same production batch).
    // So we need to sum usage across ALL delivery slots of this schedule.
    // Correction: fetch orders where linked schedule_delivery's schedule_id is THIS schedule_id.
    // This requires a join which is hard in one go. 
    // Alternative: We already fetched slot.schedule_id.
    // We need orders -> schedule_delivery -> schedule_id.
    // Let's filter orders by `schedule_delivery_id` IN (all slots of this schedule).

    // Get all slots for this schedule
    const { data: allSlots } = await supabaseAdmin
      .from('schedule_deliveries')
      .select('id')
      .eq('schedule_id', slot.schedule_id);

    const allSlotIds = allSlots?.map(s => s.id) || [];

    const { data: usedInSchedule } = await supabaseAdmin
      .from('order_items')
      .select('quantity, product_id, orders!inner(status, schedule_delivery_id)')
      .in('orders.status', ['pending', 'paid', 'completed'])
      .in('orders.schedule_delivery_id', allSlotIds);

    // Calculate remaining for this schedule
    const scheduleInventory: Record<string, number> = {};
    production?.forEach(p => scheduleInventory[p.product_id] = p.quantity);
    usedInSchedule?.forEach(u => {
      if (scheduleInventory[u.product_id]) {
        scheduleInventory[u.product_id] -= u.quantity;
      }
    });

    // Check if enough stock
    for (const item of orderData.items) {
      const available = scheduleInventory[item.id] || 0; // item.id is product_id
      if (available < item.quantity) {
        return { success: false, error: `Insufficient stock for ${item.name} for this delivery date.` };
      }
    }

    // 2. Create Order
    // No split logic anymore? "Waitlist" logic was complicated.
    // For simplicity with strict schedule slots, we usually enforce "Available" or "Error".
    // If the user wants waitlist, it should be a separate flow or implied.
    // Given the prompt "generate product schedule", let's simplify to "Must have stock".
    // IF stock is 0, they can't order.

    // Create Order
    const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          customer_name: orderData.customer_name,
          phone_number: orderData.phone_number,
          schedule_delivery_id: orderData.schedule_delivery_id,
          total_amount: totalAmount,
          notes: orderData.notes || null,
          status: 'pending',
          reference_number: generateReferenceNumber(),
          user_id: session.user.id
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    const itemsToInsert = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    return {
      success: true,
      data: {
        orders: [{ type: 'allocated', order }], // Keep partial structure for frontend compatibility
        message: 'Order placed successfully.'
      }
    };

  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

// Stats function remains similar but needs schema update
export async function getAdminStats(): Promise<{
  success: boolean;
  data?: { name: string; quantity: number }[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized access' };
    }

    // Fetch all pending order items
    const { data: pendingItems, error } = await supabaseAdmin
      .from('order_items')
      .select('name, quantity, orders!inner(status)')
      .eq('orders.status', 'pending');

    if (error) {
      console.error('Stats error:', error);
      return { success: false, error: 'Failed to fetch statistics' };
    }

    // Aggregate quantities by product name
    const statsMap = new Map<string, number>();
    pendingItems?.forEach((item) => {
      const current = statsMap.get(item.name) || 0;
      statsMap.set(item.name, current + item.quantity);
    });

    const data = Array.from(statsMap.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getAdminStats:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

function generateReferenceNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'CRAFT_' + result;
}
