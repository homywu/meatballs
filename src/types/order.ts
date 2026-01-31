import type { Product } from './product';

export interface OrderItem {
  id: string;
  product_id: string;
  name?: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface OrderData {
  customer_name: string;
  phone_number?: string;
  schedule_delivery_id: string;
  items: OrderItem[];
  total_amount: number;
  notes?: string;
  user_id?: string;
}

export interface Order extends OrderData {
  id: string;
  created_at: string;
  status: 'pending' | 'paid' | 'completed' | 'waitlist' | 'cancelled';
  reference_number?: string;
  user_id?: string;
  // Joined fields for display
  schedule_delivery?: {
    delivery_time: string;
    delivery_option: {
      label: string;
      address: string | null;
      description: string | null;
      map_url: string | null;
      delivery_method: string | null;
    }
  }
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: 'user' | 'admin';
  created_at: string;
}
